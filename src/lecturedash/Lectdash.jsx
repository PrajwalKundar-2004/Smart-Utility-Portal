import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import logo1 from '../assets/logo1.png';
import Navbar1 from '../components/Navbar1';
import { API_BASE_URL } from '../config/api';

// ─── Animation Variants ───────────────────────────────────────────────────────
const navbarVariants = {
  hidden: { y: -80, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 18 } },
};
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } },
};
const modalVariants = {
  hidden: { opacity: 0, scale: 0.88, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 22 } },
  exit: { opacity: 0, scale: 0.88, y: 20, transition: { duration: 0.18 } },
};
const chipVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.15 } },
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

// ─── Cards config ─────────────────────────────────────────────────────────────
const cards = [
  { to: '/lecture/result',     emoji: '📈', label: 'Results',       desc: 'Enter student marks',       subject: true },
  { to: '/lecture/notice',     emoji: '📣', label: 'Notices',       desc: 'Post announcements',        subject: false },
  { to: '/lecture/assignment', emoji: '📤', label: 'Assignments',   desc: 'Create assignments',        subject: true },
  { to: '/lecture/attendance', emoji: '📅', label: 'Attendance',    desc: 'Mark daily attendance',     subject: true },
  { to: '/lecture/students',   emoji: '🎓', label: 'Students',      desc: 'View enrolled students',    subject: false },
  { to: '/lecture/chat',       emoji: '💬', label: 'Messages',      desc: 'Chat with students',        subject: false },
];

