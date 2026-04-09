"use client"
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const URL = "https://supabase.co"; 
const KEY = "sb_publishable_u7IpNiA7Ii5WqX-S_AjGQQ_fzSt0xC_";
const supabase = createClient(URL, KEY);

export default function ChatGuerrilla() {
  const [messages, setMessages] = useState<any[]>([]);
  const = useState(""); 
  const [user, setUser] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [pending, setPending] = useState<any[]>([]); // Mensajes que esperan WiFi
  const scrollRef = useRef<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('user_cole');
    if (saved) { setUser(saved); setIsRegistered(true); }

    // 1. Cargar mensajes locales para no ver la pantalla en blanco
    const local = localStorage.getItem('local_msgs');
    if (local) setMessages(JSON.parse(local));

    const sync = async () => {
      try {
        // 2. Intentar bajar mensajes nuevos de los demás
        const { data } = await supabase.from('messages').select('*').order('inserted_at', { ascending: true });
        if (data) {
          setMessages(data);
          localStorage.setItem('local_msgs', JSON.stringify(data));
        }

        // 3. ¡EL TRUCO! Si hay mensajes pendientes, intentar enviarlos ahora
        const queue = JSON.parse(localStorage.getItem('pending_msgs') || "[]");
        if (queue.length > 0) {
          for (const msg of queue) {
            await supabase.from('messages').insert([msg]);
          }
          localStorage.setItem('pending_msgs', "[]"); // Limpiar cola tras enviar
          setPending([]);
        }
      } catch (e) { console.log("Sin WiFi: Guardando en memoria local..."); }
    };

    const i = setInterval(sync, 4000);
    return () => clearInterval(i);
  }, []);

  const enviar = async (e: any) => {
    e.preventDefault();
    if (!text.trim()) return;

    const nuevoMsg = { content: text, user_id: user, inserted_at: new Date().toISOString() };
    
    // Guardar en la pantalla y en la cola del Chromebook inmediatamente
    const nuevasMsgs = [...messages, nuevoMsg];
    setMessages(nuevasMsgs);
    localStorage.setItem('local_msgs', JSON.stringify(nuevasMsgs));
    
    const queue = JSON.parse(localStorage.getItem('pending_msgs') || "[]");
    localStorage.setItem('pending_msgs', JSON.stringify([...queue, nuevoMsg]));
    
    setText("");

    // Intentar enviar al instante (si hay WiFi, se envía; si no, el intervalo lo hará luego)
    try { await supabase.from('messages').insert([nuevoMsg]); } catch (e) { }
  };

  if (!isRegistered) {
    return (
      <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#075e54', fontFamily:'sans-serif'}}>
        <div style={{background:'white', padding:'30px', borderRadius:'15px', textAlign:'center'}}>
          <h2 style={{color:'#075e54'}}>Chat de Guerrilla 🥷</h2>
          <input style={{width:'100%', padding:'10px', marginBottom:'15px', color:'black'}} placeholder="Tu nombre..." onChange={(e)=>setUser(e.target.value)} />
          <button style={{width:'100%', padding:'10px', background:'#25d366', color:'white', border:'none', borderRadius:'5px'}} onClick={()=>{if(user){localStorage.setItem('user_cole', user); setIsRegistered(true);}}}>ENTRAR</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{display:'flex', flexDirection:'column', height:'100vh', background:'#efe7dd', fontFamily:'sans-serif'}}>
      <header style={{background:'#075e54', color:'white', padding:'15px', display:'flex', justifyContent:'space-between'}}>
        <span>Chat: {user}</span>
        <button onClick={() => { localStorage.clear(); location.reload(); }} style={{background:'none', border:'1px solid white', color:'white', fontSize:'10px'}}>Reset</button>
      </header>
      <main style={{flex:1, overflowY:'auto', padding:'20px', display:'flex', flexDirection:'column'}}>
        {messages.map((m, i) => (
          <div key={i} style={{alignSelf: m.user_id === user ? 'flex-end' : 'flex-start', background: m.user_id === user ? '#e7ffdb' : '#fff', padding:'10px', borderRadius:'10px', marginBottom:'10px', color:'black', maxWidth:'80%'}}>
            <small style={{display:'block', color:'#888', fontSize:'10px'}}>{m.user_id}</small>
            {m.content}
          </div>
        ))}
        <div ref={scrollRef} />
      </main>
      <footer style={{padding:'10px', background:'#f0f0f0'}}>
        <form onSubmit={enviar} style={{display:'flex', gap:'10px'}}>
          <input style={{flex:1, padding:'10px', borderRadius:'20px', border:'none', color:'black'}} value={text} onChange={(e)=>setText(e.target.value)} placeholder="Escribe aunque no haya WiFi..." />
          <button style={{background:'#075e54', color:'white', border:'none', borderRadius:'50%', width:'40px', height:'45px'}}>➤</button>
        </form>
      </footer>
    </div>
  );
}
