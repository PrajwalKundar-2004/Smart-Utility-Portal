import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar2 from '../components/Navbar2';

// ─── Animation Variants (Identical to Lectdash) ──────────────────────────────
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } },
};

// ─── Cards Config (5 cards: 1 less than lecture dashboard) ───────────────────
const cards = [
  {
    to: '/student/results',
    emoji: '📊',
    title: 'Results',
    desc: 'View your marks and grades',
  },
  {
    to: '/student/notices',
    emoji: '📢',
    title: 'Notices',
    desc: 'College circulars and updates',
  },
  {
    to: '/student/assignments',
    emoji: '📝',
    title: 'Assignments',
    desc: 'Track coursework and tasks',
  },
  {
    to: '/student/attendances',
    emoji: '✅',
    title: 'Attendance',
    desc: 'Monitor subject attendance',
  },
  {
    to: '/student/chat',
    emoji: '💬',
    title: 'Messages',
    desc: 'Chat with teachers & peers',
  },
];

const Studdash = () => {
  const location = useLocation();
  const username = location.state?.username || localStorage.getItem('username') || 'Student';

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-sky-50 font-sans">
      <Navbar2 />

      {/* ── Page Body (Matched with Lectdash) ── */}
      <div className="px-4 sm:px-10 py-6 sm:py-8 w-full flex flex-col gap-6 lg:gap-8 relative">
        
        {/* ── Page Heading ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="max-w-6xl mx-auto px-0 sm:px-2 w-full flex flex-col gap-1 relative z-30"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-black">
            Welcome, <span className="text-blue-600 font-extrabold">{username}</span>
          </h1>
          <p className="text-slate-500 text-sm">Access your academic resources and updates</p>
        </motion.div>

        {/* ── Cards Grid: 5 cards (1 less than lecture dashboard) ── */}
        {/* Row 1 has 3 cards, Row 2 has 2 cards centered */}
        <div className="flex justify-center w-full">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-6 lg:gap-7 w-full max-w-6xl mx-auto justify-items-center sm:justify-items-stretch"
          >
            {cards.map((card, index) => (
              <motion.div
                key={card.to}
                variants={cardVariants}
                className={`w-full max-w-[340px] sm:max-w-none flex justify-center col-span-1 sm:col-span-1 lg:col-span-2 ${
                  index === 3 ? 'lg:col-start-2' : ''
                } ${index === 4 ? 'sm:col-span-2 sm:max-w-[340px] sm:justify-self-center lg:col-span-2 lg:max-w-none' : ''}`}
              >
                <NavLink
                  to={card.to}
                  className="w-full block"
                >
                  <div
                    className="group block px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7 rounded-[24px] sm:rounded-[30px] text-center text-slate-800 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-1 bg-gradient-to-r from-white to-[rgba(112,177,230,0.277)] w-full cursor-pointer flex flex-col justify-center min-h-[135px] sm:min-h-[155px]"
                  >
                    <span className="block text-3xl sm:text-4xl mb-1.5 sm:mb-2 group-hover:scale-110 transition-transform duration-200 select-none">
                      {card.emoji}
                    </span>
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-0.5 sm:mb-1 text-slate-900">
                      {card.title}
                    </h3>
                    <p className="text-slate-500 text-xs sm:text-sm leading-snug">
                      {card.desc}
                    </p>
                  </div>
                </NavLink>
              </motion.div>
            ))}
          </motion.div>
        </div>

      </div>
    </main>
  );
};

export default Studdash;
