"use client"
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// Configuración con tus credenciales reales
const SUPABASE_URL = "https://supabase.co"; 
const SUPABASE_KEY = "sb_publishable_u7IpNiA7Ii5WqX-S_AjGQQ_fzSt0xC_";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const AVATARES = ["🐶", "🐱", "🦊", "🦁", "🤖", "🦄", "🚀", "😎"];

export default function WhatsAppPro() {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState(""); // <-- Aquí estaba el error, ahora está arreglado
  const [user, setUser] = useState<any>({ name: "", avatar: "" });
  const [isRegistered, setIsRegistered] = useState(false);
  const [selectedChat, setSelectedChat] = useState("Global");
  const [activeUsers, setActiveUsers] = useState<any>(new Set());
  const scrollRef = useRef<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('chat_profile');
    if (saved) { 
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed); 
        setIsRegistered(true);
      } catch (e) {
        localStorage.removeItem('chat_profile');
      }
    }

    const fetchMsgs = async () => {
      const { data } = await supabase.from('messages').select('*').order('inserted_at', { ascending: true });
      if (data) {
        setMessages(data);
        const users = new Set(data.map((m: any) => m.user_id));
        setActiveUsers(users);
      }
    };
    fetchMsgs();

    const channel = supabase.channel('global').on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'messages' }, 
      (p) => {
        setMessages((prev) => [...prev, p.new]);
        setActiveUsers((prev: any) => {
          const next = new Set(prev);
          next.add(p.new.user_id);
          return next;
        });
      }
    ).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, selectedChat]);

  const enviar = async (e: any) => {
    e.preventDefault();
    if (!text.trim()) return;
    const msgEnviar = text;
    setText("");
    await supabase.from('messages').insert([{ 
      content: msgEnviar, 
      user_id: user.name, 
      avatar_url: user.avatar,
      receiver_id: selectedChat === "Global" ? null : selectedChat
    }]);
  };

  const logout = () => {
    localStorage.removeItem('chat_profile');
    setIsRegistered(false);
  };

  const filteredMessages = messages.filter((m: any) => {
    if (selectedChat === "Global") return !m.receiver_id;
    return (m.user_id === user.name && m.receiver_id === selectedChat) || 
           (m.user_id === selectedChat && m.receiver_id === user.name);
  });

  if (!isRegistered) {
    return (
      <div style={styles.setupBg}>
        <div style={styles.setupCard}>
          <h2 style={{ color: '#075e54', marginBottom: '10px' }}>¡Bienvenido al Chat!</h2>
          <input 
            style={styles.setupInput} 
            placeholder="Escribe tu nombre..." 
            value={user.name}
            onChange={(e: any) => setUser({...user, name: e.target.value})} 
          />
          <p>Elige tu avatar:</p>
          <div style={styles.avatarGrid}>
            {AVATARES.map(a => (
              <div key={a} onClick={() => setUser({...user, avatar: a})} 
                   style={{...styles.avatarOption, background: user.avatar === a ? '#dcf8c6' : 'transparent', borderRadius: '50%'}}>{a}</div>
            ))}
          </div>
          <button style={styles.setupBtn} onClick={() => { 
            if(user.name && user.avatar) {
              localStorage.setItem('chat_profile', JSON.stringify(user)); 
              setIsRegistered(true); 
            }
          }}>Empezar a chatear</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.appContainer}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>Chats</div>
        <div style={{...styles.userItem, background: selectedChat === "Global" ? '#f0f0f0' : 'transparent'}} onClick={() => setSelectedChat("Global")}>🌍 Chat Global</div>
        <div style={{padding: '10px 20px', fontSize: '12px', color: '#888'}}>USUARIOS ACTIVOS</div>
        {Array.from(activeUsers).filter(u => u !== user.name).map((u: any) => (
          <div key={u as string} style={{...styles.userItem, background: selectedChat === u ? '#f0f0f0' : 'transparent'}} onClick={() => setSelectedChat(u as string)}>👤 {u as string}</div>
        ))}
      </aside>
      <div style={styles.chatWrapper}>
        <header style={styles.header}>
          <span>{user.avatar} Chateando en: <strong>{selectedChat}</strong></span>
          <button onClick={logout} style={styles.editBtn}>Salir</button>
        </header>
        <main style={styles.chatArea}>
          {filteredMessages.map((m: any, i: number) => (
            <div key={i} style={{...styles.bubble, alignSelf: m.user_id === user.name ? 'flex-end' : 'flex-start', backgroundColor: m.user_id === user.name ? '#e7ffdb' : '#fff'}}>
              <small style={{display: 'block', fontSize: '10px', color: '#888'}}>{m.user_id}</small>
              <p style={{margin: 0}}>{m.content}</p>
            </div>
          ))}
          <div ref={scrollRef} />
        </main>
        <footer style={styles.footer}>
          <form onSubmit={enviar} style={{display: 'flex', gap: '10px'}}>
            <input style={styles.input} value={text} onChange={(e: any) => setText(e.target.value)} placeholder="Escribe un mensaje..." />
            <button style={styles.sendBtn}>➤</button>
          </form>
        </footer>
      </div>
    </div>
  );
}

const styles: any = {
  appContainer: { display: 'flex', height: '100vh', width: '100vw', fontFamily: 'sans-serif' },
  sidebar: { width: '30%', minWidth: '250px', borderRight: '1px solid #ddd', background: '#fff', overflowY: 'auto' },
  sidebarHeader: { padding: '20px', fontSize: '22px', fontWeight: 'bold', color: '#075e54' },
  userItem: { padding: '15px 20px', cursor: 'pointer', borderBottom: '1px solid #f9f9f9' },
  chatWrapper: { flex: 1, display: 'flex', flexDirection: 'column', background: '#efe7dd' },
  header: { background: '#075e54', color: '#fff', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  editBtn: { background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' },
  chatArea: { flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column' },
  bubble: { padding: '8px 12px', borderRadius: '10px', marginBottom: '8px', maxWidth: '70%', boxShadow: '0 1px 1px rgba(0,0,0,0.1)' },
  footer: { padding: '15px', background: '#f0f0f0' },
  input: { flex: 1, padding: '12px 15px', borderRadius: '25px', border: '1px solid #ccc', outline: 'none' },
  sendBtn: { background: '#075e54', color: '#fff', border: 'none', borderRadius: '50%', width: '45px', height: '45px', cursor: 'pointer' },
  setupBg: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#075e54' },
  setupCard: { background: 'white', padding: '40px', borderRadius: '20px', textAlign: 'center', width: '90%', maxWidth: '400px' },
  setupInput: { width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #ddd' },
  avatarGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '25px' },
  avatarOption: { fontSize: '30px', cursor: 'pointer', padding: '10px' },
  setupBtn: { width: '100%', padding: '15px', background: '#25d366', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold' }
};
