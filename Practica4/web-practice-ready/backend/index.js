require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
const PORT = process.env.PORT || 4000;

// helper
function generateToken(payload, expiresIn = '7d'){
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

// Auth: register
app.post('/auth/register', async (req, res) => {
  try {
    const { registro, firstName, lastName, email, password } = req.body;
    if(!registro || !firstName || !lastName || !email || !password) return res.status(400).json({ error: 'Missing fields' });
    const existing = await prisma.user.findUnique({ where: { registro }});
    if(existing) return res.status(400).json({ error: 'Registro already exists' });
    const passHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { registro, firstName, lastName, email, passwordHash: passHash }
    });
    const token = generateToken({ registro });
    res.json({ user: { registro: user.registro, firstName: user.firstName, lastName: user.lastName, email: user.email }, token });
  } catch(e){
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Auth: login
app.post('/auth/login', async (req, res) => {
  try {
    const { registro, password } = req.body;
    if(!registro || !password) return res.status(400).json({ error: 'Missing fields' });
    const user = await prisma.user.findUnique({ where: { registro }});
    if(!user) return res.status(400).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if(!ok) return res.status(400).json({ error: 'Invalid credentials' });
    const token = generateToken({ registro });
    res.json({ token, user: { registro: user.registro, firstName: user.firstName, lastName: user.lastName, email: user.email }});
  } catch(e){
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Forgot password: generate a reset token and (optionally) send by email
app.post('/auth/forgot', async (req,res) => {
  try {
    const { registro, email } = req.body;
    if(!registro || !email) return res.status(400).json({ error: 'Missing fields' });
    const user = await prisma.user.findUnique({ where: { registro }});
    if(!user || user.email !== email) return res.status(400).json({ error: 'Registro/email mismatch' });
    const token = generateToken({ registro }, '1h');
    // store token in PasswordReset table
    await prisma.passwordReset.create({ data: { registro, token }});
    // try to send email if SMTP configured
    if(process.env.SMTP_HOST){
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'no-reply@example.com',
        to: user.email,
        subject: 'Reset de contraseña',
        text: `Usa este link para resetear tu contraseña: ${resetUrl}`
      });
    } else {
      console.log('Reset token (no SMTP configured):', token);
    }
    res.json({ ok: true, message: 'Si existe la cuenta se ha enviado información para resetear (token almacenado).' });
  } catch(e){
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reset
app.post('/auth/reset', async (req,res) => {
  try {
    const { token, newPassword } = req.body;
    if(!token || !newPassword) return res.status(400).json({ error: 'Missing fields' });
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch(e){
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    const registro = payload.registro;
    const record = await prisma.passwordReset.findFirst({ where: { registro, token }});
    if(!record) return res.status(400).json({ error: 'Token not found' });
    const passHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { registro }, data: { passwordHash: passHash }});
    // delete token
    await prisma.passwordReset.deleteMany({ where: { registro }});
    res.json({ ok: true });
  } catch(e){
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Middleware: auth
async function authMiddleware(req,res,next){
  const header = req.headers.authorization;
  if(!header) return res.status(401).json({ error: 'No token' });
  const parts = header.split(' ');
  if(parts.length !== 2) return res.status(401).json({ error: 'Invalid token format' });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch(e){
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Posts - list with filters
app.get('/posts', async (req,res) => {
  try {
    const { courseId, professorId, q, page = 1, limit = 20 } = req.query;
    const where = {};
    if(courseId) where.courseId = Number(courseId);
    if(professorId) where.professorId = Number(professorId);
    if(q){
      where.message = { contains: String(q), mode: 'insensitive' };
    }
    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { author: true, comments: { include: { author: true } }, course: true, professor: true },
      skip: (Number(page)-1)*Number(limit),
      take: Number(limit)
    });
    res.json(posts);
  } catch(e){
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create post
app.post('/posts', authMiddleware, async (req,res) => {
  try {
    const { courseId, professorId, message } = req.body;
    if(!message) return res.status(400).json({ error: 'Message required' });
    const post = await prisma.post.create({
      data: {
        message,
        authorRegistro: req.user.registro,
        courseId: courseId ? Number(courseId) : null,
        professorId: professorId ? Number(professorId) : null
      },
      include: { author: true, course: true, professor: true }
    });
    res.json(post);
  } catch(e){
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/posts/:id', async (req,res) => {
  try {
    const id = Number(req.params.id);
    const post = await prisma.post.findUnique({ where: { id }, include: { author: true, comments: { include: { author: true } }, course: true, professor: true }});
    if(!post) return res.status(404).json({ error: 'Not found' });
    res.json(post);
  } catch(e){
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/posts/:id/comments', authMiddleware, async (req,res) => {
  try {
    const postId = Number(req.params.id);
    const { message } = req.body;
    if(!message) return res.status(400).json({ error: 'Message required' });
    const comment = await prisma.comment.create({
      data: {
        postId,
        authorRegistro: req.user.registro,
        message
      },
      include: { author: true }
    });
    res.json(comment);
  } catch(e){
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Users
app.get('/users/:registro', async (req,res) => {
  try {
    const registro = req.params.registro;
    const user = await prisma.user.findUnique({ where: { registro }, include: { approvedCourses: { include: { course: true } } }});
    if(!user) return res.status(404).json({ error: 'Not found' });
    res.json({ registro: user.registro, firstName: user.firstName, lastName: user.lastName, email: user.email, createdAt: user.createdAt, approvedCourses: user.approvedCourses });
  } catch(e){
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/users/:registro', authMiddleware, async (req,res) => {
  try {
    const registro = req.params.registro;
    if(registro !== req.user.registro) return res.status(403).json({ error: 'Forbidden' });
    const { firstName, lastName, email } = req.body;
    const user = await prisma.user.update({ where: { registro }, data: { firstName, lastName, email }});
    res.json({ registro: user.registro, firstName: user.firstName, lastName: user.lastName, email: user.email });
  } catch(e){
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Courses & Professors for filters
app.get('/courses', async (req,res) => {
  const courses = await prisma.course.findMany();
  res.json(courses);
});
app.get('/professors', async (req,res) => {
  const profs = await prisma.professor.findMany();
  res.json(profs);
});

// Add approved course to user
app.post('/users/:registro/courses', authMiddleware, async (req,res) => {
  try {
    const registro = req.params.registro;
    if(registro !== req.user.registro) return res.status(403).json({ error: 'Forbidden' });
    const { courseId } = req.body;
    const rec = await prisma.userCourse.create({ data: { userRegistro: registro, courseId: Number(courseId), approved: true }, include: { course: true }});
    res.json(rec);
  } catch(e){
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log('Server running on', PORT);
});
