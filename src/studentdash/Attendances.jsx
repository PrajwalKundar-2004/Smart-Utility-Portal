import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import Navbar2 from '../components/Navbar2';

const Attendances = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState({ sheet: null, sessionStats: {} });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'eligible' | 'shortage'

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/student/attendance', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setAttendanceData(data);
      } else {
        toast.error(data.message || 'Failed to load attendance records');
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
      toast.error('Server error connecting to backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  // Compute merged subject attendance list
  const sheetSubjects = attendanceData.sheet?.subjects || [];
  const sessionStats = attendanceData.sessionStats || {};

  // All unique subject names
  const subjectNames = useMemo(() => {
    const set = new Set([
      ...sheetSubjects.map((s) => s.subject).filter(Boolean),
      ...Object.keys(sessionStats),
    ]);
    return Array.from(set).sort();
  }, [sheetSubjects, sessionStats]);

  // Aggregate stats per subject
  const subjectList = useMemo(() => {
    return subjectNames.map((subName) => {
      const sheetSub = sheetSubjects.find(
        (s) => s.subject?.toLowerCase() === subName.toLowerCase()
      );
      const stats = sessionStats[subName] || { totalClasses: 0, attendedClasses: 0 };

      let percentage = 0;
      if (sheetSub && sheetSub.total !== undefined && sheetSub.total !== null) {
        percentage = Number(sheetSub.total) || 0;
      } else if (stats.totalClasses > 0) {
        percentage = Number(((stats.attendedClasses / stats.totalClasses) * 100).toFixed(1));
      }

      return {
        subject: subName,
        percentage,
        isEligible: percentage >= 75,
        sheetColumns: sheetSub?.columns || [],
        sessionStats: stats,
      };
    });
  }, [subjectNames, sheetSubjects, sessionStats]);

  // Summary Metrics
  const summary = useMemo(() => {
    const total = subjectList.length;
    if (total === 0) {
      return {
        overallPercentage: '0.0',
        eligibleCount: 0,
        shortageCount: 0,
        isEligible: false,
      };
    }

    const sum = subjectList.reduce((acc, curr) => acc + curr.percentage, 0);
    const overall = (sum / total).toFixed(1);
    const eligibleCount = subjectList.filter((s) => s.percentage >= 75).length;
    const shortageCount = subjectList.filter((s) => s.percentage < 75).length;

    return {
      overallPercentage: overall,
      eligibleCount,
      shortageCount,
      isEligible: Number(overall) >= 75,
    };
  }, [subjectList]);

  // Filtered Subject List
  const filteredSubjects = useMemo(() => {
    return subjectList.filter((sub) => {
      const matchSearch =
        !searchQuery.trim() ||
        sub.subject.toLowerCase().includes(searchQuery.toLowerCase().trim());

      const matchStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'eligible'
          ? sub.percentage >= 75
          : sub.percentage < 75;

      return matchSearch && matchStatus;
    });
  }, [subjectList, searchQuery, statusFilter]);

  return (
    <main className="min-h-screen w-full bg-sky-50 font-sans pb-10 flex flex-col items-center">
      <Toaster position="top-center" />
      <Navbar2 />

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
            onClick={fetchAttendance}
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
              Attendance Records
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Subject-wise lecture attendance, percentages, and examination eligibility
            </p>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs font-semibold self-start sm:self-auto flex-wrap">
            <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              Total: {subjectList.length} Subjects
            </span>
            <span
              className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md border flex items-center gap-1 ${
                summary.isEligible
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  summary.isEligible ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
              {summary.isEligible ? 'Eligible (≥ 75%)' : 'Shortage Alert (< 75%)'}
            </span>
          </div>
        </div>

        {/* ── Eye-Catchy KPI Summary Cards (3 Compact Cards) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5 w-full">
          {/* Card 1: Overall Percentage */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3 sm:p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-lg shrink-0">
              📊
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Overall Attendance
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-lg sm:text-xl font-black text-slate-900">
                  {summary.overallPercentage}%
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                    summary.isEligible
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {summary.isEligible ? 'Eligible' : 'Shortage'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Eligible Subjects Count */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3 sm:p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-lg shrink-0">
              🎓
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Eligible Subjects
              </p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg sm:text-xl font-black text-slate-900">
                  {summary.eligibleCount}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  of {subjectList.length} subjects (≥ 75%)
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Shortage / Action Needed */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3 sm:p-4 flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg shrink-0 border ${
                summary.shortageCount === 0
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {summary.shortageCount === 0 ? '✓' : '⚠️'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Attendance Standing
              </p>
              <p
                className={`text-xs sm:text-sm font-bold mt-0.5 truncate ${
                  summary.shortageCount === 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {summary.shortageCount === 0
                  ? 'All criteria fulfilled'
                  : `${summary.shortageCount} subject(s) below 75%`}
              </p>
            </div>
          </div>
        </div>

        {/* ── Search & Filter Bar (Mobile-safe side-by-side) ── */}
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
              placeholder="Search by subject name..."
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

          {/* Status Dropdown */}
          <div className="relative shrink-0 w-28 sm:w-36">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-9 sm:h-10 pl-2 sm:pl-3 pr-6 sm:pr-7 text-xs sm:text-sm font-medium rounded-md bg-white border border-slate-300 text-slate-800 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs cursor-pointer appearance-none transition-colors truncate"
            >
              <option value="all">All Subjects</option>
              <option value="eligible">Eligible (≥75%)</option>
              <option value="shortage">Shortage (&lt;75%)</option>
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

        {/* ── Attendance Cards Feed ── */}
        {loading ? (
          <div className="w-full bg-white py-12 rounded-xl border border-slate-200 text-center flex flex-col items-center justify-center shadow-2xs">
            <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2.5"></div>
            <p className="text-slate-600 text-xs sm:text-sm font-medium">Loading attendance records...</p>
          </div>
        ) : filteredSubjects.length === 0 ? (
          <div className="w-full bg-white py-12 px-4 rounded-xl border border-slate-200 text-center flex flex-col items-center justify-center shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold mb-3">
              📅
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-800">
              {searchQuery || statusFilter !== 'all'
                ? 'No matching subjects found'
                : 'No attendance records uploaded yet'}
            </h3>
            <p className="text-slate-500 text-xs mt-1 max-w-sm">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search keyword or clearing the filter.'
                : 'Attendance details will appear here once uploaded by your faculty.'}
            </p>
            {(searchQuery || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="mt-3.5 px-3 py-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold cursor-pointer transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 sm:gap-3">
            {filteredSubjects.map((sub) => {
              const isGood = sub.percentage >= 75;
              const isWarning = sub.percentage >= 60 && sub.percentage < 75;

              const badgeColor = isGood
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : isWarning
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-rose-50 text-rose-700 border-rose-200';

              const barColor = isGood
                ? 'bg-emerald-500'
                : isWarning
                ? 'bg-amber-500'
                : 'bg-rose-500';

              const clampedPercentage = Math.min(100, Math.max(0, sub.percentage));

              return (
                <div
                  key={sub.subject}
                  className="bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 transition-all shadow-2xs p-3.5 sm:p-4.5 flex flex-col gap-2.5"
                >
                  {/* Row 1: Subject on Left, Percentage & Status Badge on Right */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 sm:px-2.5 py-0.5 rounded-md text-[11px] sm:text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Subject
                      </span>
                      <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                        {sub.subject}
                      </h2>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Eligibility Pill */}
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] sm:text-xs font-semibold ${badgeColor}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isGood ? 'bg-emerald-500' : isWarning ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                        />
                        <span>{isGood ? 'Eligible' : 'Shortage'}</span>
                      </span>

                      {/* Percentage Badge */}
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-xs sm:text-sm font-black border shadow-2xs ${badgeColor}`}
                      >
                        {sub.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Row 2: Visual Attendance Progress Bar */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[10px] sm:text-xs font-semibold text-slate-500">
                      <span>
                        Attendance:{' '}
                        <strong className="text-slate-800">{sub.percentage}%</strong>
                      </span>
                      <span
                        className={
                          isGood ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'
                        }
                      >
                        {isGood ? '✓ Min 75% Requirement Met' : '⚠ Below 75% Requirement'}
                      </span>
                    </div>

                    {/* Progress Track */}
                    <div className="w-full bg-slate-100 rounded-full h-2.5 sm:h-3 overflow-hidden border border-slate-200/70 p-0.5 relative">
                      {/* 75% Target Guideline Marker */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-slate-400/80 z-10"
                        style={{ left: '75%' }}
                        title="75% Minimum Attendance Threshold"
                      />
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${clampedPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Row 3: Breakdown Chips (Columns & Sessions) */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    {/* Session stats if recorded */}
                    {sub.sessionStats.totalClasses > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[10px] sm:text-[11px] font-medium text-blue-800 flex items-center gap-1">
                        <span>📅</span>
                        <span>
                          {sub.sessionStats.attendedClasses} of {sub.sessionStats.totalClasses} classes attended
                        </span>
                      </span>
                    )}

                    {/* Column Breakdown Pills */}
                    {sub.sheetColumns.length > 0 ? (
                      sub.sheetColumns.map((col, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[10px] sm:text-[11px] font-medium text-slate-700 flex items-center gap-1"
                        >
                          <span className="text-slate-400 font-normal">{col.name}:</span>
                          <span className="font-bold text-slate-800">{col.value}</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] sm:text-[11px] text-slate-400 italic">
                        Recorded from lecturer attendance sheet
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

export default Attendances;
