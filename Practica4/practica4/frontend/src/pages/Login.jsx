import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
export default function Login(){
  const [registro, setRegistro] = useState('');
  const [password, setPassword] = useState('');
  const nav = useNavigate();
  async function submit(e){
    e.preventDefault();
    const res = await fetch((import.meta.env.VITE_API_URL||'http://localhost:4000') + '/auth/login',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ registro, password })});
    const data = await res.json();
    if(res.ok){
      localStorage.setItem('token', data.token);
      localStorage.setItem('registro', data.user.registro);
      nav('/');
    } else {
      alert(data.error || JSON.stringify(data));
    }
  }
  return (
    <form onSubmit={submit}>
      <h3>Login</h3>
      <div><input placeholder="Registro" value={registro} onChange={e=>setRegistro(e.target.value)} /></div>
      <div><input placeholder="Contraseña" type="password" value={password} onChange={e=>setPassword(e.target.value)} /></div>
      <button>Entrar</button>
    </form>
  )
}
