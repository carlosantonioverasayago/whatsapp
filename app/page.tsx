"use client"
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURACIÓN DE SUPABASE ---
const SUPABASE_URL = "https://bzgqluegvremheryxkqx.supabase.co"; 
const SUPABASE_KEY = "sb_publishable_u7IpNiA7Ii5WqX-S_AjGQQ_fzSt0xC_";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const AVATARES = ["🐶", "🐱", "🦊", "🦁", "🤖", "🦄", "🍕", "🚀", "😎", "👾"];

export default function WhatsAppMegaPro() {
  // Cambiamos el tipo a any para evitar bloqueos de TypeScript
  const [messages, setMessages] = useState<any>([]);
  const [text, setText] = useState("");
  const [user, setUser] = useState({ name: "", avatar: "" });
  const [isRegistered, setIsRegistered] = useState(false);
  const [selectedChat, setSelectedChat] = useState("Global");
  const [activeUsers, setActiveUsers] = useState<any>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('chat_profile');
    if (saved) {
      setUser(JSON.parse(saved));
      setIsRegistered(true);
    }
    
    const fetchMsgs = async () => {
      const { data } = await supabase.from('messages').select('*').order('inserted_at', { ascending: true });
      if (data) {
        // SOLUCIÓN DEFINITIVA: Forzamos el tipo con "as any"
        setMessages(data as any);
        const users = new Set(data.map((m: any) => m.user_id));
        setActiveUsers(users);
      }
    };
    fetchMsgs();

    const channel = supabase.channel('global').on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'messages' }, 
      (p) => {
        setMessages((prev: any) => [...prev, p.new]);
        setActiveUsers((prev: any) => new Set(prev).add(p.new.user_id));
      }
    ).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, selectedChat]);

  const guardarPerfil = (e: any) => {
    e.preventDefault();
    if (user.name.trim() && user.avatar) {
      localStorage.setItem('chat_profile', JSON.stringify(user));
      setIsRegistered(true);
    }
  };

  const enviar = async (e: any) => {
    e.preventDefault();
    if (!text.trim()) return;
    const content = text;
    setText("");
    
    await supabase.from('messages').insert([{ 
      content, 
      user_id: user.name, 
      avatar_url: user.avatar,
      receiver_id: selectedChat === "Global" ? null : selectedChat
    }]);
  };

  const filteredMessages = (messages as any[]).filter(m => {
    if (selectedChat === "Global") return !m.receiver_id;
    return (m.user_id === user.name && m.receiver_id === selectedChat) || 
           (m.user_id === selectedChat && m.receiver_id === user.name);
  });

  if (!isRegistered) {
    return (
      <div style={styles.setupBg}>
        <div style={styles.setupCard}>
          <h2 style={{ color: '#075e54', marginBottom: '10px' }}>Configura tu Perfil</h2>
          <form onSubmit={guardarPerfil}>
            <input 
              style={styles.setupInput} 
              placeholder="Escribe tu nombre..." 
              value={user.name}
              onChange={e => setUser({...user, name: e.target.value})}
              required
            />
            <div style={styles.avatarGrid}>
              {AVATARES.map(a => (
                <div 
                  key={a} 
                  onClick={() => setUser({...user, avatar: a})}
                  style={{
                    ...styles.avatarOption, 
                    backgroundColor: user.avatar === a ? '#dcf8c6' : 'transparent',
                    transform: user.avatar === a ? 'scale(1.2)' : 'scale(1)'
                  }}
                >
                  {a}
                </div>
              ))}
            </div>
            <button style={styles.setupBtn}>Entrar al Chat</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.appContainer}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>WhatsApp Pro</div>
        <div 
          style={{...styles.userItem, background: selectedChat === "Global" ? '#ebebeb' : 'transparent', fontWeight: 'bold'}}
          onClick={() => setSelectedChat("Global")}
        >
          🌍 Chat Global
        </div>
        <div style={styles.divider}>Contactos</div>
        {Array.from(activeUsers as Set<string>).filter(u => u !== user.name).map(u => (
          <div 
            key={u} 
            onClick={() => setSelectedChat(u)}
            style={{...styles.userItem, background: selectedChat === u ? '#ebebeb' : 'transparent'}}
          >
            👤 {u}
          </div>
        ))}
      </aside>

      <div style={styles.chatWrapper}>
        <header style={styles.header}>
           <div style={styles.myAvatar}>{user.avatar}</div>
           <div style={{marginLeft: '10px'}}>
             <div style={{fontWeight: 'bold'}}>{selectedChat === "Global" ? "🌍 Chat Global" : `🔒 ${selectedChat}`}</div>
             <div style={{fontSize: '11px', opacity: 0.8}}>Tú: {user.name}</div>
           </div>
        </header>

        <main style={styles.chatArea}>
          {filteredMessages.map((m: any, i: number) => {
            const isMe = m.user_id === user.name;
            return (
              <div key={i} style={{...styles.msgWrapper, alignSelf: isMe ? 'flex-end' : 'flex-start'}}>
                <div style={{
                  ...styles.bubble, 
                  backgroundColor: isMe ? '#e7ffdb' : '#ffffff',
                  borderBottomRightRadius: isMe ? '0px' : '10px',
                  borderBottomLeftRadius: isMe ? '10px' : '0px'
                }}>
                  {!isMe && <span style={styles.senderName}>{m.avatar_url} {m.user_id}</span>}
                  <p style={styles.msgText}>{m.content}</p>
                  <span style={styles.msgTime}>
                    {m.inserted_at ? new Date(m.inserted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </main>

        <footer style={styles.footer}>
          <form onSubmit={enviar} style={{display: 'flex', width: '100%', gap: '10px'}}>
            <input 
              style={styles.input} 
              placeholder="Escribe un mensaje..." 
              value={text} 
              onChange={e => setText(e.target.value)} 
            />
            <button style={styles.sendBtn}>➤</button>
          </form>
        </footer>
      </div>
    </div>
  );
}

const styles: any = {
  appContainer: { display: 'flex', height: '100vh', width: '100vw', fontFamily: 'sans-serif', overflow: 'hidden' },
  sidebar: { width: '280px', background: 'white', borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column' },
  sidebarHeader: { padding: '20px', fontSize: '20px', fontWeight: 'bold', background: '#f0f0f0', color: '#075e54' },
  userItem: { padding: '15px 20px', cursor: 'pointer', borderBottom: '1px solid #f5f5f5' },
  divider: { padding: '10px 20px', fontSize: '12px', color: '#999', textTransform: 'uppercase', background: '#fafafa' },
  chatWrapper: { flex: 1, display: 'flex', flexDirection: 'column', background: '#efe7dd' },
  header: { background: '#075e54', color: 'white', padding: '10px 20px', display: 'flex', alignItems: 'center' },
  myAvatar: { width: '35px', height: '35px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' },
  chatArea: { flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")' },
  msgWrapper: { display: 'flex', flexDirection: 'column', marginBottom: '8px', maxWidth: '80%' },
  bubble: { padding: '8px 12px', borderRadius: '10px', boxShadow: '0 1px 1px rgba(0,0,0,0.1)' },
  senderName: { fontSize: '11px', fontWeight: 'bold', color: '#075e54', display: 'block' },
  msgText: { margin: '0', fontSize: '14px', color: '#000000' },
  msgTime: { fontSize: '10px', color: '#666', textAlign: 'right', display: 'block', marginTop: '4px' },
  footer: { padding: '10px', background: '#f0f0f0' },
  input: { flex: 1, padding: '12px', borderRadius: '25px', border: '1px solid #ddd', outline: 'none' },
  sendBtn: { background: '#075e54', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer' },
  setupBg: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' },
  setupCard: { background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center' },
  setupInput: { width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '5px', border: '1px solid #ddd' },
  avatarGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '20px' },
  avatarOption: { fontSize: '24px', cursor: 'pointer', padding: '5px', borderRadius: '5px' },
  setupBtn: { width: '100%', padding: '10px', background: '#25d366', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }
};
