import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar2 from '../components/Navbar2';
import { API_BASE_URL } from '../config/api';

const Notices = () => {
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('all'); // 'all' | 'urgent' | 'important' | 'normal'

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/student/notices`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setNotices(data);
      }
    } catch (err) {
      console.error('Error fetching notices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  // Filter notices strictly based on title and priority
  const filteredNotices = useMemo(() => {
    return notices.filter((n) => {
      const matchTitle =
        !searchQuery.trim() ||
        (n.title && n.title.toLowerCase().includes(searchQuery.toLowerCase().trim()));

      const matchPriority =
        selectedPriority === 'all' ? true : (n.priority || 'normal') === selectedPriority;

      return matchTitle && matchPriority;
    });
  }, [notices, searchQuery, selectedPriority]);

  const urgentCount = notices.filter((n) => n.priority === 'urgent').length;
  const importantCount = notices.filter((n) => n.priority === 'important').length;

  const getPriorityBadge = (priority = 'normal') => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return {
          border: 'border-l-4 border-l-rose-500 border-rose-200/80',
          badge: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500 animate-pulse',
          label: 'Urgent',
        };
      case 'important':
        return {
          border: 'border-l-4 border-l-amber-500 border-amber-200/80',
          badge: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
          label: 'Important',
        };
      default:
        return {
          border: 'border-l-4 border-l-blue-500 border-slate-200',
          badge: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500',
          label: 'General',
        };
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <main className="min-h-screen w-full bg-sky-50 font-sans pb-8 flex flex-col items-center">
      <Navbar2 />

      {/* Sleek Scrollbar for Long Notices */}
      <style>{`
        .notice-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .notice-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .notice-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .notice-scroll::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
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
            onClick={fetchNotices}
            disabled={loading}
            className="h-8 sm:h-9 px-3 sm:px-3.5 rounded-md bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 text-xs sm:text-sm font-medium border border-slate-300 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
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
        <div className="w-full bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3.5">
          <div>
            <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">
              Notice Board
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Official circulars and announcements from department faculty
            </p>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold self-start sm:self-auto">
            <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              Total: {notices.length}
            </span>
            {urgentCount > 0 && (
              <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                {urgentCount} Urgent
              </span>
            )}
            {importantCount > 0 && (
              <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                {importantCount} Important
              </span>
            )}
          </div>
        </div>

        {/* ── Filter Bar (Compact & Responsive on Mobile) ── */}
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
              placeholder="Search by title..."
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

          {/* Priority Dropdown with Dedicated Width & Right Arrow */}
          <div className="relative shrink-0 w-28 sm:w-36">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full h-9 sm:h-10 pl-2.5 sm:pl-3 pr-7 sm:pr-8 text-xs sm:text-sm font-medium rounded-md bg-white border border-slate-300 text-slate-800 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs cursor-pointer appearance-none transition-colors truncate"
            >
              <option value="all">All Notices</option>
              <option value="urgent">Urgent</option>
              <option value="important">Important</option>
              <option value="normal">General</option>
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

        {/* ── Notice Feed List ── */}
        {loading ? (
          <div className="w-full bg-white py-12 rounded-xl border border-slate-200 text-center flex flex-col items-center justify-center shadow-2xs">
            <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2.5"></div>
            <p className="text-slate-600 text-xs sm:text-sm font-medium">Loading notices...</p>
          </div>
        ) : filteredNotices.length === 0 ? (
          <div className="w-full bg-white py-10 px-4 rounded-xl border border-slate-200 text-center shadow-2xs">
            <h3 className="text-sm sm:text-base font-bold text-slate-800 mb-1">No Notices Found</h3>
            <p className="text-slate-500 text-xs max-w-sm mx-auto mb-3.5">
              {searchQuery || selectedPriority !== 'all'
                ? 'No notices match your current search or filter.'
                : 'There are no notices posted at this time.'}
            </p>
            {(searchQuery || selectedPriority !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedPriority('all');
                }}
                className="px-3 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="w-full flex flex-col gap-2.5 sm:gap-3">
            {filteredNotices.map((notice) => {
              const style = getPriorityBadge(notice.priority);
              const authorName = notice.postedBy || 'Lecturer';

              return (
                <div
                  key={notice._id}
                  className={`w-full bg-white rounded-xl border shadow-2xs hover:shadow-xs transition-all p-3 sm:p-4 flex flex-col gap-2 sm:gap-2.5 ${style.border}`}
                >
                  {/* Notice Top Meta Header */}
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold border ${style.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
                        {style.label}
                      </span>

                      {notice.subject && (
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 truncate max-w-[150px] sm:max-w-none">
                          {notice.subject}
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] sm:text-xs text-slate-400 font-medium font-mono">
                      {formatDate(notice.createdAt)}
                    </span>
                  </div>

                  {/* Notice Title */}
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-snug">
                    {notice.title}
                  </h2>

                  {/* Notice Message with Scroll Bar if too big */}
                  <div className="bg-slate-50/80 p-2.5 sm:p-3 rounded-lg border border-slate-100 max-h-32 sm:max-h-44 overflow-y-auto notice-scroll">
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line font-normal break-words">
                      {notice.message}
                    </p>
                  </div>

                  {/* Notice Footer Attribution */}
                  <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 pt-0.5">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-[10px] sm:text-xs shrink-0">
                        {authorName ? authorName[0].toUpperCase() : 'L'}
                      </div>
                      <span className="font-semibold text-slate-700">
                        Prof. {authorName.replace(/^Prof\.?\s*/i, '')}
                      </span>
                    </div>

                    {notice.updatedBy && (
                      <span className="text-[10px] sm:text-[11px] text-slate-400 italic">
                        Edited
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
};

export default Notices;
