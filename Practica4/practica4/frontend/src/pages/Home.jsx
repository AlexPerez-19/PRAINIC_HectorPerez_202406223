import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
export default function Home(){
  const [posts, setPosts] = useState([]);
  useEffect(()=>{ fetch((import.meta.env.VITE_API_URL||'http://localhost:4000') + '/posts').then(r=>r.json()).then(setPosts).catch(console.error)},[]);
  return (
    <div>
      <h3>Feed</h3>
      <div style={{ marginBottom: '10px' }}>
      <Link to="/create-post">➕ Nueva Publicación</Link>
      </div>
      <div>
        {posts.length===0 && <p>No hay publicaciones aún.</p>}
        {posts.map(p=>(
          <div key={p.id} style={{border:'1px solid #ddd', padding:10, marginBottom:8}}>
            <div><strong>{p.author.firstName} {p.author.lastName}</strong> — {new Date(p.createdAt).toLocaleString()}</div>
            <div>{p.message}</div>
            <div><Link to={'/post/'+p.id}>Ver publicación</Link></div>
          </div>
        ))}
      </div>
    </div>
  )
}
