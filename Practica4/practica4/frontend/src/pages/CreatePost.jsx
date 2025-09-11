import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreatePost(){
  const [message, setMessage] = useState('');
  const [courses, setCourses] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [professorId, setProfessorId] = useState('');
  const nav = useNavigate();

  useEffect(() => {
    fetch((import.meta.env.VITE_API_URL||'http://localhost:4000') + '/courses')
      .then(r=>r.json()).then(setCourses);
    fetch((import.meta.env.VITE_API_URL||'http://localhost:4000') + '/professors')
      .then(r=>r.json()).then(setProfessors);
  }, []);

  async function submit(e){
    e.preventDefault();
    const token = localStorage.getItem('token');
    if(!token) return alert("Debes iniciar sesión");
    const res = await fetch((import.meta.env.VITE_API_URL||'http://localhost:4000') + '/posts', {
      method:'POST',
      headers:{ 'Content-Type':'application/json','Authorization':'Bearer '+token },
      body: JSON.stringify({ message, courseId: courseId||null, professorId: professorId||null })
    });
    if(res.ok){
      alert("✅ Publicación creada");
      nav('/');
    } else {
      const data = await res.json();
      alert(data.error || JSON.stringify(data));
    }
  }

  return (
    <form onSubmit={submit}>
      <h3>Crear Publicación</h3>
      <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Escribe tu valoración" required />
      <div>
        <label>Curso:</label>
        <select value={courseId} onChange={e=>setCourseId(e.target.value)}>
          <option value="">-- Ninguno --</option>
          {courses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label>Profesor:</label>
        <select value={professorId} onChange={e=>setProfessorId(e.target.value)}>
          <option value="">-- Ninguno --</option>
          {professors.map(p=><option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
        </select>
      </div>
      <button>Publicar</button>
    </form>
  )
}
