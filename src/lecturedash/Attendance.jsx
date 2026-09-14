import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar1 from '../components/Navbar1';

const Attendance = () => {
  const navigate = useNavigate();
  const [activeSubject, setActiveSubject] = useState(
    localStorage.getItem('activeAttendanceSubject') || localStorage.getItem('activeSubject') || ''
  );
  const [subjects, setSubjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [records, setRecords] = useState([]);
  const [columns, setColumns] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal for adding a new column
  const [showAddColModal, setShowAddColModal] = useState(false);
  const [newColName, setNewColName] = useState('');

  // Fetch all available subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/lecture/subjects');
        const data = await res.json();
        if (data.success && data.subjects && data.subjects.length > 0) {
          setSubjects(data.subjects);
          if (!activeSubject) {
            const first = data.subjects[0].name;
            setActiveSubject(first);
            localStorage.setItem('activeAttendanceSubject', first);
          }
        }
      } catch (err) {
        console.error('Error fetching subjects:', err);
      }
    };
    fetchSubjects();
  }, []);

  // Fetch student roster and existing attendance marks for active subject from DB
  useEffect(() => {
    if (!activeSubject) {
      setLoading(false);
      return;
    }

    const fetchSheet = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:3000/api/lecture/attendance-sheet/${encodeURIComponent(activeSubject)}`);
        const data = await res.json();
        if (data.success) {
          setColumns(data.columns || ['Internal', 'External', 'Total']);
          setRecords(data.records || []);
        } else {
          toast.error('Failed to load attendance roster');
        }
      } catch (err) {
        console.error(err);
        toast.error('Server error loading attendance sheet');
      } finally {
        setLoading(false);
      }
    };

    fetchSheet();
  }, [activeSubject]);

  const handleSubjectChange = (newSub) => {
    setActiveSubject(newSub);
    localStorage.setItem('activeAttendanceSubject', newSub);
    toast.success(`Loaded subject: "${newSub}"`, { duration: 1500, position: 'top-center' });
  };

  // Handle cell attendance input change
  const handleAttendanceChange = (usn, colName, value) => {
    setRecords(prev =>
      prev.map(rec => {
        if (rec.usn === usn) {
          const updated = {
            ...rec,
            attendance: {
              ...rec.attendance,
              [colName]: value,
            },
          };
          if (colName.trim().toLowerCase() === 'total') {
            updated.total = value;
          }
          return updated;
        }
        return rec;
      })
    );
  };

  // Add new column
  const handleAddColumn = () => {
    const trimmed = newColName.trim();
    if (!trimmed) {
      toast.error('Column name cannot be empty');
      return;
    }
    if (columns.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      toast.error('A column with this name already exists');
      return;
    }

    setColumns(prev => [...prev, trimmed]);
    // Initialize attendance for this new column in all records
    setRecords(prev =>
      prev.map(rec => ({
        ...rec,
        attendance: {
          ...rec.attendance,
          [trimmed]: 0,
        },
      }))
    );
    setNewColName('');
    setShowAddColModal(false);
    toast.success(`Column "${trimmed}" added!`);
  };

  // Remove column
  const handleRemoveColumn = (colToRemove) => {
    if (!window.confirm(`Are you sure you want to remove the column "${colToRemove}"?`)) return;
    setColumns(prev => prev.filter(c => c !== colToRemove));
    setRecords(prev =>
      prev.map(rec => {
        const updatedAttendance = { ...rec.attendance };
        delete updatedAttendance[colToRemove];
        return {
          ...rec,
          attendance: updatedAttendance,
        };
      })
    );
    toast.success(`Column "${colToRemove}" removed`);
  };

  // Save changes to backend
  const handleSave = async () => {
    if (!activeSubject) {
      toast.error('No active subject selected!');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        subject: activeSubject,
        columns: columns,
        records: records.map(r => ({
          usn: r.usn,
          studentName: r.studentName,
          attendance: r.attendance,
          total: r.attendance?.['Total'] !== undefined && r.attendance?.['Total'] !== '' 
            ? Number(r.attendance['Total']) 
            : (r.total !== undefined ? Number(r.total) : 0),
        })),
      };

      const res = await fetch('http://localhost:3000/api/lecture/attendance/save-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`All attendance records saved to database for "${activeSubject}"!`, { position: 'top-center' });
      } else {
        toast.error(data.message || 'Failed to save attendance');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error saving attendance');
    } finally {
      setSaving(false);
    }
  };

  // Filter records by search query
  const filteredRecords = records.filter(
    r =>
      r.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.usn?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-sky-50 font-sans pb-16">
      <Toaster />

      {/* ── Navbar ── */}
      <div className="sticky top-0 z-40 w-full shadow-xs">
        <Navbar1 />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 flex flex-col gap-6">
        
        {/* ── Header Bar ── */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white shadow-xs">
          <div className="flex-1 min-w-0">
            <button
              onClick={() => navigate('/lecturedash')}
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors mb-3 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              <span>Back to Dashboard</span>
            </button>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                Attendance
              </h1>

              {/* Subject Switcher Dropdown */}
              {subjects.length > 0 ? (
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-2xl px-3.5 py-1.5 shadow-2xs">
                  <span className="text-xs font-extrabold text-blue-700 uppercase tracking-wider">Subject:</span>
                  <select
                    value={activeSubject}
                    onChange={(e) => handleSubjectChange(e.target.value)}
                    className="bg-transparent text-sm font-extrabold text-blue-900 outline-none cursor-pointer pr-1"
                  >
                    {subjects.map(s => (
                      <option key={s._id || s.name} value={s.name} className="text-slate-800 font-bold bg-white">
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : activeSubject ? (
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-xs">
                  {activeSubject}
                </span>
              ) : null}
            </div>

            <p className="text-slate-500 text-sm mt-2">
              Attendance sheet for <strong>{activeSubject || 'selected subject'}</strong>.
            </p>
          </div>

          {/* Action Buttons with dedicated container */}
          <div className="flex items-center gap-3 w-full lg:w-auto shrink-0 bg-transparent p-1 rounded-2xl">
            <button
              onClick={() => setShowAddColModal(true)}
              disabled={!activeSubject}
              className="flex-1 lg:flex-initial h-11 inline-flex items-center justify-center gap-2 px-5 rounded-xl bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-700 border border-slate-200 hover:border-blue-300 text-sm font-bold shadow-xs hover:shadow transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              <div className="w-5 h-5 rounded flex items-center justify-center text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </div>
              <span>Add Column</span>
            </button>

            <button
              onClick={handleSave}
              disabled={saving || !activeSubject || records.length === 0}
              className="flex-1 lg:flex-initial h-11 inline-flex items-center justify-center gap-2 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-bold shadow-md shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving…</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                  <span>Save</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── No Subject Warning ── */}
        {!activeSubject && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 text-center text-amber-800">
            <span className="text-5xl block mb-3">⚠️</span>
            <h2 className="text-xl font-bold mb-2">No Subject Selected</h2>
            <p className="text-sm sm:text-base text-amber-700 mb-5 max-w-md mx-auto">
              Select a subject to view attendance:
            </p>
            {subjects.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto mb-5">
                {subjects.map(s => (
                  <button
                    key={s._id || s.name}
                    onClick={() => handleSubjectChange(s.name)}
                    className="px-4 py-2 bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-700 font-bold rounded-xl border border-slate-200 text-sm shadow-xs transition-all cursor-pointer"
                  >
                    📚 {s.name}
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => navigate('/lecturedash')}
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer shadow-sm"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {/* ── Search & Roster Meta Bar ── */}
        {activeSubject && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            {/* Search Input with distinct icon separation */}
            <div className="flex items-center flex-1 max-w-lg bg-slate-50 hover:bg-white focus-within:bg-white border-2 border-slate-200 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 rounded-2xl px-4 py-2.5 transition-all">
              {/* Distinct Search Icon */}
              <div className="text-slate-400 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>

              {/* Space before text input */}
              <div className="w-4 shrink-0"></div>

              {/* Dedicated Input Area for Placeholder and Typed Content */}
              <div className="flex-1 flex items-center min-w-0 pr-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search student or USN..."
                  className="w-full bg-transparent outline-none text-slate-800 placeholder-slate-400 text-sm font-semibold"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors ml-2 cursor-pointer shrink-0"
                    title="Clear search"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                )}
              </div>
            </div>

            {/* Roster Badge */}
            <div className="flex items-center gap-2.5 text-sm font-bold text-slate-700 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 shrink-0 self-start sm:self-auto">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>{filteredRecords.length} of {records.length} Students</span>
            </div>
          </div>
        )}

        {/* ── Excel Sheet Table ── */}
        {activeSubject && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            {loading ? (
              <div className="text-center py-24">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mb-4"></div>
                <p className="text-slate-500 text-base font-semibold">Loading attendance…</p>
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-20">
                <span className="text-6xl block mb-4">🎓</span>
                <h3 className="text-xl font-bold text-slate-800 mb-1">No Students Found</h3>
                <p className="text-slate-400 text-sm">No students found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-100 border-b-2 border-slate-200 text-slate-700 text-xs sm:text-sm uppercase tracking-wider font-extrabold">
                      <th className="py-2.5 px-4 w-16 text-center border-r border-slate-200">#</th>
                      <th className="py-2.5 px-6 min-w-[250px] border-r border-slate-200">Student Name</th>
                      <th className="py-2.5 px-6 min-w-[180px] border-r border-slate-200">USN</th>
                      
                      {/* Dynamic Columns: Internal, External, Total, and custom columns */}
                      {columns.map((col, cIdx) => (
                        <th key={col} className={`py-2.5 px-5 text-center ${cIdx < columns.length - 1 ? 'border-r' : ''} border-slate-200 min-w-[200px] sm:min-w-[240px] group bg-slate-100 hover:bg-slate-200/80 transition-colors`}>
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate flex-1 font-black text-slate-900 text-sm" title={col}>
                              {col}
                            </span>
                            <button
                              onClick={() => handleRemoveColumn(col)}
                              className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                              title={`Delete column "${col}"`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200 text-sm">
                    {filteredRecords.map((rec, index) => {
                      return (
                        <tr
                          key={rec.usn}
                          className="hover:bg-blue-50/40 transition-colors odd:bg-white even:bg-slate-50/40 group"
                        >
                          {/* Index */}
                          <td className="py-1.5 px-4 text-center font-bold text-slate-400 border-r border-slate-200">
                            {index + 1}
                          </td>

                          {/* Student Name */}
                          <td className="py-1.5 px-6 font-bold text-slate-900 border-r border-slate-200 truncate max-w-[250px]" title={rec.studentName}>
                            {rec.studentName || '—'}
                          </td>

                          {/* USN */}
                          <td className="py-1.5 px-6 border-r border-slate-200 whitespace-nowrap">
                            <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                              {rec.usn}
                            </span>
                          </td>

                          {/* Dynamic Columns Editable Cells */}
                          {columns.map((col, cIdx) => (
                            <td key={col} className={`py-1 px-3 ${cIdx < columns.length - 1 ? 'border-r' : ''} border-slate-200 text-center`}>
                              <input
                                type="number"
                                value={rec.attendance?.[col] !== undefined ? rec.attendance[col] : ''}
                                onChange={e => handleAttendanceChange(rec.usn, col, e.target.value)}
                                placeholder="0"
                                className="w-full h-8 text-center text-sm font-bold text-slate-800 bg-white rounded border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-400/20 outline-none shadow-2xs transition-all"
                              />
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Add Column Modal Container (Same as Result.jsx) ── */}
      <AnimatePresence>
        {showAddColModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddColModal(false)}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 12 }}
              transition={{ type: "spring", stiffness: 360, damping: 26 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 sm:p-7 w-full max-w-sm shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col gap-5"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-2xs">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/></svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">Add Column</h3>
                  </div>
                </div>

                <button
                  onClick={() => setShowAddColModal(false)}
                  className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                  title="Close modal"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Column Name
                  </label>
                  <input
                    autoFocus
                    type="text"
                    value={newColName}
                    onChange={e => setNewColName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddColumn()}
                    placeholder="e.g. Total Classes"
                    className="w-full h-11 px-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl outline-none text-slate-900 font-bold placeholder-slate-400 text-sm shadow-2xs transition-all"
                  />
                </div>

                {/* Quick Suggestion Chips */}
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Suggestions:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {['Classes Held', 'Attended', 'Total', 'Lab', 'Percentage'].map(suggestion => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => setNewColName(suggestion)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          newColName === suggestion
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                        }`}
                      >
                        + {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setShowAddColModal(false)}
                  className="h-11 px-5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 font-bold text-sm cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddColumn}
                  className="h-11 px-6 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-500/25 cursor-pointer flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  <span>Add Column</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default Attendance;
