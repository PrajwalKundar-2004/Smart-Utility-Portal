import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import Navbar1 from '../components/Navbar1';
import { API_BASE_URL } from '../config/api';

const Notice = () => {
  const navigate = useNavigate();
  const lecturerName = localStorage.getItem('lectureName') || 'Lecturer';

  // Composer Form State
  const [priority, setPriority] = useState('normal'); // 'normal', 'important', 'urgent'
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Notices List & Feed State
  const [recentNotices, setRecentNotices] = useState([]);
  const [loadingNotices, setLoadingNotices] = useState(true);
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'active', 'withdrawn'

  // Delete Alert Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [noticeToDelete, setNoticeToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [editPriority, setEditPriority] = useState('normal');
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch all notices (both active and withdrawn for lecturer audit)
  const fetchRecentNotices = async () => {
    try {
      setLoadingNotices(true);
      const res = await fetch(`${API_BASE_URL}/api/lecture/notices`);
      const data = await res.json();
      if (data.success) {
        setRecentNotices(data.notices || []);
      }
    } catch (err) {
      console.error('Error loading notices:', err);
    } finally {
      setLoadingNotices(false);
    }
  };

  useEffect(() => {
    fetchRecentNotices();
  }, []);

  // Post New Notice
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error('Please enter both a title and message');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        title: title.trim(),
        message: message.trim(),
        postedBy: lecturerName,
        subject: 'General Announcement',
        priority
      };

      const response = await fetch(`${API_BASE_URL}/api/lecture/notice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        toast.success(`Notice published successfully by Prof. ${lecturerName}!`, { position: 'top-center' });
        setTitle('');
        setMessage('');
        fetchRecentNotices();
      } else {
        toast.error(result.message || 'Failed to post notice');
      }
    } catch (error) {
      console.error(error);
      toast.error('Server error posting notice');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Delete Alert Modal
  const promptDeleteNotice = (notice) => {
    setNoticeToDelete(notice);
    setDeleteModalOpen(true);
  };

  // Confirm Delete / Withdraw Notice with Attribution
  const handleConfirmDelete = async () => {
    if (!noticeToDelete) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`${API_BASE_URL}/api/lecture/notice/${noticeToDelete._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deletedBy: lecturerName })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Notice withdrawn and logged under Prof. ${lecturerName}`, { position: 'top-center' });
        setDeleteModalOpen(false);
        setNoticeToDelete(null);
        fetchRecentNotices();
      } else {
        toast.error(data.message || 'Failed to withdraw notice');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error withdrawing notice');
    } finally {
      setIsDeleting(false);
    }
  };

  // Open Edit Notice Modal
  const promptEditNotice = (notice) => {
    setEditingNotice(notice);
    setEditTitle(notice.title || '');
    setEditMessage(notice.message || '');
    setEditPriority(notice.priority || 'normal');
    setEditModalOpen(true);
  };

  // Save Edited Notice
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingNotice) return;
    if (!editTitle.trim() || !editMessage.trim()) {
      toast.error('Notice title and description cannot be empty');
      return;
    }

    try {
      setIsUpdating(true);
      const payload = {
        title: editTitle.trim(),
        message: editMessage.trim(),
        priority: editPriority,
        updatedBy: lecturerName
      };

      const res = await fetch(`${API_BASE_URL}/api/lecture/notice/${editingNotice._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Notice updated successfully by Prof. ${lecturerName}!`, { position: 'top-center' });
        setEditModalOpen(false);
        setEditingNotice(null);
        fetchRecentNotices();
      } else {
        toast.error(data.message || 'Failed to update notice');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error updating notice');
    } finally {
      setIsUpdating(false);
    }
  };

  // Restore Withdrawn Notice
  const handleRestoreNotice = async (notice) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/lecture/notice/${notice._id}/restore`, {
        method: 'PUT'
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Notice restored to active circulars');
        fetchRecentNotices();
      } else {
        toast.error(data.message || 'Failed to restore notice');
      }
    } catch (err) {
      toast.error('Server error restoring notice');
    }
  };

  // Permanent Delete Notice
  const handlePermanentDelete = async (notice) => {
    if (!window.confirm(`Permanently erase "${notice.title}" from database records? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/lecture/notice/${notice._id}/permanent`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Notice permanently erased');
        fetchRecentNotices();
      } else {
        toast.error('Failed to permanently delete notice');
      }
    } catch (err) {
      toast.error('Server error deleting notice');
    }
  };

  // Badge colors based on priority
  const getPriorityBadge = (p) => {
    switch (p) {
      case 'urgent':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
          label: '🚨 Urgent Priority'
        };
      case 'important':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
          label: '⚡ Important Alert'
        };
      default:
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500',
          label: '📌 Circular Notice'
        };
    }
  };

  const currentBadge = getPriorityBadge(priority);

  // Filtered notices based on tab
  const activeCount = recentNotices.filter(n => !n.isDeleted).length;
  const withdrawnCount = recentNotices.filter(n => n.isDeleted).length;

  const filteredNotices = recentNotices.filter(n => {
    if (filterTab === 'active') return !n.isDeleted;
    if (filterTab === 'withdrawn') return n.isDeleted;
    return true; // 'all'
  });

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-sky-50 font-sans pb-16">
      <Toaster />

      {/* ── Sticky Top Navbar ── */}
      <div className="sticky top-0 z-40 w-full shadow-xs">
        <Navbar1 />
      </div>

      {/* ── Outer Page Container: max-w-7xl on laptop, neat & centered on mobile ── */}
      <div className="w-[90%] max-w-sm sm:w-full sm:max-w-7xl px-1 sm:px-6 lg:px-8 py-3 sm:py-7 flex flex-col gap-3 sm:gap-6 mobile-center">

        {/* ── Header Bar ── */}
        <div className="bg-white/80 backdrop-blur-md p-3 sm:p-7 rounded-xl sm:rounded-3xl border border-white shadow-xs">
          <button
            onClick={() => navigate('/lecturedash')}
            className="inline-flex items-center gap-1.5 text-[11px] sm:text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors mb-1.5 sm:mb-2 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" className="sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            <span>Back to Dashboard</span>
          </button>

          <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <h1 className="text-lg sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                Notices
              </h1>
              <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 rounded sm:rounded-full text-[10px] sm:text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
                📢 Notice Board
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 bg-blue-50/70 border border-blue-200 px-2 sm:px-3 py-0.5 sm:py-1.5 rounded-md sm:rounded-2xl">
              <span className="text-[11px] sm:text-xs font-extrabold text-blue-900">Lecturer:</span>
              <span className="text-[11px] sm:text-xs font-bold text-blue-700">Prof. {lecturerName.replace(/^Prof\.?\s*/i, '')}</span>
            </div>
          </div>

          <p className="text-slate-500 text-[11px] sm:text-sm lg:text-base mt-1 sm:mt-1.5 max-w-2xl">
            Post announcements and updates for students.
          </p>
        </div>

        {/* ── 2-Column Responsive Layout (Side-by-side on laptop, stacked on mobile) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6 items-start">

          {/* ───────────────────────────────────────────────────────────── */}
          {/* ──── LEFT COLUMN: Post Notice Composer Container (6 cols) ─── */}
          {/* ───────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-6 bg-white rounded-xl sm:rounded-3xl p-3 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col gap-2.5 sm:gap-5">
            <div className="flex items-center justify-between pb-2 sm:pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs sm:text-sm">
                  ✍️
                </div>
                <h3 className="text-xs sm:text-lg font-bold text-slate-900">New Notice</h3>
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-slate-400">All students</span>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 sm:gap-4">
              
              {/* Priority Selector Pills */}
              <div>
                <label className="block text-[10px] sm:text-xs font-bold sm:font-extrabold text-slate-700 uppercase tracking-wider mb-1 sm:mb-2">
                  Priority
                </label>
                <div className="grid grid-cols-3 gap-1 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => setPriority('normal')}
                    className={`h-8 sm:h-11 rounded-md sm:rounded-xl text-[10px] sm:text-xs font-bold sm:font-extrabold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                      priority === 'normal'
                        ? 'bg-blue-50 border-blue-400 text-blue-700 ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span>📌 Normal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPriority('important')}
                    className={`h-8 sm:h-11 rounded-md sm:rounded-xl text-[10px] sm:text-xs font-bold sm:font-extrabold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                      priority === 'important'
                        ? 'bg-amber-50 border-amber-400 text-amber-800 ring-2 ring-amber-500/20 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span>⚡ Important</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPriority('urgent')}
                    className={`h-8 sm:h-11 rounded-md sm:rounded-xl text-[10px] sm:text-xs font-bold sm:font-extrabold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                      priority === 'urgent'
                        ? 'bg-rose-50 border-rose-400 text-rose-700 ring-2 ring-rose-500/20 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span>🚨 Urgent</span>
                  </button>
                </div>
              </div>

              {/* Notice Title / Subject Line */}
              <div>
                <label className="block text-[10px] sm:text-xs font-bold sm:font-extrabold text-slate-700 uppercase tracking-wider mb-0.5 sm:mb-1.5">
                  Title <span className="text-blue-600">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title"
                  required
                  className="w-full h-8 sm:h-11 px-2.5 sm:px-4 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 sm:focus:ring-3 focus:ring-blue-500/10 rounded-md sm:rounded-xl outline-none text-slate-900 text-xs sm:text-sm font-medium sm:font-bold placeholder-slate-400 transition-all shadow-2xs"
                />
              </div>

              {/* Notice Message / Description */}
              <div>
                <div className="flex items-center justify-between mb-0.5 sm:mb-1.5">
                  <label className="block text-[10px] sm:text-xs font-bold sm:font-extrabold text-slate-700 uppercase tracking-wider">
                    Notice Details <span className="text-blue-600">*</span>
                  </label>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400">
                    {message.length} chars
                  </span>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add notice details here..."
                  required
                  rows={3}
                  className="w-full p-2 sm:p-4 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 sm:focus:ring-3 focus:ring-blue-500/10 rounded-md sm:rounded-xl outline-none text-slate-800 text-xs sm:text-sm font-medium placeholder-slate-400 transition-all resize-none shadow-2xs leading-snug sm:leading-relaxed sm:rows-5"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 sm:gap-3 pt-0.5 sm:pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim() || !message.trim()}
                  className="flex-1 h-8.5 sm:h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] text-white font-extrabold rounded-md sm:rounded-xl shadow-md shadow-blue-500/25 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Publishing…</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" className="sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                      <span>Publish Notice</span>
                    </>
                  )}
                </button>

                {(title || message) && (
                  <button
                    type="button"
                    onClick={() => { setTitle(''); setMessage(''); }}
                    className="h-8.5 sm:h-12 px-2.5 sm:px-4 rounded-md sm:rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* ──── RIGHT COLUMN (In laptop: Right side of screen. ────────── */}
          {/* ──── In mobile: Stacks directly under post notice container!) ── */}
          {/* ───────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-6 flex flex-col gap-3 sm:gap-6 w-full">

            {/* ── 1. LIVE STUDENT PREVIEW CARD (Ultra-Compact & Sleek) ── */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 border border-slate-200/90 shadow-xs flex flex-col gap-1.5 sm:gap-2">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <span>👁️</span> Student Live Preview
                </span>
                <span className="text-[8px] sm:text-[9px] font-extrabold bg-blue-50 text-blue-700 px-1 py-0.2 rounded sm:rounded-full border border-blue-200">
                  Live
                </span>
              </div>

              {/* The Ultra-Compact Live Preview Container */}
              <div className="bg-gradient-to-br from-white to-slate-50/90 rounded-lg sm:rounded-xl p-2 sm:p-2.5 border border-slate-200 shadow-2xs flex flex-col gap-1 sm:gap-1.5">
                
                {/* Priority & Scope Badges */}
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <span className={`inline-flex items-center gap-1 text-[8px] sm:text-[9px] font-extrabold px-1.5 sm:px-2 py-0.2 rounded sm:rounded-full border ${currentBadge.bg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${currentBadge.dot}`}></span>
                    {currentBadge.label}
                  </span>

                  <span className="text-[8px] sm:text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 sm:px-2 py-0.2 rounded border border-slate-200">
                    📢 All Students
                  </span>
                </div>

                {/* Ultra-Compact Subject Box with Invisible Scrolling */}
                <div 
                  className="max-h-6 sm:max-h-7 overflow-y-auto no-scrollbar flex items-center px-0.5"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  <h4 className="text-[11px] sm:text-xs font-extrabold text-slate-900 leading-snug break-words">
                    {title.trim() || 'Title'}
                  </h4>
                </div>

                {/* Ultra-Compact Description Box with Invisible Scrolling */}
                <div 
                  className="h-10 sm:h-16 overflow-y-auto no-scrollbar p-1.5 sm:p-2 bg-white/80 rounded sm:rounded-lg border border-slate-200/70 shadow-2xs"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  <p className="text-slate-700 text-[10px] sm:text-xs leading-relaxed whitespace-pre-line break-words font-medium">
                    {message.trim() || 'Notice details will appear here.'}
                  </p>
                </div>

                {/* Ultra-Compact Author Footer */}
                <div className="flex items-center justify-between pt-1 sm:pt-1.5 border-t border-slate-200/70">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-[7px] sm:text-[8px] shadow-2xs">
                      {lecturerName ? lecturerName[0].toUpperCase() : 'L'}
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-800">
                      Prof. {lecturerName.replace(/^Prof\.?\s*/i, '')}
                    </span>
                  </div>

                  <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 bg-slate-100 px-1 py-0.2 rounded">
                    Student View
                  </span>
                </div>
              </div>
            </div>

            {/* ── 2. PUBLISHED NOTICES FEED & CIRCULARS LOG ── */}
            <div className="bg-white rounded-xl sm:rounded-3xl p-3 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col h-[330px] sm:h-[400px]">
              
              <div className="flex flex-wrap items-center justify-between gap-1.5 pb-1.5 sm:pb-2.5 border-b border-slate-100 shrink-0">
                <div>
                  <h3 className="text-xs sm:text-base font-bold text-slate-900 flex items-center gap-1.5 sm:gap-2">
                    <span>📋</span> Posted Notices
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
                    View and manage posted notices.
                  </p>
                </div>

                <button
                  onClick={fetchRecentNotices}
                  className="px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md sm:rounded-xl border border-blue-200 transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" className="sm:w-3 sm:h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                  <span>Refresh</span>
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1 sm:py-2 shrink-0 no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <button
                  onClick={() => setFilterTab('all')}
                  className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    filterTab === 'all'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  All ({recentNotices.length})
                </button>

                <button
                  onClick={() => setFilterTab('active')}
                  className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 sm:gap-1.5 ${
                    filterTab === 'active'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
                  <span>Active ({activeCount})</span>
                </button>

                <button
                  onClick={() => setFilterTab('withdrawn')}
                  className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 sm:gap-1.5 ${
                    filterTab === 'withdrawn'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-300"></span>
                  <span>Withdrawn ({withdrawnCount})</span>
                </button>
              </div>

              {/* Notices Feed List with Scrollbar */}
              {loadingNotices ? (
                <div className="flex-1 flex flex-col items-center justify-center py-6 sm:py-8 text-slate-400 text-xs gap-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-[11px] sm:text-xs">Loading notices…</span>
                </div>
              ) : filteredNotices.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-6 sm:py-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg sm:rounded-2xl p-3 sm:p-4 my-auto">
                  <span className="text-xl sm:text-2xl block mb-1">📭</span>
                  <p className="font-bold text-slate-600 text-[11px] sm:text-xs">No notices found</p>
                  <p className="text-slate-400 mt-0.5 text-[10px] sm:text-[11px]">
                    {filterTab === 'withdrawn'
                      ? 'No withdrawn notices.'
                      : filterTab === 'active'
                      ? 'No active notices.'
                      : 'Create a notice to get started.'}
                  </p>
                </div>
              ) : (
                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1 sm:pr-1.5 space-y-2 sm:space-y-2.5">
                  {filteredNotices.map((n) => {
                    const b = getPriorityBadge(n.priority || 'normal');
                    const isWithdrawn = !!n.isDeleted;

                    return (
                      <div
                        key={n._id}
                        className={`rounded-lg sm:rounded-2xl p-2.5 sm:p-4 border transition-all flex flex-col gap-1.5 sm:gap-2.5 relative ${
                          isWithdrawn
                            ? 'bg-rose-50/40 border-rose-200/90 shadow-2xs'
                            : 'bg-white hover:border-blue-300 border-slate-200 shadow-2xs'
                        }`}
                      >
                        {/* Top Row: Badges & Action Buttons */}
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
                            {isWithdrawn ? (
                              <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded sm:rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                                🚫 WITHDRAWN
                              </span>
                            ) : (
                              <span className={`inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded sm:rounded-full border ${b.bg}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${b.dot}`}></span>
                                {b.label}
                              </span>
                            )}

                            <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-md border border-slate-200">
                              📢 General
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1 shrink-0">
                            {!isWithdrawn ? (
                              <>
                                {/* Edit Button */}
                                <button
                                  type="button"
                                  onClick={() => promptEditNotice(n)}
                                  className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded sm:rounded-lg border border-blue-200 transition-colors cursor-pointer flex items-center gap-1"
                                  title="Edit this notice"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" className="sm:w-3 sm:h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                  <span>Edit</span>
                                </button>

                                {/* Delete / Withdraw Button */}
                                <button
                                  type="button"
                                  onClick={() => promptDeleteNotice(n)}
                                  className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded sm:rounded-lg border border-rose-200 transition-colors cursor-pointer flex items-center gap-1"
                                  title="Withdraw this notice"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" className="sm:w-3 sm:h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                  <span>Delete</span>
                                </button>
                              </>
                            ) : (
                              <>
                                {/* Restore Button */}
                                <button
                                  type="button"
                                  onClick={() => handleRestoreNotice(n)}
                                  className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded sm:rounded-lg border border-emerald-200 transition-colors cursor-pointer flex items-center gap-1"
                                  title="Restore notice back to active students view"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" className="sm:w-3 sm:h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                                  <span>Restore</span>
                                </button>

                                {/* Permanent Delete Button */}
                                <button
                                  type="button"
                                  onClick={() => handlePermanentDelete(n)}
                                  className="p-0.5 sm:p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded sm:rounded-lg transition-colors cursor-pointer"
                                  title="Permanently remove from database"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" className="sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Notice Title with Fixed Max-Height & Invisible Scroll */}
                        <div 
                          className="max-h-9 sm:max-h-12 overflow-y-auto no-scrollbar"
                          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                          <h4 className={`text-xs sm:text-sm font-extrabold leading-snug break-words ${isWithdrawn ? 'text-slate-600 line-through' : 'text-slate-900'}`}>
                            {n.title}
                          </h4>
                        </div>

                        {/* Notice Content with Fixed Max-Height & Invisible Scroll */}
                        <div 
                          className="max-h-16 sm:max-h-24 overflow-y-auto no-scrollbar"
                          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                          <p className={`text-[11px] sm:text-xs leading-relaxed whitespace-pre-line break-words ${isWithdrawn ? 'text-slate-500' : 'text-slate-700 font-medium'}`}>
                            {n.message}
                          </p>
                        </div>

                        {/* WITHDRAWN AUDIT BANNER: Shown if notice was deleted */}
                        {isWithdrawn && (
                          <div className="bg-rose-100/70 border border-rose-200 rounded-md sm:rounded-xl p-1.5 sm:p-2.5 flex items-center justify-between gap-2 text-rose-900">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs sm:text-sm">🗑️</span>
                              <div className="text-[10px] sm:text-[11px] leading-tight">
                                <span className="font-semibold text-rose-700">Deleted by: </span>
                                <span className="font-extrabold text-rose-950">
                                  Prof. {(n.deletedBy || 'Lecturer').replace(/^Prof\.?\s*/i, '')}
                                </span>
                              </div>
                            </div>
                            <span className="text-[9px] sm:text-[10px] font-bold text-rose-600 shrink-0">
                              {n.deletedAt ? new Date(n.deletedAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : 'Deleted'}
                            </span>
                          </div>
                        )}

                        {/* Bottom Attribution Footer */}
                        <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 sm:pt-2 border-t border-slate-100 text-[9px] sm:text-[11px] font-semibold text-slate-500">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="flex items-center gap-1 text-slate-700">
                              <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-slate-200 text-slate-700 text-[8px] sm:text-[9px] font-black flex items-center justify-center">
                                {(n.postedBy || 'L')[0].toUpperCase()}
                              </span>
                              <span>By Prof. {(n.postedBy || 'Lecturer').replace(/^Prof\.?\s*/i, '')}</span>
                            </span>

                            {/* EDITED ATTRIBUTION: Shown if notice was edited */}
                            {n.updatedBy && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 sm:py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[8px] sm:text-[10px] font-bold">
                                <span>✏️ Edited</span>
                              </span>
                            )}
                          </div>

                          <span className="text-[9px] sm:text-[10px] text-slate-400">
                            {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ── CUSTOM DELETE CONFIRMATION ALERT MODAL ─────────────────── */}
      {/* ───────────────────────────────────────────────────────────── */}
      {deleteModalOpen && noticeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
          <div className="bg-white rounded-xl sm:rounded-3xl p-3.5 sm:p-7 shadow-2xl border border-slate-100 max-w-xs sm:max-w-md w-full relative flex flex-col gap-3 sm:gap-4 transform transition-all">
            
            {/* Warning Icon Badge */}
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-2xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center text-base sm:text-2xl mx-auto shadow-inner">
              ⚠️
            </div>

            {/* Modal Title & Explanation */}
            <div className="text-center">
              <h3 className="text-sm sm:text-xl font-bold sm:font-black text-slate-900 tracking-tight">
                Delete Notice?
              </h3>
              <p className="text-[11px] sm:text-sm text-slate-500 mt-0.5 sm:mt-1 leading-relaxed">
                This action will withdraw the notice from all students and archive it under your audit log.
              </p>
            </div>

            {/* Notice Preview Card */}
            <div className="bg-slate-50 rounded-md sm:rounded-2xl p-2.5 sm:p-4 border border-slate-200/80 flex flex-col gap-0.5 sm:gap-1.5 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Target Notice</span>
                <span className="text-[9px] sm:text-[10px] font-black text-slate-600 bg-white px-1.5 sm:px-2 py-0.5 rounded border border-slate-200">
                  {noticeToDelete.priority ? noticeToDelete.priority.toUpperCase() : 'NORMAL'}
                </span>
              </div>

              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 line-clamp-1">
                {noticeToDelete.title}
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-600 line-clamp-2">
                {noticeToDelete.message}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-0.5 sm:pt-1">
              <button
                type="button"
                onClick={() => { setDeleteModalOpen(false); setNoticeToDelete(null); }}
                disabled={isDeleting}
                className="h-8.5 sm:h-12 rounded-md sm:rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold sm:font-extrabold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="h-8.5 sm:h-12 rounded-md sm:rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold sm:font-extrabold text-xs sm:text-sm shadow-md shadow-rose-500/25 flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Deleting…</span>
                  </>
                ) : (
                  <span>Yes, Delete</span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ── EDIT NOTICE MODAL ───────────────────────────────────────── */}
      {/* ───────────────────────────────────────────────────────────── */}
      {editModalOpen && editingNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
          <div className="bg-white rounded-xl sm:rounded-3xl p-3.5 sm:p-7 shadow-2xl border border-slate-100 max-w-sm sm:max-w-lg w-full relative flex flex-col gap-3 sm:gap-4 transform transition-all max-h-[92vh] overflow-y-auto no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            
            {/* Header with Close */}
            <div className="flex items-center justify-between pb-2 sm:pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs sm:text-sm">
                  ✏️
                </div>
                <div>
                  <h3 className="text-xs sm:text-lg font-bold sm:font-black text-slate-900">
                    Edit Notice
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 font-semibold">
                    Prof. {lecturerName.replace(/^Prof\.?\s*/i, '')}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => { setEditModalOpen(false); setEditingNotice(null); }}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer text-xs sm:text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex flex-col gap-2.5 sm:gap-3.5">
              
              {/* Priority Selector Pills */}
              <div>
                <label className="block text-[10px] sm:text-xs font-bold sm:font-extrabold text-slate-700 uppercase tracking-wider mb-1 sm:mb-1.5">
                  Priority
                </label>
                <div className="grid grid-cols-3 gap-1 sm:gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditPriority('normal')}
                    className={`h-8 sm:h-10 rounded-md sm:rounded-xl text-[10px] sm:text-xs font-bold sm:font-extrabold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                      editPriority === 'normal'
                        ? 'bg-blue-50 border-blue-400 text-blue-700 ring-2 ring-blue-500/20'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span>📌 Normal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditPriority('important')}
                    className={`h-8 sm:h-10 rounded-md sm:rounded-xl text-[10px] sm:text-xs font-bold sm:font-extrabold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                      editPriority === 'important'
                        ? 'bg-amber-50 border-amber-400 text-amber-800 ring-2 ring-amber-500/20'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span>⚡ Important</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditPriority('urgent')}
                    className={`h-8 sm:h-10 rounded-md sm:rounded-xl text-[10px] sm:text-xs font-bold sm:font-extrabold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                      editPriority === 'urgent'
                        ? 'bg-rose-50 border-rose-400 text-rose-700 ring-2 ring-rose-500/20'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span>🚨 Urgent</span>
                  </button>
                </div>
              </div>

              {/* Edit Title */}
              <div>
                <label className="block text-[10px] sm:text-xs font-bold sm:font-extrabold text-slate-700 uppercase tracking-wider mb-0.5 sm:mb-1">
                  Title <span className="text-blue-600">*</span>
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Title"
                  required
                  className="w-full h-8 sm:h-10 px-2.5 sm:px-3.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 sm:focus:ring-3 focus:ring-blue-500/10 rounded-md sm:rounded-xl outline-none text-slate-900 text-xs sm:text-sm font-medium sm:font-bold transition-all"
                />
              </div>

              {/* Edit Message */}
              <div>
                <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                  <label className="block text-[10px] sm:text-xs font-bold sm:font-extrabold text-slate-700 uppercase tracking-wider">
                    Description <span className="text-blue-600">*</span>
                  </label>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400">
                    {editMessage.length} chars
                  </span>
                </div>
                <textarea
                  value={editMessage}
                  onChange={(e) => setEditMessage(e.target.value)}
                  placeholder="Notice details..."
                  required
                  rows={3}
                  className="w-full p-2 sm:p-3 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 sm:focus:ring-3 focus:ring-blue-500/10 rounded-md sm:rounded-xl outline-none text-slate-800 text-xs sm:text-sm font-medium transition-all resize-none leading-snug sm:leading-relaxed sm:rows-5"
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 sm:gap-2.5 pt-0.5 sm:pt-1">
                <button
                  type="button"
                  onClick={() => { setEditModalOpen(false); setEditingNotice(null); }}
                  disabled={isUpdating}
                  className="h-8.5 sm:h-10 rounded-md sm:rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold sm:font-extrabold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isUpdating || !editTitle.trim() || !editMessage.trim()}
                  className="h-8.5 sm:h-10 rounded-md sm:rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold sm:font-extrabold text-xs shadow-md shadow-blue-500/25 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isUpdating ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Saving…</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </main>
  );
};

export default Notice;
