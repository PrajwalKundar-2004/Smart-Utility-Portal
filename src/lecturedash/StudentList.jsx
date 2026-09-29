import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import Navbar1 from '../components/Navbar1';
import { API_BASE_URL } from '../config/api';

const TrashIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
    <path d="M10 11v6"></path>
    <path d="M14 11v6"></path>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
  </svg>
);

const StudentList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedUsn, setExpandedUsn] = useState(null);
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'high_attendance', 'low_attendance'
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch comprehensive student overview
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/lecture/students-overview`);
      const data = await res.json();
      if (data.success) {
        setStudents(data.students || []);
        setSubjects(data.subjects || []);
      } else {
        toast.error('Failed to load student records');
      }
    } catch (err) {
      console.error('Error fetching students overview:', err);
      toast.error('Server error connecting to backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleExpand = (usn) => {
    setExpandedUsn(prev => (prev === usn ? null : usn));
  };

  const handleRemoveClick = (e, st) => {
    e.stopPropagation();
    setStudentToDelete(st);
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`${API_BASE_URL}/api/lecture/student/${encodeURIComponent(studentToDelete.usn)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || `Removed ${studentToDelete.username}`, { duration: 3000 });
        setStudents(prev => prev.filter(s => s.usn.toLowerCase() !== studentToDelete.usn.toLowerCase()));
        if (expandedUsn === studentToDelete.usn) {
          setExpandedUsn(null);
        }
        setStudentToDelete(null);
      } else {
        toast.error(data.message || 'Failed to remove student');
      }
    } catch (err) {
      console.error('Error removing student:', err);
      toast.error('Server error removing student');
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && studentToDelete && !isDeleting) {
        setStudentToDelete(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [studentToDelete, isDeleting]);

  // Filter students based on search query and attendance filter
  const filteredStudents = students.filter(st => {
    const matchesSearch =
      st.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.usn?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterMode === 'high_attendance') {
      return st.overallAttendancePercentage >= 75;
    } else if (filterMode === 'low_attendance') {
      return st.overallAttendancePercentage < 75;
    }
    return true;
  });

  // KPI Calculations
  const totalStudentsCount = students.length;
  const avgCombinedPercentage = totalStudentsCount > 0
    ? (students.reduce((acc, curr) => acc + (curr.combinedPercentage || 0), 0) / totalStudentsCount).toFixed(1)
    : '0.0';
  const avgAttendancePercentage = totalStudentsCount > 0
    ? (students.reduce((acc, curr) => acc + (curr.overallAttendancePercentage || 0), 0) / totalStudentsCount).toFixed(1)
    : '0.0';

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-sky-50 font-sans pb-16">
      <Toaster />

      {/* ── Sticky Top Navbar ── */}
      <div className="sticky top-0 z-40 w-full shadow-xs">
        <Navbar1 />
      </div>

      <div className="w-full max-w-lg sm:max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-3 sm:py-8 flex flex-col gap-2.5 sm:gap-6">

        {/* ── Header Bar ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-6 bg-white/80 backdrop-blur-md p-3 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border border-white shadow-xs">
          <div className="flex-1 min-w-0 w-full">
            <button
              onClick={() => navigate('/lecturedash')}
              className="inline-flex items-center gap-1 text-[11px] sm:text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors mb-1 sm:mb-2.5 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              <span>Back to Dashboard</span>
            </button>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
              <h1 className="text-base sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                Students
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
                🎓 {totalStudentsCount} Students
              </span>
            </div>

            <p className="text-slate-500 text-[11px] sm:text-sm lg:text-base mt-0.5 sm:mt-1.5 leading-snug">
              Student marks, percentages, and attendance overview.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto shrink-0 justify-end">
            <button
              onClick={fetchData}
              disabled={loading}
              className="h-8 sm:h-11 w-full sm:w-auto inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 rounded-lg sm:rounded-xl bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-700 border border-slate-200 hover:border-blue-300 text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all cursor-pointer disabled:opacity-50"
              title="Refresh student data"
            >
              <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 ${loading ? 'animate-spin' : ''}`} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* ── KPI Summary Cards ── */}
        <div className="grid grid-cols-3 sm:grid-cols-3 gap-1.5 sm:gap-4">
          <div className="bg-white/90 backdrop-blur-xs p-2 sm:p-5 rounded-lg sm:rounded-2xl border border-slate-200/80 shadow-2xs sm:shadow-xs flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-1 sm:gap-4">
            <div className="w-7 h-7 sm:w-12 sm:h-12 rounded-md sm:rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-2xs shrink-0">
              <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <div className="min-w-0">
              <p className="text-[9px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider truncate">Students</p>
              <h3 className="text-sm sm:text-2xl font-black text-slate-900 leading-tight">{totalStudentsCount}</h3>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xs p-2 sm:p-5 rounded-lg sm:rounded-2xl border border-slate-200/80 shadow-2xs sm:shadow-xs flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-1 sm:gap-4">
            <div className="w-7 h-7 sm:w-12 sm:h-12 rounded-md sm:rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-2xs shrink-0">
              <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
            </div>
            <div className="min-w-0">
              <p className="text-[9px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider truncate">
                <span className="sm:hidden">Avg Marks</span>
                <span className="hidden sm:inline">Average Marks</span>
              </p>
              <h3 className="text-sm sm:text-2xl font-black text-slate-900 leading-tight">{avgCombinedPercentage}%</h3>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xs p-2 sm:p-5 rounded-lg sm:rounded-2xl border border-slate-200/80 shadow-2xs sm:shadow-xs flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-1 sm:gap-4">
            <div className="w-7 h-7 sm:w-12 sm:h-12 rounded-md sm:rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-2xs shrink-0">
              <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <div className="min-w-0">
              <p className="text-[9px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider truncate">
                <span className="sm:hidden">Avg Att</span>
                <span className="hidden sm:inline">Average Attendance</span>
              </p>
              <h3 className="text-sm sm:text-2xl font-black text-slate-900 leading-tight">{avgAttendancePercentage}%</h3>
            </div>
          </div>
        </div>

        {/* ── Search & Filter Controls ── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4 bg-white p-2.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs">
          
          {/* Search Input: Distinct Icon Separation to Avoid Overlapping */}
          <div className="flex items-center flex-1 max-w-full sm:max-w-lg bg-slate-50 hover:bg-white focus-within:bg-white border border-slate-200 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 rounded-lg sm:rounded-2xl px-2.5 py-1.5 sm:px-4 sm:py-2.5 transition-all">
            <div className="text-slate-400 flex items-center justify-center shrink-0">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>

            {/* Generous spacing to guarantee no overlap with placeholder or input text */}
            <div className="w-2.5 sm:w-4 shrink-0"></div>

            <div className="flex-1 flex items-center min-w-0 pr-1">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search student or USN..."
                className="w-full bg-transparent outline-none text-slate-800 placeholder-slate-400 text-xs sm:text-sm font-semibold"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-0.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors ml-1 cursor-pointer shrink-0"
                  title="Clear search"
                >
                  <svg className="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              )}
            </div>
          </div>

          {/* Quick Filter Badges (Smooth scrollable on mobile) */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-0.5 sm:pb-0">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-xl text-[11px] sm:text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                filterMode === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({students.length})
            </button>
            <button
              onClick={() => setFilterMode('high_attendance')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-xl text-[11px] sm:text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                filterMode === 'high_attendance'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Att ≥ 75%
            </button>
            <button
              onClick={() => setFilterMode('low_attendance')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-xl text-[11px] sm:text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                filterMode === 'low_attendance'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              Att &lt; 75%
            </button>
          </div>
        </div>

        {/* ── Student List Container ── */}
        <div>
          {loading ? (
            <div className="bg-white rounded-xl sm:rounded-3xl border border-slate-200/80 p-6 sm:p-12 text-center shadow-xs">
              <div className="inline-block animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-4 border-blue-500 border-t-transparent mb-3"></div>
              <p className="text-slate-500 text-xs sm:text-base font-semibold">Loading students…</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="bg-white rounded-xl sm:rounded-3xl border border-slate-200/80 p-6 sm:p-12 text-center shadow-xs">
              <span className="text-3xl sm:text-6xl block mb-2 sm:mb-3">🎓</span>
              <h3 className="text-base sm:text-xl font-bold text-slate-800 mb-1">No Students Found</h3>
              <p className="text-slate-400 text-xs sm:text-sm max-w-sm mx-auto">
                {searchQuery ? `No students matched your search "${searchQuery}".` : 'No students found.'}
              </p>
            </div>
          ) : (
            <>
              {/* ─────────────────────────────────────────────────────────────
                  1. MOBILE / SMALL SCREEN VIEW (Phones: < 768px / md)
                  Directly shows student cards with full subject marks & stats
                  ───────────────────────────────────────────────────────────── */}
              <div className="block md:hidden space-y-2 sm:space-y-3">
                {filteredStudents.map((st, index) => {
                  const isExpanded = expandedUsn === st.usn;
                  const marksColor = st.combinedPercentage >= 75
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : st.combinedPercentage >= 60
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200';

                  const attColor = st.overallAttendancePercentage >= 75
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200';

                  return (
                    <div
                      key={st.usn}
                      className="bg-white rounded-xl border border-slate-200 shadow-2xs p-3 flex flex-col gap-2.5"
                    >
                      {/* Top: Student Header */}
                      <div className="flex items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                            {st.username ? st.username[0].toUpperCase() : 'S'}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm truncate" title={st.username}>
                              {st.username}
                            </h4>
                            <span className="font-mono text-[10px] sm:text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100 inline-block">
                              {st.usn}
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] sm:text-xs font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 shrink-0">
                          #{index + 1}
                        </span>
                      </div>

                      {/* Middle: 3-column stats bar */}
                      <div className="grid grid-cols-3 gap-1.5 bg-slate-50/80 p-2 rounded-lg border border-slate-200/70 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <p className="text-[9px] uppercase font-bold text-slate-400">Total Marks</p>
                          <p className="text-xs sm:text-sm font-black text-slate-900 mt-0.5">{st.combinedTotalMarks}</p>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                          <p className="text-[9px] uppercase font-bold text-slate-400">Score %</p>
                          <span className={`inline-block text-[10px] sm:text-xs font-extrabold px-1.5 py-0.2 rounded border mt-0.5 ${marksColor}`}>
                            {st.combinedPercentage}%
                          </span>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                          <p className="text-[9px] uppercase font-bold text-slate-400">Attendance</p>
                          <span className={`inline-block text-[10px] sm:text-xs font-extrabold px-1.5 py-0.2 rounded border mt-0.5 ${attColor}`}>
                            {st.overallAttendancePercentage}%
                          </span>
                        </div>
                      </div>

                      {/* Mobile Actions: Breakdown & Remove Student */}
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => toggleExpand(st.usn)}
                          className={`py-1.5 px-2.5 rounded-lg text-[11px] sm:text-xs font-bold min-h-[30px] flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                            isExpanded
                              ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                              : 'bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border-slate-200 shadow-2xs'
                          }`}
                        >
                          <span>{isExpanded ? 'Hide' : 'Breakdown'}</span>
                          <svg
                            className={`w-3 h-3 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </button>

                        <button
                          onClick={(e) => handleRemoveClick(e, st)}
                          className="py-1.5 px-2.5 rounded-lg text-[11px] sm:text-xs font-bold min-h-[30px] flex items-center justify-center gap-1 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 shadow-2xs transition-all cursor-pointer"
                          title={`Remove ${st.username} (${st.usn})`}
                        >
                          <TrashIcon className="w-3 h-3 text-rose-600" />
                          <span>Remove</span>
                        </button>
                      </div>

                      {/* Detailed Breakdown: ONLY shown when the lecturer clicks the Breakdown button */}
                      {isExpanded && (
                        <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 pb-0.5">
                            <span className="flex items-center gap-1">
                              <span>📚</span> Subject Breakdown
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold">
                              {st.subjects.length} Subjects
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            {st.subjects.length === 0 ? (
                              <p className="text-[11px] text-slate-400 py-2.5 text-center bg-slate-50 rounded-lg">
                                No subjects recorded.
                              </p>
                            ) : (
                              st.subjects.map((sub, sIdx) => {
                                const subAttColor = sub.attendancePercentage >= 75
                                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                                  : 'text-rose-700 bg-rose-50 border-rose-200';

                                return (
                                  <div
                                    key={sIdx}
                                    className="bg-slate-50 rounded-lg p-2.5 border border-slate-200/80 flex flex-col gap-1.5"
                                  >
                                    {/* Subject Title & Subject Total Marks */}
                                    <div className="flex items-center justify-between gap-1.5">
                                      <span className="font-extrabold text-slate-900 text-xs truncate">
                                        {sub.subject}
                                      </span>
                                      <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-[10px] font-black text-blue-700 shrink-0 shadow-2xs">
                                        Total: {sub.totalMarks}
                                      </span>
                                    </div>

                                    {/* Marks Component Tags */}
                                    {sub.columns && sub.columns.length > 0 ? (
                                      <div className="flex flex-wrap gap-1">
                                        {sub.columns.map((c, cIdx) => (
                                          <span
                                            key={cIdx}
                                            className="bg-white border border-slate-200 text-slate-700 text-[10px] px-1.5 py-0.5 rounded font-medium"
                                          >
                                            <span className="text-slate-500 font-semibold">{c.name}:</span>{' '}
                                            <strong className="text-slate-900 font-bold">{c.value}</strong>
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-[10px] text-slate-400 italic">No mark components</span>
                                    )}

                                    {/* Attendance Row */}
                                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-200/80 mt-0.5">
                                      <span className="text-slate-500 font-medium truncate">
                                        Att: {sub.totalClasses > 0 ? `${sub.attendedClasses}/${sub.totalClasses} classes` : (sub.attendancePercentage > 0 ? `${sub.attendancePercentage}% rec` : 'Not marked')}
                                      </span>
                                      <span className={`px-1.5 py-0.2 rounded-full font-extrabold border text-[9px] shrink-0 ${subAttColor}`}>
                                        {sub.attendancePercentage}% att
                                      </span>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ─────────────────────────────────────────────────────────────
                  2. DESKTOP / TABLET VIEW (Wide table for screens >= 768px / md)
                  ───────────────────────────────────────────────────────────── */}
              <div className="hidden md:block bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead>
                      <tr className="bg-slate-100 border-b-2 border-slate-200 text-slate-700 text-xs sm:text-sm uppercase tracking-wider font-extrabold">
                        <th className="py-3 px-4 w-14 text-center border-r border-slate-200">#</th>
                        <th className="py-3 px-6 min-w-[220px] border-r border-slate-200">Student Name</th>
                        <th className="py-3 px-5 min-w-[140px] border-r border-slate-200">USN</th>
                        <th className="py-3 px-5 text-center min-w-[150px] border-r border-slate-200">
                          Combined Total
                        </th>
                        <th className="py-3 px-5 text-center min-w-[140px] border-r border-slate-200">
                          Marks %
                        </th>
                        <th className="py-3 px-5 text-center min-w-[160px] border-r border-slate-200">
                          Attendance %
                        </th>
                        <th className="py-3 px-4 text-center min-w-[190px]">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-200 text-sm">
                      {filteredStudents.map((st, index) => {
                        const isExpanded = expandedUsn === st.usn;
                        const marksColor = st.combinedPercentage >= 75
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : st.combinedPercentage >= 60
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200';

                        const attColor = st.overallAttendancePercentage >= 75
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200';

                        return (
                          <React.Fragment key={st.usn}>
                            <tr
                              onClick={() => toggleExpand(st.usn)}
                              className={`hover:bg-blue-50/50 transition-colors cursor-pointer ${
                                isExpanded ? 'bg-blue-50/40' : index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                              }`}
                            >
                              {/* Index */}
                              <td className="py-3 px-4 text-center font-bold text-slate-400 border-r border-slate-200">
                                {index + 1}
                              </td>

                              {/* Student Name + Avatar */}
                              <td className="py-3 px-6 border-r border-slate-200">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                                    {st.username ? st.username[0].toUpperCase() : 'S'}
                                  </div>
                                  <div className="truncate">
                                    <span className="font-extrabold text-slate-900 block truncate" title={st.username}>
                                      {st.username}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* USN */}
                              <td className="py-3 px-5 border-r border-slate-200 whitespace-nowrap">
                                <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 text-xs">
                                  {st.usn}
                                </span>
                              </td>

                              {/* Combined Total Marks */}
                              <td className="py-3 px-5 border-r border-slate-200 text-center font-black text-slate-800">
                                <span className="bg-slate-100 px-3 py-1 rounded-lg text-sm border border-slate-200">
                                  {st.combinedTotalMarks}
                                </span>
                              </td>

                              {/* Combined Percentage */}
                              <td className="py-3 px-5 border-r border-slate-200 text-center">
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold border ${marksColor}`}>
                                  {st.combinedPercentage}%
                                </span>
                              </td>

                              {/* Overall Attendance Percentage */}
                              <td className="py-3 px-5 border-r border-slate-200 text-center">
                                <div className="inline-flex flex-col items-center">
                                  <span className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-extrabold border ${attColor}`}>
                                    {st.overallAttendancePercentage}%
                                  </span>
                                  {st.overallTotalClasses > 0 && (
                                    <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                      {st.overallAttended}/{st.overallTotalClasses} classes
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Actions: Details & Remove */}
                              <td className="py-3 px-4 text-center whitespace-nowrap">
                                <div className="inline-flex items-center justify-center gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleExpand(st.usn);
                                    }}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                      isExpanded
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                        : 'bg-white text-slate-700 hover:text-blue-600 border-slate-200 hover:border-blue-300'
                                    }`}
                                  >
                                    <span>{isExpanded ? 'Hide' : 'Details'}</span>
                                    <svg
                                      className={`w-3.5 h-3.5 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="14"
                                      height="14"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                  </button>

                                  <button
                                    onClick={(e) => handleRemoveClick(e, st)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:border-rose-300 transition-all cursor-pointer shadow-2xs"
                                    title={`Remove ${st.username} (${st.usn})`}
                                  >
                                    <TrashIcon className="w-3.5 h-3.5 text-rose-600" />
                                    <span>Remove</span>
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {/* ── Expandable Detail Section ── */}
                            {isExpanded && (
                              <tr className="bg-slate-50/80 border-b border-slate-200">
                                <td colSpan={7} className="p-4 sm:p-6">
                                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-4">
                                      <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                                          📚
                                        </div>
                                        <div>
                                          <h4 className="text-base font-bold text-slate-900">
                                            Subject-wise Breakdown: <span className="text-blue-600">{st.username}</span>
                                          </h4>
                                          <p className="text-xs text-slate-400">USN: {st.usn}</p>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-3 text-xs font-bold">
                                        <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg border border-slate-200">
                                          Total Marks: <strong className="text-slate-900">{st.combinedTotalMarks}</strong>
                                        </span>
                                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg border border-blue-200">
                                          Overall Score: <strong className="text-blue-900">{st.combinedPercentage}%</strong>
                                        </span>
                                      </div>
                                    </div>

                                    {st.subjects.length === 0 ? (
                                      <p className="text-slate-400 text-sm py-4 text-center">No subjects registered yet.</p>
                                    ) : (
                                      <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs sm:text-sm border-collapse">
                                          <thead>
                                            <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                                              <th className="py-2.5 px-4">Subject Name</th>
                                              <th className="py-2.5 px-4">Marks Components</th>
                                              <th className="py-2.5 px-4 text-center">Subject Total</th>
                                              <th className="py-2.5 px-4 text-center">Classes Attended</th>
                                              <th className="py-2.5 px-4 text-center">Attendance %</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-100">
                                            {st.subjects.map((sub, sIdx) => {
                                              const subAttColor = sub.attendancePercentage >= 75
                                                ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                                                : 'text-rose-700 bg-rose-50 border-rose-200';

                                              return (
                                                <tr key={sIdx} className="hover:bg-slate-50/50">
                                                  <td className="py-3 px-4 font-bold text-slate-900">
                                                    {sub.subject}
                                                  </td>
                                                  <td className="py-3 px-4">
                                                    {sub.columns && sub.columns.length > 0 ? (
                                                      <div className="flex flex-wrap gap-1.5">
                                                        {sub.columns.map((c, cIdx) => (
                                                          <span
                                                            key={cIdx}
                                                            className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-md font-semibold"
                                                          >
                                                            <span className="text-slate-500">{c.name}:</span>
                                                            <strong className="text-slate-900">{c.value}</strong>
                                                          </span>
                                                        ))}
                                                      </div>
                                                    ) : (
                                                      <span className="text-slate-400 text-xs italic">No components saved</span>
                                                    )}
                                                  </td>
                                                  <td className="py-3 px-4 text-center font-black text-slate-800">
                                                    <span className="bg-slate-100 px-2.5 py-1 rounded-md text-xs border border-slate-200">
                                                      {sub.totalMarks}
                                                    </span>
                                                  </td>
                                                  <td className="py-3 px-4 text-center text-slate-600 font-bold">
                                                    {sub.totalClasses > 0 ? (
                                                      <span>{sub.attendedClasses} / {sub.totalClasses}</span>
                                                    ) : sub.attendancePercentage > 0 ? (
                                                      <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-xs font-extrabold border border-blue-100">Sheet ({sub.attendancePercentage}%)</span>
                                                    ) : (
                                                      <span className="text-slate-400 text-xs">Not marked</span>
                                                    )}
                                                  </td>
                                                  <td className="py-3 px-4 text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${subAttColor}`}>
                                                      {sub.attendancePercentage}%
                                                    </span>
                                                  </td>
                                                </tr>
                                              );
                                            })}
                                          </tbody>
                                        </table>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Confirmation Modal for Removing Student ── */}
      {studentToDelete && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => !isDeleting && setStudentToDelete(null)}
        >
          <div 
            className="bg-white rounded-xl sm:rounded-3xl shadow-2xl border border-slate-200 max-w-sm sm:max-w-md w-full p-4 sm:p-7 relative overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Top red glow accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-red-500 to-amber-500"></div>

            {/* Header with Icon */}
            <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-inner">
                <TrashIcon className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-xl font-black text-slate-900 leading-snug">
                  Remove Student
                </h3>
                <p className="text-[11px] sm:text-sm text-slate-500 mt-0.5">
                  This will delete their credentials from the system.
                </p>
              </div>
            </div>

            {/* Student badge card */}
            <div className="bg-slate-50 rounded-lg sm:rounded-2xl p-2.5 sm:p-3.5 border border-slate-200 mb-3 sm:mb-4 flex items-center justify-between gap-2.5 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-md sm:rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs sm:text-sm shrink-0 shadow-2xs">
                  {studentToDelete.username ? studentToDelete.username[0].toUpperCase() : 'S'}
                </div>
                <div className="min-w-0 truncate">
                  <p className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">{studentToDelete.username}</p>
                  <span className="font-mono text-[10px] sm:text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100 inline-block">
                    {studentToDelete.usn}
                  </span>
                </div>
              </div>
              <span className="text-[10px] sm:text-xs font-extrabold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-rose-100 text-rose-700 shrink-0">
                To be removed
              </span>
            </div>

            {/* Warning callout */}
            <div className="bg-rose-50/80 border border-rose-200 rounded-lg sm:rounded-2xl p-2.5 sm:p-3.5 mb-4 sm:mb-6 text-[11px] sm:text-xs text-rose-800 space-y-1">
              <p className="font-extrabold flex items-center gap-1 text-rose-900">
                <span>⚠️</span> Important Notice:
              </p>
              <p className="leading-relaxed">
                The student's account and login credentials will be erased immediately. If they need to access the portal again in the future, they will have to sign up from scratch and recreate their login.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setStudentToDelete(null)}
                className="flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-50 min-h-[34px] sm:min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 disabled:opacity-60 min-h-[34px] sm:min-h-[44px]"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Removing...</span>
                  </>
                ) : (
                  <>
                    <TrashIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Yes, Remove</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default StudentList;
