import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
export default function PostDetail(){
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [msg, setMsg] = useState('');
  useEffect(()=>{ fetch((import.meta.env.VITE_API_URL||'http://localhost:4000') + '/posts/' + id).then(r=>r.json()).then(setPost).catch(console.error)},[id]);
  async function comment(e){
    e.preventDefault();
    const token = localStorage.getItem('token');
    if(!token) return alert('Debes iniciar sesión');
    const res = await fetch((import.meta.env.VITE_API_URL||'http://localhost:4000') + '/posts/' + id + '/comments',{method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+token}, body: JSON.stringify({ message: msg })});
    const data = await res.json();
    if(res.ok){
      setPost(prev => ({ ...prev, comments: [ ...(prev?.comments||[]), data ] }));
      setMsg('');
    } else alert(data.error || JSON.stringify(data));
  }
  if(!post) return <div>Cargando...</div>
  return (
    <div>
      <h3>Publicación</h3>
      <div><strong>{post.author.firstName} {post.author.lastName}</strong></div>
      <div>{post.message}</div>
      <h4>Comentarios</h4>
      {post.comments.map(c=>(
        <div key={c.id} style={{borderTop:'1px solid #eee', paddingTop:6}}>
          <div><strong>{c.author.firstName} {c.author.lastName}</strong></div>
          <div>{c.message}</div>
        </div>
      ))}
      <form onSubmit={comment}>
        <textarea value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Escribe un comentario" />
        <button>Comentar</button>
      </form>
    </div>
  )
}
