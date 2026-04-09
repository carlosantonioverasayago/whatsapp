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

  const [user, setUser] = useState({ name: "", avatar: "" });
  const [isRegistered, setIsRegistered] = useState(false);
  const [selectedChat, setSelectedChat] = useState("Global");
  const [activeUsers, setActiveUsers] = useState<any>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('chat_profile');
    if (saved) { setUser(JSON.parse(saved)); setIsRegistered(true); }

    const fetchMsgs = async () => {
      const { data } = await supabase.from('messages').select('*').order('inserted_at', { ascending: true });
      if (data) {
        setMessages(data as any[]);
        setActiveUsers(new Set(data.map((m: any) => m.user_id)));
      }
    };
    fetchMsgs();

    const channel = supabase.channel('global').on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'messages' }, 
      (p) => {
        setMessages((prev) => [...prev, p.new]);
        setActiveUsers((prev: any) => new Set(prev).add(p.new.user_id));
      }
    ).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, selectedChat]);

  const enviar = async (e: any) => {
    e.preventDefault();
    if (!text.trim()) return;
    const content = text;
    setText("");
    await supabase.from('messages').insert([{ 
      content, user_id: user.name, avatar_url: user.avatar,
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
          <h2 style={{ color: '#075e54', marginBottom: '10px' }}>Join the Chat</h2>
          <input 
            style={styles.setupInput} 
            placeholder="Your Username..." 
            value={user.name}
            onChange={(e: any) => setUser({...user, name: e.target.value})} 
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
          }}>Get Started</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.appContainer}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>Chats</div>
        <div style={{...styles.userItem, background: selectedChat === "Global" ? '#f0f0f0' : 'transparent'}} onClick={() => setSelectedChat("Global")}>🌍 Global Chat</div>
        {Array.from(activeUsers).filter(u => u !== user.name).map((u: any) => (
          <div key={u} style={{...styles.userItem, background: selectedChat === u ? '#f0f0f0' : 'transparent'}} onClick={() => setSelectedChat(u)}>👤 {u}</div>
        ))}
      </aside>
      <div style={styles.chatWrapper}>
        <header style={styles.header}>
          <span>{user.avatar} {selectedChat}</span>
          <button onClick={logout} style={styles.editBtn}>Edit Profile</button>
        </header>
        <main style={styles.chatArea}>
          {filteredMessages.map((m: any, i: number) => (
            <div key={i} style={{...styles.bubble, alignSelf: m.user_id === user.name ? 'flex-end' : 'flex-start', backgroundColor: m.user_id === user.name ? '#e7ffdb' : '#fff'}}>
              <p style={{margin: 0}}>{m.content}</p>
            </div>
          ))}
          <div ref={scrollRef} />
        </main>
        <footer style={styles.footer}>
          <form onSubmit={enviar} style={{display: 'flex', gap: '10px'}}>
            <input style={styles.input} value={text} onChange={(e: any) => setText(e.target.value)} placeholder="Type..." />
            <button style={styles.sendBtn}>➤</button>
          </form>
        </footer>
      </div>
    </div>
  );
}

const styles: any = {
  appContainer: { display: 'flex', height: '100vh', width: '100vw', fontFamily: 'sans-serif' },
  sidebar: { width: '280px', borderRight: '1px solid #ddd', background: '#fff' },
  sidebarHeader: { padding: '20px', fontSize: '22px', fontWeight: 'bold', color: '#075e54' },
  userItem: { padding: '15px 20px', cursor: 'pointer' },
  chatWrapper: { flex: 1, display: 'flex', flexDirection: 'column', background: '#efe7dd' },
  header: { background: '#075e54', color: '#fff', padding: '10px 20px', display: 'flex', justifyContent: 'space-between' },
  editBtn: { background: 'none', border: '1px solid white', color: 'white', borderRadius: '5px', cursor: 'pointer' },
  chatArea: { flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column' },
  bubble: { padding: '8px 12px', borderRadius: '10px', marginBottom: '8px', maxWidth: '70%', boxShadow: '0 1px 1px rgba(0,0,0,0.1)' },
  footer: { padding: '10px', background: '#f0f0f0' },
  input: { flex: 1, padding: '10px', borderRadius: '20px', border: 'none' },
  sendBtn: { background: '#075e54', color: '#fff', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer' },
  setupBg: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' },
  setupCard: { background: 'white', padding: '30px', borderRadius: '10px', textAlign: 'center' },
  setupInput: { width: '100%', padding: '10px', marginBottom: '20px' },
  avatarGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' },
  avatarOption: { fontSize: '24px', cursor: 'pointer', padding: '10px' },
  setupBtn: { width: '100%', padding: '10px', background: '#25d366', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }
};