// ─── Main Component ───────────────────────────────────────────────────────────
const Lectdash = () => {
  const navigate = useNavigate();
  const lectureName = localStorage.getItem('lectureName') || 'Lecturer';
  const [activeSubject, setActiveSubject] = useState(localStorage.getItem('activeSubject') || '');
  const [subjects, setSubjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const fetchSubjects = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/lecture/subjects`);
      const data = await res.json();
      if (data.success) setSubjects(data.subjects);
    } catch (e) { /* silent */ }
    finally { setLoadingSubjects(false); }
  };

  useEffect(() => { fetchSubjects(); }, []);

  const handleSelectSubject = (name) => {
    if (activeSubject === name) {
      setActiveSubject('');
      localStorage.removeItem('activeSubject');
      toast.success('Subject deselected', { duration: 1500, position: 'top-center' });
    } else {
      setActiveSubject(name);
      localStorage.setItem('activeSubject', name);
      toast.success(`Active subject: "${name}"`, { duration: 1500, position: 'top-center', icon: '📚' });
    }
  };

  const handleAddSubject = async () => {
    if (!newSubject.trim()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/lecture/subjects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSubject }),
      });
      const data = await res.json();
      if (data.success) { setSubjects(data.subjects); setNewSubject(''); toast.success('Subject added!', { position: 'top-center' }); }
    } catch (e) { toast.error('Failed to add subject'); }
  };

  const handleEditSave = async (id) => {
    if (!editingName.trim()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/lecture/subjects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingName }),
      });
      const data = await res.json();
      if (data.success) { setSubjects(data.subjects); setEditingId(null); toast.success('Updated!', { position: 'top-center' }); }
    } catch (e) { toast.error('Failed to update'); }
  };

  const handleDelete = async (id, name) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/lecture/subjects/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSubjects(data.subjects);
        if (activeSubject === name) { setActiveSubject(''); localStorage.removeItem('activeSubject'); }
        toast.success('Removed', { position: 'top-center' });
      }
    } catch (e) { toast.error('Failed to delete'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('role');
    localStorage.removeItem('token');
    localStorage.removeItem('lectureName');
    localStorage.removeItem('activeSubject');
    navigate('/lecturelogin');
  };

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-sky-50 font-sans">
      <Toaster />

      {/* ── Navbar ── */}
      <motion.div variants={navbarVariants} initial="hidden" animate="visible" className="sticky top-0 z-50 w-full">
        <Navbar1 />
      </motion.div>

      {/* ── Page body ── */}
      <div className="px-4 sm:px-10 py-10 w-full flex flex-col gap-10 lg:gap-16 relative">

        {/* ── Heading + Subject Dropdown ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-6xl mx-auto px-0 sm:px-2 w-full flex flex-col sm:flex-row sm:items-start justify-between gap-6 relative z-30"
        >
          {/* Left Side: Heading & Dropdown */}
          <div className="flex flex-col gap-5 relative z-30">
            <h1 className="text-3xl sm:text-4xl font-bold text-black">Manage Content</h1>
            
            <div className="relative z-40">
              <motion.button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 bg-gradient-to-r from-white to-[rgba(112,177,230,0.277)] text-slate-800 text-xs sm:text-sm font-bold px-3 py-3 rounded-2xl shadow-sm cursor-pointer border border-white/60 transition-all hover:shadow-md w-40 justify-between"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <svg className="text-blue-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <span className="truncate max-w-[95px] text-left">{activeSubject || 'Select Subject...'}</span>
                </div>
                <svg className={`transition-transform duration-300 flex-shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </motion.button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50"
                  >
                    <div className="max-h-60 overflow-y-auto py-2">
                      {subjects.length === 0 && (
                        <p className="text-xs text-slate-400 italic px-4 py-2">No subjects yet.</p>
                      )}
                      {activeSubject && (
                        <button
                          onClick={() => { handleSelectSubject(activeSubject); setIsDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-500 transition-colors hover:bg-red-50 flex items-center justify-between cursor-pointer border-b border-slate-100"
                        >
                          Clear Selection
                          <XIcon />
                        </button>
                      )}
                      {subjects.map(sub => (
                        <button
                          key={sub._id}
                          onClick={() => { handleSelectSubject(sub.name); setIsDropdownOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-blue-50 flex items-center justify-between cursor-pointer ${activeSubject === sub.name ? 'text-blue-600 bg-blue-50/50' : 'text-slate-700'}`}
                        >
                          <span className="truncate pr-2">{sub.name}</span>
                          {activeSubject === sub.name && <CheckIcon />}
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-slate-100 p-2">
                      <button
                        onClick={() => { setIsDropdownOpen(false); setShowModal(true); }}
                        className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 text-sm font-bold py-2 rounded-xl transition-colors cursor-pointer"
                      >
                        <SettingsIcon /> Manage Subjects
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Side: Welcome Info */}
          <div className="flex flex-col items-start sm:items-end bg-white/40 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/60 shadow-sm min-w-[200px] lg:translate-x-12 xl:translate-x-20 relative z-10">
            <p className="text-slate-500 text-sm font-medium">
              Welcome, <span className="text-blue-600 font-bold text-base">{lectureName}</span>
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Active Subject</span>
              <span className={`text-sm font-bold px-2.5 py-0.5 rounded-full ${activeSubject ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-500 border border-rose-100'}`}>
                {activeSubject ? activeSubject : 'None'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── Cards Grid ── centered independently ── */}
        <div className="flex justify-center w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 justify-items-center sm:justify-items-stretch gap-4 sm:gap-x-8 sm:gap-y-12 w-full max-w-6xl mx-auto"
        >
          {cards.map((card) => (
            <motion.div key={card.to} variants={cardVariants} className="w-full max-w-[300px] sm:max-w-none flex justify-center">
              <NavLink
                to={card.to}
                className="w-full block"
                onClick={(e) => {
                  if (card.subject && !activeSubject) {
                    e.preventDefault();
                    toast.error('Please select a subject first!', { position: 'top-center', icon: '⚠️' });
                  }
                }}
              >
                <div
                  className="group block px-5 py-7 sm:px-12 sm:py-14 rounded-[24px] sm:rounded-[35px] text-center text-slate-800 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-1 bg-gradient-to-r from-white to-[rgba(112,177,230,0.277)] w-full cursor-pointer flex flex-col justify-center"
                >
                  <span className="block text-4xl sm:text-5xl mb-2.5 sm:mb-6">{card.emoji}</span>
                  <h3 className="text-base sm:text-xl font-bold mb-1.5 sm:mb-2">{card.label}</h3>
                  <p className="text-slate-500 text-xs sm:text-base leading-snug">{card.desc}</p>
                  {card.subject ? (
                    <p className={`mt-2 sm:mt-3 text-xs sm:text-sm font-semibold truncate ${activeSubject ? 'text-blue-600' : 'text-slate-400'}`} title={activeSubject || 'None'}>
                      {activeSubject || 'None'}
                    </p>
                  ) : (
                    <p className="mt-2 sm:mt-3 text-xs sm:text-sm font-semibold invisible select-none" aria-hidden="true">
                      &nbsp;
                    </p>
                  )}
                </div>
              </NavLink>
            </motion.div>
          ))}
        </motion.div>
        </div>{/* end grid wrapper */}
      </div>{/* end page body */}

      {/* ── Manage Subjects Modal ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-none w-full max-w-[340px] sm:max-w-md max-h-[85vh] flex flex-col shadow-2xl border-2 border-slate-300 overflow-hidden"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-200 bg-slate-100 shrink-0">
                <div>
                  <h3 className="text-black font-bold text-lg sm:text-xl">Manage Subjects</h3>
                  <p className="text-slate-500 text-[11px] sm:text-xs mt-0.5">Manage your active subjects.</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 sm:p-2 rounded-none text-slate-500 hover:text-black hover:bg-slate-200 transition-colors cursor-pointer"
                  title="Close modal"
                >
                  <XIcon />
                </button>
              </div>

              {/* Subject list */}
              <div className="p-3 sm:p-4 overflow-y-auto flex-1 bg-slate-50">
                <AnimatePresence>
                  {subjects.length === 0 && (
                    <div className="text-center py-6 sm:py-8">
                      <span className="text-3xl sm:text-4xl block mb-2">📚</span>
                      <p className="text-slate-400 text-xs sm:text-sm font-medium">No subjects added yet.</p>
                    </div>
                  )}
                  <div className="flex flex-col gap-2 sm:gap-3 w-full">
                    {subjects.map(sub => (
                      <motion.div
                        key={sub._id}
                        variants={chipVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                        className={`flex items-center justify-between p-2.5 sm:p-3 rounded-none border-2 transition-all shadow-xs ${
                          activeSubject === sub.name
                            ? 'bg-blue-50 border-blue-500'
                            : 'bg-white border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        {editingId === sub._id ? (
                          <div className="flex items-center gap-2 w-full">
                            <input
                              value={editingName}
                              onChange={e => setEditingName(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && handleEditSave(sub._id)}
                              className="flex-1 bg-white border border-blue-500 rounded-none px-2 py-1 text-sm font-bold text-slate-800 outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => handleEditSave(sub._id)}
                              className="p-1.5 bg-blue-600 text-white rounded-none hover:bg-blue-700 cursor-pointer"
                            >
                              <CheckIcon />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 bg-slate-200 text-slate-700 rounded-none hover:bg-slate-300 cursor-pointer"
                            >
                              <XIcon />
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="font-bold text-slate-800 text-sm sm:text-base truncate max-w-[150px] sm:max-w-[200px]">
                              {sub.name}
                            </span>
                            <div className="flex items-center gap-1 sm:gap-1.5">
                              <button
                                onClick={() => { setEditingId(sub._id); setEditingName(sub.name); }}
                                className="p-1 sm:p-1.5 rounded-none bg-slate-100 text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-300 cursor-pointer transition-colors"
                                title="Edit subject"
                              >
                                <PencilIcon />
                              </button>
                              <button
                                onClick={() => handleDelete(sub._id, sub.name)}
                                className="p-1 sm:p-1.5 rounded-none bg-slate-100 text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-300 cursor-pointer transition-colors"
                                title="Delete subject"
                              >
                                <TrashIcon />
                              </button>
                            </div>
                          </>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              </div>

              {/* Add new subject */}
              <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-100 shrink-0">
                <div className="flex gap-2 sm:gap-2.5 items-center">
                  <input
                    value={newSubject}
                    onChange={e => setNewSubject(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddSubject()}
                    placeholder="Subject name..."
                    className="flex-1 min-w-0 h-10 sm:h-12 bg-white border border-slate-300 rounded-none px-3 sm:px-4 text-slate-800 text-sm sm:text-base font-medium placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-center"
                  />
                  <button
                    onClick={handleAddSubject}
                    className="h-10 sm:h-12 w-24 sm:w-36 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-none text-sm sm:text-base transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 shrink-0"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default Lectdash;
