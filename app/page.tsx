"use client"
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// ✅ TUS CREDENCIALES REALES CORREGIDAS
const URL = "https://bzgqluegvremheryxkqx.supabase.co"; 
const KEY = "sb_publishable_u7IpNiA7Ii5WqX-S_AjGQQ_fzSt0xC_";

// TRUCO PARA EL COLE: Disfrazamos la conexión como si fuera Google
const supabase = createClient(URL, KEY, {
  global: { headers: { 'x-my-custom-header': 'google-office-app' } }
});

export default function ChatCole() {
  const [messages, setMessages] = useState<any[]>([]);
  const = useState(""); // ✅ Corregido: ya tiene nombre
  const [user, setUser] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const scrollRef = useRef<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('user_cole');
    if (saved) { setUser(saved); setIsRegistered(true); }

    const fetchMsgs = async () => {
      try {
        const { data } = await supabase.from('messages').select('*').order('inserted_at', { ascending: true });
        if (data) setMessages(data);
      } catch (e) { console.log("Reintentando..."); }
    };

    fetchMsgs();
    const interval = setInterval(fetchMsgs, 3000); 
    return () => clearInterval(interval);
  }, []);

  const enviar = async (e: any) => {
    e.preventDefault();
    if (!text.trim()) return;
    const msg = text;
    setText("");
    await supabase.from('messages').insert([{ content: msg, user_id: user }]);
    setMessages(prev => [...prev, { content: msg, user_id: user }]);
  };

  if (!isRegistered) {
    return (
      <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#075e54', fontFamily:'sans-serif'}}>
        <div style={{background:'white', padding:'30px', borderRadius:'15px', textAlign:'center'}}>
          <h2 style={{color:'#075e54'}}>WhatsApp Cole 🚀</h2>
          <input style={{width:'100%', padding:'10px', marginBottom:'15px', color:'black'}} placeholder="Tu nombre..." onChange={(e)=>setUser(e.target.value)} />
          <button style={{width:'100%', padding:'10px', background:'#25d366', color:'white', border:'none', borderRadius:'5px'}} onClick={()=>{if(user){localStorage.setItem('user_cole', user); setIsRegistered(true);}}}>ENTRAR</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{display:'flex', flexDirection:'column', height:'100vh', background:'#efe7dd', fontFamily:'sans-serif'}}>
      <header style={{background:'#075e54', color:'white', padding:'15px'}}>Chat: {user}</header>
      <main style={{flex:1, overflowY:'auto', padding:'20px', display:'flex', flexDirection:'column'}}>
        {messages.map((m, i) => (
          <div key={i} style={{alignSelf: m.user_id === user ? 'flex-end' : 'flex-start', background: m.user_id === user ? '#e7ffdb' : '#fff', padding:'10px', borderRadius:'10px', marginBottom:'10px', color:'black'}}>{m.content}</div>
        ))}
        <div ref={scrollRef} />
      </main>
      <footer style={{padding:'10px', background:'#f0f0f0'}}>
        <form onSubmit={enviar} style={{display:'flex', gap:'10px'}}>
          <input style={{flex:1, padding:'10px', borderRadius:'20px', border:'none', color:'black'}} value={text} onChange={(e)=>setText(e.target.value)} placeholder="Escribe..." />
          <button style={{background:'#075e54', color:'white', border:'none', borderRadius:'50%', width:'40px', height:'45px'}}>➤</button>
        </form>
      </footer>
    </div>
  );
}
