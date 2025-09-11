# Manual Técnico - Practica Desarrollo Web

## Arquitectura
- Frontend: React (Vite)
- Backend: Node.js + Express
- ORM: Prisma (MySQL)
- Base de datos: MySQL (configurable via DATABASE_URL)

## Variables de entorno (backend - .env)
- DATABASE_URL: `mysql://USER:PASS@HOST:3306/DATABASE`
- JWT_SECRET: secreto para firmar tokens JWT
- FRONTEND_URL: url pública del frontend para enlaces de reset
- (Opcional) SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM

## Principales endpoints
- `POST /auth/register` — Registro. Body: { registro, firstName, lastName, email, password }
- `POST /auth/login` — Login. Body: { registro, password }
- `POST /auth/forgot` — Solicitar reset. Body: { registro, email }
- `POST /auth/reset` — Reset. Body: { token, newPassword }
- `GET /posts` — Listar posts (filters: courseId, professorId, q)
- `POST /posts` — Crear post (Authorization: Bearer token)
- `POST /posts/:id/comments` — Comentar (Authorization)
- `GET /users/:registro` — Ver perfil
- `PUT /users/:registro` — Editar perfil (solo propio)

## Esquema de la base de datos (Prisma)
Ver `prisma/schema.prisma`.

## Cómo ejecutar (local)
1. Backend:
   - `cd backend`
   - `npm install`
   - Configurar `.env` con DATABASE_URL y JWT_SECRET
   - `npx prisma generate`
   - Ejecutar migración: `npx prisma migrate dev --name init`
   - `npm run seed`
   - `npm start`

2. Frontend:
   - `cd frontend`
   - `npm install`
   - `npm run dev` (arranca en http://localhost:3000)

## Git
- Mantener commits descriptivos (req. del enunciado)
- Separar trabajo en branches: `feature/auth`, `feature/posts`, etc.

