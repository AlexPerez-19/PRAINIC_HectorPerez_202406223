import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function Profile(){
  const { registro } = useParams();
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');

  useEffect(()=>{
    fetch((import.meta.env.VITE_API_URL||'http://localhost:4000') + '/users/' + registro)
      .then(r=>r.json()).then(setUser);
    fetch((import.meta.env.VITE_API_URL||'http://localhost:4000') + '/courses')
      .then(r=>r.json()).then(setCourses);
  },[registro]);

  async function addCourse(e){
    e.preventDefault();
    const token = localStorage.getItem('token');
    if(!token) return alert("Debes iniciar sesión");
    const res = await fetch((import.meta.env.VITE_API_URL||'http://localhost:4000') + '/users/' + registro + '/courses', {
      method:'POST',
      headers:{ 'Content-Type':'application/json','Authorization':'Bearer '+token },
      body: JSON.stringify({ courseId: selectedCourse })
    });
    const data = await res.json();
    if(res.ok){
      setUser(prev=>({...prev, approvedCourses:[...prev.approvedCourses, data]}));
    } else alert(data.error || JSON.stringify(data));
  }

  if(!user) return <div>Cargando perfil...</div>;

  return (
    <div>
      <h3>Perfil de {user.firstName} {user.lastName}</h3>
      <div>Registro: {user.registro}</div>
      <div>Email: {user.email}</div>
      <h4>Cursos aprobados</h4>
      <ul>
        {user.approvedCourses.map(ac => <li key={ac.id}>{ac.course.name} ({ac.course.credits} créditos)</li>)}
      </ul>
      {registro === localStorage.getItem('registro') && (
        <form onSubmit={addCourse}>
          <select value={selectedCourse} onChange={e=>setSelectedCourse(e.target.value)}>
            <option value="">-- Selecciona curso --</option>
            {courses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button>Añadir</button>
        </form>
      )}
    </div>
  )
}
