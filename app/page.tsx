"use client"
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://supabase.co"; 
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
    const savedProfile = localStorage.getItem('chat_profile');
    const localMsgs = localStorage.getItem('local_msgs');
    if (savedProfile) { setUser(JSON.parse(savedProfile)); setIsRegistered(true); }
    if (localMsgs) setMessages(JSON.parse(localMsgs));

    const syncChat = async () => {
      try {
        // Intentar bajar mensajes nuevos
        const { data } = await supabase.from('messages').select('*').order('inserted_at', { ascending: true });
        if (data) {
          setMessages(data);
          localStorage.setItem('local_msgs', JSON.stringify(data));
        }
      } catch (e) { console.log("WiFi bloqueado, modo local activo"); }
    };

    syncChat();
    const interval = setInterval(syncChat, 5000); // Intenta conectar cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const enviar = async (e: any) => {
    e.preventDefault();
    if (!text.trim()) return;

    const nuevoMsg = { 
      content: text, 
      user_id: user.name || "Anónimo", 
      avatar_url: user.avatar,
      inserted_at: new Date().toISOString()
    };

    // 1. Guardar en el Chromebook AL INSTANTE
    const actualizados = [...messages, nuevoMsg];
    setMessages(actualizados);
    localStorage.setItem('local_msgs', JSON.stringify(actualizados));
    setText("");

    // 2. Intentar subirlo a la nube (Si hay WiFi, les llegará a otros)
    try {
      await supabase.from('messages').insert([nuevoMsg]);
    } catch (e) {
      console.log("Mensaje guardado localmente, se subirá cuando haya internet");
    }
  };

  if (!isRegistered) {
    return (
      <div style={styles.setupBg}>
        <div style={styles.setupCard}>
          <h2 style={{color: '#075e54'}}>WhatsApp Guerrilla 🥷</h2>
          <input style={styles.setupInput} placeholder="Tu nombre..." onChange={(e) => setUser({...user, name: e.target.value})} />
          <div style={styles.avatarGrid}>{AVATARES.map(a => (<div key={a} onClick={() => setUser({...user, avatar: a})} style={{...styles.avatarOption, background: user.avatar === a ? '#dcf8c6' : 'transparent', borderRadius: '50%'}}>{a}</div>))}</div>
          <button style={styles.setupBtn} onClick={() => setIsRegistered(true)}>Entrar al Chat</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.appContainer}>
      <header style={styles.header}><span>{user.avatar} {user.name}</span></header>
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
        <form onSubmit={enviar} style={{display: 'flex', gap: '10px'}}><input style={styles.input} value={text} onChange={(e) => setText(e.target.value)} placeholder="Escribe un mensaje..." /><button style={styles.sendBtn}>➤</button></form>
      </footer>
    </div>
  );
}

const styles: any = {
  appContainer: { display: 'flex', flexDirection: 'column', height: '100vh', background: '#efe7dd', fontFamily: 'sans-serif' },
  header: { background: '#075e54', color: '#fff', padding: '15px', fontWeight: 'bold' },
  chatArea: { flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column' },
  bubble: { padding: '8px 12px', borderRadius: '10px', marginBottom: '8px', maxWidth: '75%', boxShadow: '0 1px 1px rgba(0,0,0,0.1)' },
  footer: { padding: '10px', background: '#f0f0f0' },
  input: { flex: 1, padding: '12px', borderRadius: '20px', border: 'none', color: '#000', outline: 'none' },
  sendBtn: { background: '#075e54', color: '#fff', border: 'none', borderRadius: '50%', width: '45px', height: '45px' },
  setupBg: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#075e54' },
  setupCard: { background: '#fff', padding: '30px', borderRadius: '15px', textAlign: 'center', color: '#000', width: '300px' },
  setupInput: { width: '100%', padding: '10px', marginBottom: '15px', color: '#000' },
  avatarGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '15px' },
  avatarOption: { fontSize: '24px', cursor: 'pointer', padding: '5px' },
  setupBtn: { width: '100%', padding: '12px', background: '#25d366', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold' }
};
