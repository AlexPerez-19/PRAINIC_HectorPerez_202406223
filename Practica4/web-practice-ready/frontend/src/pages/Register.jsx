import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
export default function Register(){
  const [registro, setRegistro] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const nav = useNavigate();
  async function submit(e){
    e.preventDefault();
    const res = await fetch((import.meta.env.VITE_API_URL||'http://localhost:4000') + '/auth/register',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ registro, firstName, lastName, email, password })});
    const data = await res.json();
    if(res.ok || res.token){
      alert('Registrado correctamente');
      nav('/login');
    } else {
      if(res.error) alert(data.error);
      else alert(JSON.stringify(data));
    }
  }
  return (
    <form onSubmit={submit}>
      <h3>Registro</h3>
      <div><input placeholder="Registro" value={registro} onChange={e=>setRegistro(e.target.value)} /></div>
      <div><input placeholder="Nombres" value={firstName} onChange={e=>setFirstName(e.target.value)} /></div>
      <div><input placeholder="Apellidos" value={lastName} onChange={e=>setLastName(e.target.value)} /></div>
      <div><input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} /></div>
      <div><input placeholder="Contraseña" type="password" value={password} onChange={e=>setPassword(e.target.value)} /></div>
      <button>Crear cuenta</button>
    </form>
  )
}
