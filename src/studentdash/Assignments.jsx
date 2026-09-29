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
        shortLabel: 'No deadline',
        badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
        dotClass: 'bg-slate-400',
      };
    }

    const due = new Date(dueDateStr);
    if (isNaN(due.getTime())) {
      return {
        label: 'No deadline',
        shortLabel: 'No deadline',
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

    const shortDate = due.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    if (diffMs < 0) {
      const passedMinutes = Math.floor(Math.abs(diffMs) / (1000 * 60));
      const passedDays = Math.floor(passedMinutes / (60 * 24));
      const passedHours = Math.floor((passedMinutes % (60 * 24)) / 60);
      const overdueText = passedDays > 0 ? `${passedDays}d ago` : `${passedHours}h ago`;

      return {
        label: `Overdue • Due: ${formattedDate} (${overdueText})`,
        shortLabel: `Overdue (${overdueText})`,
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        dotClass: 'bg-rose-500',
      };
    }

    const timeLeft = getTimeRemaining(due.getTime(), currentTime);

    if (diffHours <= 24) {
      return {
        label: `Due: ${formattedDate} • ${timeLeft}`,
        shortLabel: timeLeft ? `Due: ${timeLeft}` : 'Due today',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        dotClass: 'bg-amber-500 animate-pulse',
      };
    }

    if (diffHours <= 48) {
      return {
        label: `Due: ${formattedDate} • ${timeLeft}`,
        shortLabel: timeLeft ? `Due: ${timeLeft}` : 'Due soon',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        dotClass: 'bg-amber-500',
      };
    }

    return {
      label: `Due: ${formattedDate} • ${timeLeft}`,
      shortLabel: `Due ${shortDate}`,
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

      {/* ── Main Container (Mobile Responsive, Max Width 4xl) ── */}
      <div className="flex-1 w-[90%] sm:w-full max-w-sm sm:max-w-4xl mx-auto px-0 sm:px-6 py-3.5 sm:py-5 flex flex-col gap-3 sm:gap-3.5 items-stretch">
        
        {/* ── Top Bar ── */}
        <div className="w-full flex items-center justify-between gap-2">
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
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Dashboard</span>
          </button>

          <button
            onClick={fetchStudentAssignments}
            disabled={loading}
            className="h-8 sm:h-9 px-2.5 sm:px-3.5 rounded-lg bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 text-xs sm:text-sm font-medium border border-slate-200/90 hover:border-slate-300 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
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

        {/* ── Header Card ── */}
        <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">
                Assignments
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 hidden xs:block">
                Course tasks and homework posted by your faculty
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold flex-wrap">
            <span className="px-2.5 py-0.5 sm:py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80">
              Total: {assignments.length}
            </span>
            {stats.dueSoon > 0 && (
              <span className="px-2.5 py-0.5 sm:py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                {stats.dueSoon} Due Soon
              </span>
            )}
            {stats.overdue > 0 && (
              <span className="px-2.5 py-0.5 sm:py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                {stats.overdue} Overdue
              </span>
            )}
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <div className="w-full flex items-center gap-2">
          {/* Search Box */}
          <div className="flex items-center gap-2 h-9 sm:h-10 px-3 rounded-xl bg-white border border-slate-200/90 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all shadow-2xs flex-1 min-w-0">
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
              placeholder="Search assignments..."
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

          {/* Subject Dropdown */}
          <div className="relative shrink-0 w-28 sm:w-36">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full h-9 sm:h-10 pl-2.5 sm:pl-3 pr-7 sm:pr-8 text-xs sm:text-sm font-medium rounded-xl bg-white border border-slate-200/90 text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs cursor-pointer appearance-none transition-all truncate"
            >
              <option value="all">All Subjects</option>
              {uniqueSubjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
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
          <div className="w-full bg-white py-12 rounded-2xl border border-slate-200/90 text-center flex flex-col items-center justify-center shadow-2xs">
            <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2.5"></div>
            <p className="text-slate-600 text-xs sm:text-sm font-medium">Loading assignments...</p>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="w-full bg-white py-10 px-4 rounded-2xl border border-slate-200/90 text-center flex flex-col items-center justify-center shadow-2xs">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
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
                className="mt-3.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:gap-3.5">
            {filteredAssignments.map((asgn) => {
              const deadline = getDeadlineInfo(asgn.dueDate);
              const attachments = getAssignmentAttachments(asgn);

              return (
                <article
                  key={asgn._id}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 transition-all shadow-2xs p-3.5 sm:p-5 flex flex-col gap-2.5 sm:gap-3"
                >
                  {/* Row 1: Subject, Marks & Due Badge */}
                  <div className="flex items-center justify-between gap-1.5 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] sm:text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                        {asgn.subject}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
                        🎯 {asgn.totalMarks || 0} Marks
                      </span>
                    </div>

                    {/* Due text & countdown badge */}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] sm:text-xs font-semibold ${deadline.badgeClass}`}>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${deadline.dotClass}`} />
                      <span className="hidden sm:inline">{deadline.label}</span>
                      <span className="sm:hidden">{deadline.shortLabel || deadline.label}</span>
                    </span>
                  </div>

                  {/* Row 2: Title */}
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-snug tracking-tight break-words">
                    {asgn.title}
                  </h2>

                  {/* Row 3: Description / Instructions */}
                  {asgn.description && (
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line font-normal break-words">
                      {asgn.description}
                    </p>
                  )}

                  {/* Row 4: Attachments (Clean, readable chips) */}
                  {attachments.length > 0 && (
                    <div className="flex flex-col gap-1.5 pt-0.5">
                      <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500">
                        Attachments ({attachments.length}):
                      </span>

                      <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                        {attachments.map((att, idx) => {
                          const attName = att.fileName || `Attachment ${idx + 1}`;
                          const isAttPdf =
                            att.fileType === 'pdf' ||
                            (att.fileName && att.fileName.toLowerCase().endsWith('.pdf'));
                          const viewUrl = getAttachmentViewUrl(att);

                          return (
                            <div
                              key={idx}
                              className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/90 hover:border-slate-300 hover:bg-slate-100/60 transition-all w-full sm:w-auto sm:max-w-xs group"
                            >
                              <div
                                onClick={() => openAttachmentPreview(att)}
                                className="flex items-center gap-2 min-w-0 cursor-pointer flex-1"
                              >
                                <span
                                  className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] shrink-0 font-bold ${
                                    isAttPdf
                                      ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                      : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                  }`}
                                >
                                  {isAttPdf ? 'PDF' : 'IMG'}
                                </span>
                                <span className="text-xs font-semibold text-slate-700 truncate group-hover:text-blue-600 transition-colors">
                                  {attName}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => openAttachmentPreview(att)}
                                  className="px-2 py-1 rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-[11px] font-medium transition-colors cursor-pointer shadow-2xs"
                                  title="View preview"
                                >
                                  View
                                </button>
                                <a
                                  href={viewUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center justify-center shadow-2xs"
                                  title="Open in new tab"
                                >
                                  <ExternalLinkIcon />
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Row 5: Card Footer (Attribution & Posted Date) */}
                  <div className="border-t border-slate-100 pt-2.5 mt-0.5 flex items-center justify-between text-[11px] sm:text-xs text-slate-500">
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 flex items-center justify-center font-bold text-[10px] sm:text-xs shrink-0">
                        {(asgn.createdBy || 'L')[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-700 truncate">
                        Prof. {(asgn.createdBy || 'Lecturer').replace(/^Prof\.?\s*/i, '')}
                      </span>
                    </div>

                    {asgn.createdAt && (
                      <span className="text-[10px] sm:text-xs text-slate-400 font-medium shrink-0">
                        {formatCreatedDate(asgn.createdAt)}
                      </span>
                    )}
                  </div>
                </article>
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
