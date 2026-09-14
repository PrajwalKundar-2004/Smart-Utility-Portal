import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Placeholder rooms ────────────────────────────────────────────────────────
const INITIAL_ROOMS = [
  { id: 'general', name: 'General', type: 'group', unread: 0 },
  { id: 'announcements', name: 'Announcements', type: 'group', unread: 2 },
];

const PLACEHOLDER_MESSAGES = {
  general: [
    { id: 1, sender: 'You', role: 'lecture', content: 'Welcome to the General chat room! 👋', time: '09:00 AM' },
    { id: 2, sender: 'Student A', role: 'student', content: 'Thank you, Sir! Looking forward to learning.', time: '09:05 AM' },
  ],
  announcements: [
    { id: 1, sender: 'You', role: 'lecture', content: 'Exam schedule will be posted by Friday. Please check this channel regularly.', time: '08:30 AM' },
    { id: 2, sender: 'Student B', role: 'student', content: 'Noted, thank you!', time: '08:45 AM' },
  ],
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const ChatRoom = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role') || 'lecture';
  const isStudent = role === 'student';
  const currentUserName = isStudent
    ? (localStorage.getItem('username') || 'Student')
    : (localStorage.getItem('lectureName') || 'Lecturer');

  const [rooms, setRooms] = useState(INITIAL_ROOMS);
  const [activeRoom, setActiveRoom] = useState(INITIAL_ROOMS[0]);
  const [messages, setMessages] = useState(PLACEHOLDER_MESSAGES);
  const [input, setInput] = useState('');
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);

  const currentMessages = messages[activeRoom.id] || [];

  const handleSend = () => {
    if (!input.trim()) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      id: Date.now(),
      sender: currentUserName,
      role: isStudent ? 'student' : 'lecture',
      content: input.trim(),
      time,
    };
    setMessages(prev => ({
      ...prev,
      [activeRoom.id]: [...(prev[activeRoom.id] || []), newMsg],
    }));
    setInput('');
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    const id = newGroupName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    const newRoom = { id, name: newGroupName.trim(), type: 'group', unread: 0 };
    setRooms(prev => [...prev, newRoom]);
    setMessages(prev => ({ ...prev, [id]: [] }));
    setActiveRoom(newRoom);
    setNewGroupName('');
    setShowNewGroup(false);
  };

  return (
    <div className="h-screen bg-slate-900 font-sans flex flex-col overflow-hidden">
      {/* ── Top bar ── */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120 }}
        className="flex items-center justify-between bg-slate-800 border-b border-white/10 px-4 py-3 flex-shrink-0"
      >
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(isStudent ? '/studentdash' : '/lecturedash')}
            className="text-white/50 hover:text-white transition-colors cursor-pointer"
            title="Back to Dashboard"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </motion.button>
          <h1 className="text-white font-bold text-base">Chat Room</h1>
          <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium">
            WebSocket — Coming Soon
          </span>
        </div>
        <button
          onClick={() => setShowSidebar(p => !p)}
          className="text-white/50 hover:text-white transition-colors sm:hidden"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </motion.div>

      {/* ── Main chat layout ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar (rooms list) ── */}
        <AnimatePresence>
          {(showSidebar) && (
            <motion.aside
              initial={{ x: -260, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -260, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 24 }}
              className="w-64 sm:w-72 flex-shrink-0 bg-slate-800/80 border-r border-white/10 flex flex-col absolute sm:relative z-10 h-full sm:h-auto"
            >
              {/* Sidebar Header */}
              <div className="px-4 py-4 border-b border-white/10 flex items-center justify-between">
                <span className="text-white/70 text-xs font-semibold uppercase tracking-wider">Rooms & Groups</span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowNewGroup(p => !p)}
                  className="bg-sky-500 hover:bg-sky-400 text-white p-1.5 rounded-lg transition-colors"
                  title="Create new group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </motion.button>
              </div>

              {/* New group input */}
              <AnimatePresence>
                {showNewGroup && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 py-3 border-b border-white/10 overflow-hidden"
                  >
                    <input
                      autoFocus
                      value={newGroupName}
                      onChange={e => setNewGroupName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleCreateGroup()}
                      placeholder="Group name…"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 outline-none focus:border-sky-400/50 mb-2"
                    />
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCreateGroup}
                      className="w-full bg-sky-500 text-white text-xs font-semibold py-1.5 rounded-lg hover:bg-sky-400 transition-colors"
                    >
                      Create Group
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Room list */}
              <div className="flex-1 overflow-y-auto py-2">
                {rooms.map(room => (
                  <motion.button
                    key={room.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setActiveRoom(room); setShowSidebar(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
                      ${activeRoom.id === room.id ? 'bg-sky-500/15 border-r-2 border-sky-400' : 'hover:bg-white/5'}`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0
                      ${room.type === 'group' ? 'bg-gradient-to-br from-sky-500 to-indigo-600' : 'bg-gradient-to-br from-pink-500 to-rose-600'}`}>
                      {room.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${activeRoom.id === room.id ? 'text-white' : 'text-white/70'}`}>
                        {room.name}
                      </p>
                      <p className="text-white/30 text-xs">{room.type === 'group' ? 'Group' : 'Direct'}</p>
                    </div>
                    {room.unread > 0 && (
                      <span className="bg-sky-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {room.unread}
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ── Message Panel ── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Room header */}
          <div className="flex items-center gap-3 px-4 sm:px-6 py-3.5 bg-slate-800/60 border-b border-white/10">
            <button className="sm:hidden text-white/50 hover:text-white" onClick={() => setShowSidebar(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              {activeRoom.name[0].toUpperCase()}
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{activeRoom.name}</p>
              <p className="text-white/30 text-xs">{activeRoom.type === 'group' ? 'Group · WebSocket pending' : 'Direct Message'}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3">
            <AnimatePresence>
              {currentMessages.map((msg, i) => {
                const isMe = msg.sender === currentUserName || (isStudent ? msg.role === 'student' && msg.sender === currentUserName : msg.role === 'lecture');
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 12, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: i * 0.04, type: 'spring', stiffness: 300, damping: 24 }}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[78%] sm:max-w-[60%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      {!isMe && (
                        <span className="text-white/40 text-[10px] px-1">{msg.sender}</span>
                      )}
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                        ${isMe
                          ? 'bg-sky-500 text-white rounded-br-sm'
                          : 'bg-white/10 text-white/85 rounded-bl-sm border border-white/10'
                        }`}>
                        {msg.content}
                      </div>
                      <span className="text-white/25 text-[10px] px-1">{msg.time}</span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Input bar */}
          <div className="px-4 sm:px-6 py-4 bg-slate-800/60 border-t border-white/10">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 focus-within:border-sky-400/50 transition-colors">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Type a message…"
                className="flex-1 bg-transparent text-white text-sm placeholder-white/30 outline-none"
              />
              <motion.button
                whileTap={{ scale: 0.88 }}
                whileHover={{ scale: 1.1 }}
                onClick={handleSend}
                disabled={!input.trim()}
                className="text-sky-400 hover:text-sky-300 disabled:text-white/20 transition-colors"
              >
                <SendIcon />
              </motion.button>
            </div>
            <p className="text-white/20 text-[10px] text-center mt-2">
              ⚡ Real-time WebSocket sync will be enabled in the next update
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
