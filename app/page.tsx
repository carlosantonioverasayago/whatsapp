"use client"
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// AHORA SÍ: TUS CREDENCIALES REALES INTEGRADAS
const SUPABASE_URL = "https://bzgqluegvremheryxkqx.supabase.co"; 
const SUPABASE_KEY = "sb_publishable_u7IpNiA7Ii5WqX-S_AjGQQ_fzSt0xC_";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const AVATARES = ["🐶", "🐱", "🦊", "🦁", "🤖", "🦄", "🚀", "😎"];

export default function WhatsAppPro() {
  const [messages, setMessages] = useState<any[]>([]);
  const = useState(""); 
  const [user, setUser] = useState<any>({ name: "", avatar: "" });
  const [isRegistered, setIsRegistered] = useState(false);
  const scrollRef = useRef<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('chat_profile');
    if (saved) { 
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed); 
        setIsRegistered(true);
      } catch (e) { localStorage.removeItem('chat_profile'); }
    }

    const fetchMsgs = async () => {
      const { data } = await supabase.from('messages').select('*').order('inserted_at', { ascending: true });
      if (data) setMessages(data);
    };

    fetchMsgs();
    const interval = setInterval(fetchMsgs, 3000); // Refresco cada 3 segs para el cole
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const enviar = async (e: any) => {
    e.preventDefault();
    if (!text.trim()) return;
    const msgEnviar = text;
    setText("");
    
    // Guardar en Supabase
    await supabase.from('messages').insert([{ 
      content: msgEnviar, 
      user_id: user.name, 
      avatar_url: user.avatar 
    }]);

    // Refresco manual inmediato
    const { data } = await supabase.from('messages').select('*').order('inserted_at', { ascending: true });
    if (data) setMessages(data);
  };

  if (!isRegistered) {
    return (
      <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#075e54', fontFamily:'sans-serif'}}>
        <div style={{background:'white', padding:'30px', borderRadius:'15px', textAlign:'center', width:'300px'}}>
          <h2 style={{color: '#075e54'}}>WhatsApp Cole 🚀</h2>
          <input 
            style={{width:'100%', padding:'10px', marginBottom:'15px', borderRadius:'5px', border:'1px solid #ccc', color:'black'}} 
            placeholder="Tu nombre..." 
            onChange={(e)=>setUser({...user, name: e.target.value})} 
          />
          <button 
            style={{width:'100%', padding:'12px', background:'#25d366', color:'white', border:'none', borderRadius:'5px', fontWeight:'bold'}} 
            onClick={()=>setIsRegistered(true)}
          >Entrar</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{display:'flex', flexDirection:'column', height:'100vh', background:'#efe7dd', fontFamily:'sans-serif'}}>
      <header style={{background:'#075e54', color:'white', padding:'15px', fontWeight:'bold'}}>
        <span>{user.avatar} {user.name}</span>
      </header>
      
      <main style={{flex:1, overflowY:'auto', padding:'20px', display:'flex', flexDirection:'column'}}>
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.user_id === user.name ? 'flex-end' : 'flex-start', 
            background: m.user_id === user.name ? '#e7ffdb' : '#fff',
            padding:'10px', borderRadius:'10px', marginBottom:'10px', maxWidth:'80%', boxShadow:'0 1px 1px rgba(0,0,0,0.1)'
          }}>
            <small style={{display:'block', fontSize:'10px', color:'#888'}}>{m.user_id}</small>
            <p style={{margin:0, color:'black'}}>{m.content}</p>
          </div>
        ))}
        <div ref={scrollRef} />
      </main>

      <footer style={{padding:'10px', background:'#f0f0f0'}}>
        <form onSubmit={enviar} style={{display:'flex', gap:'10px'}}>
          <input 
            style={{flex:1, padding:'12px', borderRadius:'20px', border:'none', color:'black'}} 
            value={text} 
            onChange={(e)=>setText(e.target.value)} 
            placeholder="Escribe un mensaje..." 
          />
          <button style={{background:'#075e54', color:'white', border:'none', borderRadius:'50%', width:'45px', height:'45px'}}>➤</button>
        </form>
      </footer>
    </div>
  );
}
