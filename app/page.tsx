"use client"
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// TUS CREDENCIALES REALES
const SUPABASE_URL = "https://supabase.co"; 
const SUPABASE_KEY = "sb_publishable_u7IpNiA7Ii5WqX-S_AjGQQ_fzSt0xC_";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const AVATARES = ["🐶", "🐱", "🦊", "🦁", "🤖", "🦄", "🚀", "😎"];

export default function WhatsAppPro() {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState(""); 
  const [user, setUser] = useState<any>({ name: "", avatar: "" });
  const [isRegistered, setIsRegistered] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const scrollRef = useRef<any>(null);

  // Función para traer mensajes de la nube
  const fetchMsgs = async () => {
    try {
      const { data, error } = await supabase.from('messages').select('*').order('inserted_at', { ascending: true });
      if (error) throw error;
      if (data) {
        setMessages(data);
        setIsConnected(true);
        localStorage.setItem('local_msgs', JSON.stringify(data)); // Guardar copia en el Chromebook
      }
    } catch (e) {
      setIsConnected(false); // Si falla, es que el WiFi del cole bloquea
    }
  };

  useEffect(() => {
    // 1. Cargar perfil guardado
    const saved = localStorage.getItem('chat_profile');
    if (saved) { setUser(JSON.parse(saved)); setIsRegistered(true); }

    // 2. Cargar mensajes locales por si no hay conexión
    const local = localStorage.getItem('local_msgs');
    if (local) setMessages(JSON.parse(local));

    // 3. Intentar conectar a Supabase
    fetchMsgs();
    const interval = setInterval(fetchMsgs, 4000); // Preguntar cada 4 segs
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const enviar = async (e: any) => {
    e.preventDefault();
    if (!text.trim()) return;

    const nuevoMsg = { 
      content: text, 
      user_id: user.name, 
      avatar_url: user.avatar,
      inserted_at: new Date().toISOString()
    };

    // Mostrar en pantalla al instante (Modo Local)
    const tempMessages = [...messages, nuevoMsg];
    setMessages(tempMessages);
    localStorage.setItem('local_msgs', JSON.stringify(tempMessages));
    setText("");

    // Intentar subir a Supabase
    await supabase.from('messages').insert([nuevoMsg]);
    fetchMsgs(); // Refrescar tras enviar
  };

  if (!isRegistered) {
    return (
      <div style={styles.setupBg}>
        <div style={styles.setupCard}>
          <h2 style={{color: '#075e54'}}>WhatsApp Cole 🚀</h2>
          <input 
            style={styles.setupInput} 
            placeholder="Tu nombre..." 
            value={user.name}
            onChange={(e) => setUser({...user, name: e.target.value})} 
          />
          <div style={styles.avatarGrid}>
            {AVATARES.map(a => (
              <div key={a} onClick={() => setUser({...user, avatar: a})} 
                   style={{...styles.avatarOption, background: user.avatar === a ? '#dcf8c6' : 'transparent'}}>{a}</div>
            ))}
          </div>
          <button style={styles.setupBtn} onClick={() => {
            if(user.name && user.avatar) {
              localStorage.setItem('chat_profile', JSON.stringify(user));
              setIsRegistered(true);
            }
          }}>Entrar al Chat</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.appContainer}>
      <header style={styles.header}>
        <span>{user.avatar} {user.name}</span>
        <span style={{fontSize: '12px'}}>{isConnected ? '🟢 En línea' : '🔴 WiFi bloqueado'}</span>
      </header>
      
      <main style={styles.chatArea}>
        {messages.map((m, i) => (
          <div key={i} style={{...styles.bubble, alignSelf: m.user_id === user.name ? 'flex-end' : 'flex-start', backgroundColor: m.user_id === user.name ? '#e7ffdb' : '#fff'}}>
            <small style={{display: 'block', fontSize: '10px', color: '#888'}}>{m.user_id}</small>
            <p style={{margin: 0, color: '#000'}}>{m.content}</p>
          </div>
        ))}
        <div ref={scrollRef} />
      </main>

      <footer style={styles.footer}>
        <form onSubmit={enviar} style={{display: 'flex', gap: '10px'}}>
          <input style={styles.input} value={text} onChange={(e) => setText(e.target.value)} placeholder="Escribe un mensaje..." />
          <button style={styles.sendBtn}>➤</button>
        </form>
      </footer>
    </div>
  );
}

const styles: any = {
  appContainer: { display: 'flex', flexDirection: 'column', height: '100vh', background: '#efe7dd', fontFamily: 'sans-serif' },
  header: { background: '#075e54', color: '#fff', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  chatArea: { flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column' },
  bubble: { padding: '8px 12px', borderRadius: '10px', marginBottom: '8px', maxWidth: '75%', boxShadow: '0 1px 1px rgba(0,0,0,0.1)' },
  footer: { padding: '10px', background: '#f0f0f0' },
  input: { flex: 1, padding: '12px', borderRadius: '20px', border: 'none', outline: 'none', color: '#000' },
  sendBtn: { background: '#075e54', color: '#fff', border: 'none', borderRadius: '50%', width: '45px', height: '45px', cursor: 'pointer' },
  setupBg: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#075e54' },
  setupCard: { background: '#fff', padding: '30px', borderRadius: '15px', textAlign: 'center', width: '300px' },
  setupInput: { width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ccc', color: '#000' },
  avatarGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '15px' },
  avatarOption: { fontSize: '24px', cursor: 'pointer', padding: '5px', borderRadius: '50%' },
  setupBtn: { width: '100%', padding: '12px', background: '#25d366', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold' }
};
