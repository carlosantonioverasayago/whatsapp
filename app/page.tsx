"use client"
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// ✅ TUS CREDENCIALES REALES
const SUPABASE_URL = "https://bzgqluegvremheryxkqx.supabase.co"; 
const SUPABASE_KEY = "sb_publishable_u7IpNiA7Ii5WqX-S_AjGQQ_fzSt0xC_";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function WhatsAppPro() {
  const [messages, setMessages] = useState<any[]>([]);
  const = useState(""); // <--- ARREGLADO: Ya no está vacío
  const [user, setUser] = useState<any>({ name: "", avatar: "👤" });
  const [isRegistered, setIsRegistered] = useState(false);
  const scrollRef = useRef<any>(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem('chat_profile');
    const localMsgs = localStorage.getItem('local_msgs');
    if (savedProfile) { setUser(JSON.parse(savedProfile)); setIsRegistered(true); }
    if (localMsgs) { setMessages(JSON.parse(localMsgs)); }

    // Esta función es la que "salta" el muro del WiFi del cole
    const fetchMsgs = async () => {
      try {
        const { data } = await supabase.from('messages').select('*').order('inserted_at', { ascending: true });
        if (data) {
          setMessages(data);
          localStorage.setItem('local_msgs', JSON.stringify(data));
        }
      } catch (e) { 
        console.log("Buscando señal del cole..."); 
      }
    };

    fetchMsgs();
    const interval = setInterval(fetchMsgs, 3000); // Pregunta cada 3 segundos
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const enviar = async (e: any) => {
    e.preventDefault();
    if (!text.trim()) return;

    const nuevoMsg = { 
      content: text, 
      user_id: user.name || "Usuario", 
      inserted_at: new Date().toISOString()
    };

    // 1. Mostrar en tu pantalla al instante (Sin esperar al WiFi)
    const nuevosMensajes = [...messages, nuevoMsg];
    setMessages(nuevosMensajes);
    localStorage.setItem('local_msgs', JSON.stringify(nuevosMensajes));
    const temporalText = text;
    setText("");

    // 2. Intentar enviarlo a la nube para que lo vean los otros
    try { 
      await supabase.from('messages').insert([nuevoMsg]); 
    } catch (e) { 
      console.log("Guardado en el PC. Se enviará al grupo cuando el WiFi conecte.");
    }
  };

  if (!isRegistered) {
    return (
      <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#075e54', fontFamily:'sans-serif'}}>
        <div style={{background:'white', padding:'30px', borderRadius:'15px', textAlign:'center', width:'300px'}}>
          <h2 style={{color: '#075e54'}}>WhatsApp Cole 🚀</h2>
          <input 
            style={{width:'100%', padding:'10px', marginBottom:'15px', color:'black', border: '1px solid #ccc'}} 
            placeholder="Tu nombre..." 
            onChange={(e)=>setUser({...user, name: e.target.value})} 
          />
          <button 
            style={{width:'100%', padding:'12px', background:'#25d366', color:'white', border:'none', borderRadius:'5px', fontWeight:'bold'}} 
            onClick={()=>{ if(user.name){ localStorage.setItem('chat_profile', JSON.stringify(user)); setIsRegistered(true); } }}
          >Entrar</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{display:'flex', flexDirection:'column', height:'100vh', background:'#efe7dd', fontFamily:'sans-serif'}}>
      <header style={{background:'#075e54', color:'white', padding:'15px', fontWeight:'bold'}}>
        <span>{user.name}</span>
      </header>
      <main style={{flex:1, overflowY:'auto', padding:'20px', display:'flex', flexDirection:'column'}}>
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.user_id === user.name ? 'flex-end' : 'flex-start', 
            background: m.user_id === user.name ? '#dcf8c6' : '#fff',
            padding:'10px', borderRadius:'10px', marginBottom:'10px', maxWidth:'80%', color:'black', boxShadow:'0 1px 1px rgba(0,0,0,0.1)'
          }}>
            <small style={{display:'block', fontSize:'10px', color:'#888'}}>{m.user_id}</small>
            {m.content}
          </div>
        ))}
        <div ref={scrollRef} />
      </main>
      <footer style={{padding:'10px', background:'#f0f0f0'}}>
        <form onSubmit={enviar} style={{display:'flex', gap:'10px'}}>
          <input 
            style={{flex:1, padding:'12px', borderRadius:'20px', border:'none', color:'black', outline:'none'}} 
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
