import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import Navbar2 from '../components/Navbar2';
import { API_BASE_URL } from '../config/api';

const Results = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const legacySubjects = [
    'web',
    'dbms',
    'os',
    'maths',
    'c',
    'c_lab',
    'web_and_dbms_lab',
  ];

  const fetchResult = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/student/studentresult`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch results');
      }

      const data = await res.json();
      const resultDoc = data?.result !== undefined ? data.result : data;
      setResult(resultDoc);
    } catch (err) {
      console.error('Error fetching results:', err);
      toast.error('Failed to load results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const studentName = result?.studentName || localStorage.getItem('username') || '';

  useEffect(() => {
    fetchResult();
  }, []);

  useEffect(() => {
    const title = studentName ? `Result: ${studentName}` : 'Result';
    document.title = title;
  }, [studentName]);

  const handlePrint = () => {
    const title = studentName ? `Result: ${studentName}` : 'Result';
    document.title = title;
    window.print();
  };

  const hasDynamicSubjects = Array.isArray(result?.subjects) && result.subjects.length > 0;

  // Calculate totals
  let totalMarksObtained = 0;
  let maxPossibleMarks = 0;
  let computedPercentage = 0;
  let subjectsCount = 0;

  if (hasDynamicSubjects) {
    subjectsCount = result.subjects.length;
    result.subjects.forEach((sub) => {
      const subTotal = sub.total != null ? Number(sub.total) : 0;
      totalMarksObtained += subTotal;
      maxPossibleMarks += 100;
    });

    if (result.total_marks != null && result.total_marks > 0) {
      totalMarksObtained = Number(result.total_marks);
    }

    if (result.percentage != null && result.percentage > 0) {
      computedPercentage = Number(result.percentage);
    } else if (maxPossibleMarks > 0) {
      computedPercentage = Number(((totalMarksObtained / maxPossibleMarks) * 100).toFixed(1));
    }
  } else if (result) {
    let legacyTotal = 0;
    let legacyCount = 0;
    legacySubjects.forEach((sub) => {
      const val = result[`${sub}_total`];
      if (val != null && !isNaN(Number(val))) {
        legacyTotal += Number(val);
        legacyCount++;
      }
    });
    if (legacyCount > 0) {
      subjectsCount = legacyCount;
      totalMarksObtained = result.total_marks != null ? Number(result.total_marks) : legacyTotal;
      maxPossibleMarks = legacyCount * 100;
      computedPercentage = result.percentage != null ? Number(result.percentage) : Number(((totalMarksObtained / maxPossibleMarks) * 100).toFixed(1));
    }
  }

  return (
    <main className="min-h-screen w-full bg-sky-50 font-sans pb-10 flex flex-col items-center">
      <Toaster />
      <Navbar2 />

      {/* Print CSS: Strictly 1 page fit without spilling, suppresses footer URL, and cleans background */}
      <style>{`
        @media print {
          @page {
            size: auto;
            margin: 0mm;
          }
          html, body {
            height: auto !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 8mm 12mm !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          main {
            min-height: 0 !important;
            height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            background: transparent !important;
          }
          .main-container {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }
          nav, button, .no-print {
            display: none !important;
          }
          .print-area {
            box-shadow: none !important;
            border: 1px solid #cbd5e1 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
        }
      `}</style>

      {/* ── Main Container ── */}
      <div className="main-container flex-1 w-[90%] sm:w-full max-w-sm sm:max-w-4xl mx-auto px-0 sm:px-6 py-3.5 sm:py-5 flex flex-col gap-3.5 items-stretch">

        {/* ── Top Bar ── */}
        <div className="w-full flex items-center justify-between no-print gap-2">
          <button
            onClick={() => navigate('/studentdash')}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Dashboard</span>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={fetchResult}
              disabled={loading}
              className="h-8 sm:h-9 px-2.5 sm:px-3.5 rounded-md bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium border border-slate-300 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={loading ? 'animate-spin' : ''}>
                <polyline points="23 4 23 10 17 10"></polyline>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
              </svg>
              <span>Refresh</span>
            </button>

            <button
              onClick={handlePrint}
              className="h-8 sm:h-9 px-2.5 sm:px-3.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="w-full bg-white py-12 rounded-lg border border-slate-200 text-center flex flex-col items-center justify-center">
            <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2.5"></div>
            <p className="text-slate-600 text-sm font-medium">Loading results...</p>
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && (!result || (!hasDynamicSubjects && !result.total_marks && !result.web_total)) && (
          <div className="w-full bg-white py-12 px-6 rounded-lg border border-slate-200 text-center">
            <h2 className="text-base font-bold text-slate-800 mb-1">No Results Found</h2>
            <p className="text-slate-500 text-xs mb-4">Results have not been entered yet.</p>
            <button
              onClick={fetchResult}
              className="px-3.5 py-1.5 rounded-md bg-blue-600 text-white text-xs font-semibold cursor-pointer hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* ── Results Card ── */}
        {!loading && result && (hasDynamicSubjects || result.total_marks != null || result.web_total != null) && (
          <div className="w-full bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden print-area flex flex-col">

            {/* 1. Header */}
            <div className="px-4 sm:px-5 py-3.5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <h1 className="text-sm sm:text-lg font-bold text-slate-900">
                {studentName ? `Result: ${studentName}` : 'Result'}
              </h1>
            </div>

            {/* 2. Stats Strip */}
            <div className="grid grid-cols-3 divide-x divide-slate-200 border-b border-slate-200 bg-white">
              <div className="p-2.5 sm:px-5 sm:py-3.5 text-center sm:text-left">
                <span className="text-[11px] sm:text-xs font-medium text-slate-500">Subjects</span>
                <p className="text-base sm:text-2xl font-bold text-slate-900 mt-0.5">{subjectsCount}</p>
              </div>

              <div className="p-2.5 sm:px-5 sm:py-3.5 text-center sm:text-left">
                <span className="text-[11px] sm:text-xs font-medium text-slate-500">Total Marks</span>
                <p className="text-base sm:text-2xl font-bold text-slate-900 mt-0.5">
                  {totalMarksObtained} <span className="text-[10px] sm:text-xs font-normal text-slate-400 block sm:inline">/ {maxPossibleMarks || (subjectsCount * 100)}</span>
                </p>
              </div>

              <div className="p-2.5 sm:px-5 sm:py-3.5 text-center sm:text-left">
                <span className="text-[11px] sm:text-xs font-medium text-slate-500">Percentage</span>
                <p className="text-base sm:text-2xl font-bold text-blue-600 mt-0.5">{computedPercentage}%</p>
              </div>
            </div>

            {/* 3. Results Display: Table on Desktop/Print, Clean Cards on Mobile */}
            {hasDynamicSubjects ? (
              <>
                {/* Desktop Table (Hidden on mobile, visible on sm and up) */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
                        <th className="py-3 px-4 font-bold w-12 text-center">#</th>
                        <th className="py-3 px-4 font-bold">Subject</th>
                        <th className="py-3 px-4 font-bold text-center">Marks Breakdown</th>
                        <th className="py-3 px-4 font-bold text-center w-28">Total</th>
                        <th className="py-3 px-4 font-bold text-right w-24">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {result.subjects.map((sub, idx) => {
                        const subTotal = sub.total != null ? Number(sub.total) : 0;
                        const isPassed = subTotal >= 40;

                        // Filter duplicate "Total" column
                        const rawColumns = sub.columns || [];
                        const nonTotalColumns = rawColumns.filter(
                          (c) => c.name?.toLowerCase().trim() !== 'total'
                        );
                        const displayColumns = nonTotalColumns.length > 0 ? nonTotalColumns : rawColumns;

                        return (
                          <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3.5 px-4 text-xs font-mono text-slate-400 text-center font-semibold">
                              {idx + 1}
                            </td>

                            {/* Subject Name */}
                            <td className="py-3.5 px-4 font-bold text-slate-900 uppercase text-sm">
                              {sub.subject}
                            </td>

                            {/* Mark Breakdown Boxes */}
                            <td className="py-3.5 px-4 text-center">
                              <div className="flex flex-wrap items-center justify-center gap-2">
                                {displayColumns.length > 0 ? (
                                  displayColumns.map((col, cIdx) => (
                                    <div
                                      key={cIdx}
                                      className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md bg-slate-50 border border-slate-300"
                                    >
                                      <span className="text-xs font-medium text-slate-600">
                                        {col.name}:
                                      </span>
                                      <span className="text-sm font-bold text-slate-900 font-mono">
                                        {col.value != null ? col.value : '—'}
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <span className="text-slate-400 text-xs italic">—</span>
                                )}
                              </div>
                            </td>

                            {/* Total Marks */}
                            <td className="py-3.5 px-4 text-center">
                              <span className="text-base font-bold text-slate-900">
                                {sub.total != null ? sub.total : '—'}
                              </span>
                              <span className="text-xs text-slate-400 font-normal ml-0.5">/ 100</span>
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4 text-right">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold border ${
                                  isPassed
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}
                              >
                                {isPassed ? 'Pass' : 'Fail'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards (Visible only on mobile, hidden on sm and in print) */}
                <div className="block sm:hidden divide-y divide-slate-100 print:hidden">
                  {result.subjects.map((sub, idx) => {
                    const subTotal = sub.total != null ? Number(sub.total) : 0;
                    const isPassed = subTotal >= 40;

                    const rawColumns = sub.columns || [];
                    const nonTotalColumns = rawColumns.filter(
                      (c) => c.name?.toLowerCase().trim() !== 'total'
                    );
                    const displayColumns = nonTotalColumns.length > 0 ? nonTotalColumns : rawColumns;

                    return (
                      <div key={idx} className="p-3.5 flex flex-col gap-2.5 bg-white">
                        {/* Subject Title & Pass/Fail Status */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-900 uppercase text-xs tracking-wide">
                            {idx + 1}. {sub.subject}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                              isPassed
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {isPassed ? 'Pass' : 'Fail'}
                          </span>
                        </div>

                        {/* Marks Breakdown Chips */}
                        {displayColumns.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {displayColumns.map((col, cIdx) => (
                              <div
                                key={cIdx}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs"
                              >
                                <span className="text-slate-500 font-medium text-[11px]">{col.name}:</span>
                                <span className="font-bold font-mono text-slate-800">{col.value != null ? col.value : '—'}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">No mark components</span>
                        )}

                        {/* Total Marks Row */}
                        <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-100">
                          <span className="text-slate-500 font-medium">Subject Total</span>
                          <span className="font-bold text-slate-900 text-sm">
                            {sub.total != null ? sub.total : '—'}
                            <span className="text-slate-400 font-normal text-xs ml-1">/ 100</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              /* Legacy Table Fallback */
              <>
                {/* Desktop Table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
                        <th className="py-3 px-4 font-bold">Subject</th>
                        <th className="py-3 px-4 font-bold text-center">Internal</th>
                        <th className="py-3 px-4 font-bold text-center">External</th>
                        <th className="py-3 px-4 font-bold text-center w-28">Total</th>
                        <th className="py-3 px-4 font-bold text-right w-24">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {legacySubjects.map((sub) => {
                        const totalVal = result[`${sub}_total`];
                        const isPassed = Number(totalVal) >= 40;

                        return (
                          <tr key={sub} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-slate-900 uppercase text-sm">
                              {sub.replace(/_/g, ' ')}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <div className="inline-flex items-center h-8 px-2.5 rounded-md bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800">
                                {result[`${sub}_internal`] ?? '—'}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <div className="inline-flex items-center h-8 px-2.5 rounded-md bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800">
                                {result[`${sub}_external`] ?? '—'}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-center font-bold text-slate-900 text-sm">
                              {totalVal ?? '—'} <span className="text-xs font-normal text-slate-400">/ 100</span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold border ${
                                  isPassed
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}
                              >
                                {isPassed ? 'Pass' : 'Fail'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards for Legacy */}
                <div className="block sm:hidden divide-y divide-slate-100 print:hidden">
                  {legacySubjects.map((sub) => {
                    const totalVal = result[`${sub}_total`];
                    const isPassed = Number(totalVal) >= 40;

                    return (
                      <div key={sub} className="p-3.5 flex flex-col gap-2.5 bg-white">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-900 uppercase text-xs tracking-wide">
                            {sub.replace(/_/g, ' ')}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                              isPassed
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {isPassed ? 'Pass' : 'Fail'}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs">
                            <span className="text-slate-500 font-medium text-[11px]">Internal:</span>
                            <span className="font-bold font-mono text-slate-800">{result[`${sub}_internal`] ?? '—'}</span>
                          </div>
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs">
                            <span className="text-slate-500 font-medium text-[11px]">External:</span>
                            <span className="font-bold font-mono text-slate-800">{result[`${sub}_external`] ?? '—'}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-100">
                          <span className="text-slate-500 font-medium">Subject Total</span>
                          <span className="font-bold text-slate-900 text-sm">
                            {totalVal ?? '—'}
                            <span className="text-slate-400 font-normal text-xs ml-1">/ 100</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* 4. Footer */}
            <div className="px-3.5 sm:px-5 py-3 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-1.5 text-xs">
              <span className="text-slate-500 text-center sm:text-left">
                Total Subjects: {subjectsCount}
              </span>
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs sm:text-sm">
                <span>Total:</span>
                <span>{totalMarksObtained} / {maxPossibleMarks || (subjectsCount * 100)}</span>
                <span className="text-blue-600 font-mono">({computedPercentage}%)</span>
              </div>
            </div>

          </div>
        )}

      </div>
    </main>
  );
};

export default Results;
