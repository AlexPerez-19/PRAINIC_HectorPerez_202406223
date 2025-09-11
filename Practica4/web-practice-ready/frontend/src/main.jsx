import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import PostDetail from './pages/PostDetail'
import Profile from './pages/Profile'
import CreatePost from './pages/CreatePost';

function App(){
  return (
    <BrowserRouter>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 20 }}>
        <header style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <h2>Practica · Evaluaciones</h2>
          <nav>
            <Link to="/">Home</Link> | <Link to="/login">Login</Link> | <Link to="/register">Register</Link>
          </nav>
        </header>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/post/:id" element={<PostDetail/>} />
          <Route path="/profile/:registro" element={<Profile/>} />
          <Route path="/create-post" element={<CreatePost/>} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(<App />)
