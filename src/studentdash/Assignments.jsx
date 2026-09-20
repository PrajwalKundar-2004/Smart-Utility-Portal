import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar2 from '../components/Navbar2';
import { API_BASE_URL } from '../config/api';

// ─── Inline SVG Icons ────────────────────────────────────────────────────────
const ExternalLinkIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="10"
    height="10"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15 3 21 3 21 9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
  </svg>
);

const Assignments = () => {
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Periodically refresh countdown every 60 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Interactive Attachment Preview Modal state
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    url: '',
    title: '',
    type: 'photo', // 'photo' | 'pdf'
  });

  // Fetch student assignments
  const fetchStudentAssignments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/student/assignments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.assignments)) {
        setAssignments(data.assignments);
      }
    } catch (err) {
      console.error('Error fetching student assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentAssignments();
  }, []);

  // Keyboard shortcut to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && previewModal.isOpen) {
        closeAttachmentPreview();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewModal.isOpen]);

  // Helper: Get streaming or direct view URL for an attachment
  const getAttachmentViewUrl = (att) => {
    if (!att) return '';
    const fileName = att.fileName || att.name || 'document.pdf';
    const isPdf = att.fileType === 'pdf' || att.type === 'pdf' || fileName.toLowerCase().endsWith('.pdf');
    if (isPdf && att.filePublicId) {
      return `${API_BASE_URL}/api/attachment/view?publicId=${encodeURIComponent(att.filePublicId)}&format=pdf&fileName=${encodeURIComponent(fileName)}`;
    }
    return att.fileUrl || att.url || '';
  };

  // Helper: Get visual thumbnail for an attachment
  const getAttachmentThumbnailUrl = (att) => {
    if (!att) return null;
    const fileName = att.fileName || att.name || '';
    const isPdf = att.fileType === 'pdf' || att.type === 'pdf' || fileName.toLowerCase().endsWith('.pdf');
    if (isPdf && att.filePublicId) {
      return `https://res.cloudinary.com/dhqg7bglz/image/upload/w_200,h_200,c_fill,pg_1/${att.filePublicId}.jpg`;
    }
    if (!isPdf && att.fileUrl) {
      return att.fileUrl;
    }
    return null;
  };

  // Normalize attachments (handles both new array structure and legacy fields)
  const getAssignmentAttachments = (asgn) => {
    if (Array.isArray(asgn.attachments) && asgn.attachments.length > 0) {
      return asgn.attachments;
    }
    if (asgn.fileUrl) {
      return [
        {
          fileUrl: asgn.fileUrl,
          filePublicId: asgn.filePublicId,
          fileName: asgn.fileName || 'Attachment',
          fileSize: asgn.fileSize || '',
          fileType: asgn.type === 'pdf' ? 'pdf' : asgn.type === 'photo' ? 'photo' : 'pdf',
        },
      ];
    }
    return [];
  };

  const openAttachmentPreview = (item) => {
    const url = getAttachmentViewUrl(item);
    const name = item.fileName || item.name || 'Attachment';
    const isPdf = item.fileType === 'pdf' || item.type === 'pdf' || name.toLowerCase().endsWith('.pdf');
    setPreviewModal({
      isOpen: true,
      url,
      title: name,
      type: isPdf ? 'pdf' : 'photo',
    });
  };

  const closeAttachmentPreview = () => {
    setPreviewModal((prev) => ({ ...prev, isOpen: false }));
  };

  // Helper: Format remaining time to submit
  const getTimeRemaining = (dueTime, nowTime) => {
    const diffMs = dueTime - nowTime;
    if (diffMs <= 0) return null;

    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;

    if (days > 0) {
      return hours > 0 ? `${days}d ${hours}h left` : `${days}d left`;
    }
    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m left` : `${hours}h left`;
    }
    if (minutes > 0) {
      return `${minutes}m left`;
    }
    return '< 1m left';
  };

  // Deadline calculation & formatting (Includes exact due date, time & time left to submit)
  const getDeadlineInfo = (dueDateStr) => {
    if (!dueDateStr) {
      return {
        label: 'No deadline',
        badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
        dotClass: 'bg-slate-400',
      };
    }

    const due = new Date(dueDateStr);
    if (isNaN(due.getTime())) {
      return {
        label: 'No deadline',
        badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
        dotClass: 'bg-slate-400',
      };
    }

    const diffMs = due.getTime() - currentTime;
    const diffHours = diffMs / (1000 * 60 * 60);

    const formattedDate = due.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    if (diffMs < 0) {
      const passedMinutes = Math.floor(Math.abs(diffMs) / (1000 * 60));
      const passedDays = Math.floor(passedMinutes / (60 * 24));
      const passedHours = Math.floor((passedMinutes % (60 * 24)) / 60);
      const overdueText = passedDays > 0 ? `${passedDays}d ago` : `${passedHours}h ago`;

      return {
        label: `Overdue • Due: ${formattedDate} (${overdueText})`,
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        dotClass: 'bg-rose-500',
      };
    }

    const timeLeft = getTimeRemaining(due.getTime(), currentTime);

    if (diffHours <= 24) {
      return {
        label: `Due: ${formattedDate} • ${timeLeft}`,
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        dotClass: 'bg-amber-500 animate-pulse',
      };
    }

    if (diffHours <= 48) {
      return {
        label: `Due: ${formattedDate} • ${timeLeft}`,
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        dotClass: 'bg-amber-500',
      };
    }

    return {
      label: `Due: ${formattedDate} • ${timeLeft}`,
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      dotClass: 'bg-blue-500',
    };
  };

  // Format creation date
  const formatCreatedDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Unique subjects for filter
  const uniqueSubjects = useMemo(() => {
    return Array.from(new Set(assignments.map((a) => a.subject).filter(Boolean))).sort();
  }, [assignments]);

  // Filtered assignments
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (a.title && a.title.toLowerCase().includes(q)) ||
        (a.subject && a.subject.toLowerCase().includes(q)) ||
        (a.description && a.description.toLowerCase().includes(q));

      const matchSubject = selectedSubject === 'all' || a.subject === selectedSubject;

      return matchSearch && matchSubject;
    });
  }, [assignments, searchQuery, selectedSubject]);

  // Counts for quick stats
  const stats = useMemo(() => {
    let dueSoon = 0;
    let overdue = 0;
    const now = new Date().getTime();

    assignments.forEach((a) => {
      if (!a.dueDate) return;
      const d = new Date(a.dueDate).getTime();
      if (isNaN(d)) return;
      const diff = d - now;
      if (diff < 0) {
        overdue++;
      } else if (diff <= 48 * 3600 * 1000) {
        dueSoon++;
      }
    });

    return { dueSoon, overdue };
  }, [assignments]);

  return (
    <main className="min-h-screen w-full bg-sky-50 font-sans pb-10 flex flex-col items-center">
      <Navbar2 />

      {/* Sleek Scrollbar for Long Description & Horizontal Attachments (Touch Enabled) */}
      <style>{`
        .assignment-scroll::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .assignment-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .assignment-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .assignment-scroll::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .assignment-scroll {
          -webkit-overflow-scrolling: touch;
        }
      `}</style>

      {/* ── Main Container (Mobile Responsive, Max Width 4xl) ── */}
      <div className="flex-1 w-full max-w-4xl px-3 sm:px-6 py-3 sm:py-5 flex flex-col gap-2.5 sm:gap-3 items-stretch">
        
        {/* ── Top Bar ── */}
        <div className="w-full flex items-center justify-between">
          <button
            onClick={() => navigate('/studentdash')}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="group-hover:-translate-x-0.5 transition-transform"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Back to Dashboard</span>
          </button>

          <button
            onClick={fetchStudentAssignments}
            disabled={loading}
            className="h-8 sm:h-9 px-2.5 sm:px-3.5 rounded-md bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 text-xs sm:text-sm font-medium border border-slate-300 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={loading ? 'animate-spin' : ''}
            >
              <polyline points="23 4 23 10 17 10"></polyline>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
            <span>Refresh</span>
          </button>
        </div>

        {/* ── Header Card (Compact on Mobile) ── */}
        <div className="w-full bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3.5">
          <div>
            <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">
              Assignments
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Course tasks and homework posted by your faculty
            </p>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs font-semibold self-start sm:self-auto flex-wrap">
            <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              Total: {assignments.length}
            </span>
            {stats.dueSoon > 0 && (
              <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                {stats.dueSoon} Due Soon
              </span>
            )}
            {stats.overdue > 0 && (
              <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                {stats.overdue} Overdue
              </span>
            )}
          </div>
        </div>

        {/* ── Simple & Clean Filter Bar (Mobile-safe side-by-side) ── */}
        <div className="w-full flex items-center justify-between gap-2">
          {/* Search Box */}
          <div className="flex items-center gap-2 h-9 sm:h-10 px-2.5 sm:px-3 rounded-md bg-white border border-slate-300 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-600 transition-all shadow-2xs flex-1 min-w-0">
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <circle cx="11" cy="11" r="8" strokeWidth="2" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search by title or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-full text-xs sm:text-sm bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none min-w-0"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 p-0.5 shrink-0 cursor-pointer"
                title="Clear search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>

          {/* Subject Dropdown (Dedicated mobile width prevents horizontal overflow) */}
          <div className="relative shrink-0 w-28 sm:w-36">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full h-9 sm:h-10 pl-2 sm:pl-3 pr-6 sm:pr-7 text-xs sm:text-sm font-medium rounded-md bg-white border border-slate-300 text-slate-800 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs cursor-pointer appearance-none transition-colors truncate"
            >
              <option value="all">All Subjects</option>
              {uniqueSubjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* ── Assignments Feed List ── */}
        {loading ? (
          <div className="w-full bg-white py-12 rounded-xl border border-slate-200 text-center flex flex-col items-center justify-center shadow-2xs">
            <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2.5"></div>
            <p className="text-slate-600 text-xs sm:text-sm font-medium">Loading assignments...</p>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="w-full bg-white py-12 px-4 rounded-xl border border-slate-200 text-center flex flex-col items-center justify-center shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold mb-3">
              📝
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-800">
              {searchQuery || selectedSubject !== 'all'
                ? 'No matching assignments found'
                : 'No assignments posted yet'}
            </h3>
            <p className="text-slate-500 text-xs mt-1 max-w-sm">
              {searchQuery || selectedSubject !== 'all'
                ? 'Try adjusting your search keywords or selecting another subject.'
                : 'New course assignments and homework will appear here when posted by your faculty.'}
            </p>
            {(searchQuery || selectedSubject !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSubject('all');
                }}
                className="mt-3.5 px-3 py-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold cursor-pointer transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 sm:gap-3">
            {filteredAssignments.map((asgn) => {
              const deadline = getDeadlineInfo(asgn.dueDate);
              const attachments = getAssignmentAttachments(asgn);

              return (
                <div
                  key={asgn._id}
                  className="bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 transition-all shadow-2xs p-3 sm:p-4 flex flex-col gap-2 sm:gap-2.5"
                >
                  {/* Row 1: Subject & Marks + Due text (Fluid wrap on narrow screens) */}
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 sm:px-2.5 py-0.5 rounded-md text-[11px] sm:text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {asgn.subject}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 sm:hidden">
                        🎯 {asgn.totalMarks || 0} Marks
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      {/* Due text & live countdown */}
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] sm:text-xs font-semibold ${deadline.badgeClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${deadline.dotClass}`} />
                        <span className="truncate max-w-[210px] sm:max-w-none">{deadline.label}</span>
                      </span>

                      {/* Marks Badge (Desktop) */}
                      <span className="hidden sm:inline-flex px-2 sm:px-2.5 py-0.5 rounded-md text-[11px] sm:text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        🎯 {asgn.totalMarks || 0} Marks
                      </span>
                    </div>
                  </div>

                  {/* Row 2: Title */}
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-snug tracking-tight break-words">
                    {asgn.title}
                  </h2>

                  {/* Row 3: Description / Instructions (Scrollable if long) */}
                  {asgn.description && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500">
                        Instructions:
                      </span>
                      <div className="assignment-scroll max-h-24 sm:max-h-36 overflow-y-auto p-2 sm:p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed break-words">
                        {asgn.description}
                      </div>
                    </div>
                  )}

                  {/* Row 4: Attachments (Horizontal Touch-Scrollable Row with Visual Thumbnails) */}
                  {attachments.length > 0 && (
                    <div className="flex flex-col gap-1 mt-0.5">
                      <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500">
                        Attachments ({attachments.length}):
                      </span>

                      {/* Single horizontal scroll line of attachment thumbnails (touch enabled) */}
                      <div className="assignment-scroll flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-1 max-w-full touch-pan-x">
                        {attachments.map((att, idx) => {
                          const attName = att.fileName || `Attachment ${idx + 1}`;
                          const isAttPdf =
                            att.fileType === 'pdf' ||
                            (att.fileName && att.fileName.toLowerCase().endsWith('.pdf'));
                          const viewUrl = getAttachmentViewUrl(att);
                          const thumbUrl = getAttachmentThumbnailUrl(att);

                          return (
                            <div
                              key={idx}
                              className="w-18 sm:w-20 shrink-0 flex flex-col rounded-md border border-slate-200 bg-white overflow-hidden shadow-2xs hover:border-blue-300 transition-all"
                            >
                              {/* Thumbnail preview container (ultra-compact) */}
                              <div
                                onClick={() => openAttachmentPreview(att)}
                                className="relative w-full h-11 sm:h-12 bg-slate-100 cursor-pointer overflow-hidden group/thumb flex items-center justify-center"
                                title={`Click to preview ${attName}`}
                              >
                                {thumbUrl ? (
                                  <img
                                    src={thumbUrl}
                                    alt={attName}
                                    className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : null}

                                {/* Fallback Icon */}
                                <div
                                  style={{ display: thumbUrl ? 'none' : 'flex' }}
                                  className="w-full h-full flex-col items-center justify-center bg-slate-100 text-slate-500 font-bold text-xs p-0.5 text-center"
                                >
                                  <span className="text-xs mb-0.5">{isAttPdf ? '📄' : '🖼️'}</span>
                                  <span className="text-[6px] uppercase font-mono font-bold text-slate-600">
                                    {isAttPdf ? 'PDF' : 'IMG'}
                                  </span>
                                </div>

                                {/* Format tag in corner */}
                                <span
                                  className={`absolute top-0.5 left-0.5 px-1 py-0 rounded text-[6px] font-bold shadow-xs ${
                                    isAttPdf ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                                  }`}
                                >
                                  {isAttPdf ? 'PDF' : 'IMG'}
                                </span>
                              </div>

                              {/* File name below thumbnail */}
                              <div className="p-0.5 px-1 bg-slate-50/60 border-t border-slate-100">
                                <p className="text-[9px] font-semibold text-slate-800 truncate" title={attName}>
                                  {attName}
                                </p>
                              </div>

                              {/* View & Open buttons below thumbnail */}
                              <div className="grid grid-cols-2 gap-0.5 p-1 pt-0 bg-slate-50/60">
                                <button
                                  type="button"
                                  onClick={() => openAttachmentPreview(att)}
                                  className="h-4.5 px-0.5 rounded bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-300 text-[8px] font-semibold flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
                                  title="View preview"
                                >
                                  <span>View</span>
                                </button>

                                <a
                                  href={viewUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="h-4.5 px-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-[8px] font-semibold flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
                                  title="Open in new tab"
                                >
                                  <span>Open</span>
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Row 5: Card Footer (Attribution & Posted Date) */}
                  <div className="pt-1.5 mt-0.5 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1 text-slate-500 truncate max-w-[160px] sm:max-w-none">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <span className="truncate">Posted by {asgn.createdBy || 'Lecturer'}</span>
                    </span>

                    {asgn.createdAt && (
                      <span className="shrink-0">{formatCreatedDate(asgn.createdAt)}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Attachment Preview Modal (Viewer for PDF and Images - Mobile Optimized) ─────────────── */}
      {previewModal.isOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4"
          onClick={closeAttachmentPreview}
        >
          <div
            className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between gap-2 px-3 py-2 sm:px-4 sm:py-3 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <span className="text-sm shrink-0">📎</span>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 truncate" title={previewModal.title}>
                  {previewModal.title}
                </h3>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href={previewModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-[11px] sm:text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                  title="Open in full browser window"
                >
                  <ExternalLinkIcon />
                  <span>Open</span>
                </a>

                <button
                  type="button"
                  onClick={closeAttachmentPreview}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer min-w-[28px] min-h-[28px] flex items-center justify-center"
                  title="Close preview"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto bg-slate-900/95 flex items-center justify-center p-1 sm:p-3 min-h-[240px] max-h-[calc(92vh-48px)]">
              {previewModal.type === 'photo' ? (
                <img
                  src={previewModal.url}
                  alt={previewModal.title}
                  className="max-w-full max-h-[75vh] object-contain rounded-md shadow-xl"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-stretch min-h-[360px] sm:min-h-[550px] bg-white rounded-md overflow-hidden">
                  <iframe
                    src={previewModal.url}
                    title={previewModal.title}
                    className="w-full flex-1 border-0 min-h-[360px] sm:min-h-[550px]"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Assignments;
