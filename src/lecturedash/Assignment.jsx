import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import Navbar1 from '../components/Navbar1';
import { API_BASE_URL } from '../config/api';

// ─── Inline SVG Icons ────────────────────────────────────────────────────────
const TextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 7 4 4 20 4 20 7"></polyline>
    <line x1="9" y1="20" x2="15" y2="20"></line>
    <line x1="12" y1="4" x2="12" y2="20"></line>
  </svg>
);

const PdfIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const PhotoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <polyline points="21 15 16 10 5 21"></polyline>
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const TargetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <circle cx="12" cy="12" r="6"></circle>
    <circle cx="12" cy="12" r="2"></circle>
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const ExternalLinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15 3 21 3 21 9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const Assignment = () => {
  const navigate = useNavigate();
  const lecturerName = localStorage.getItem('lectureName') || 'Lecturer';

  // Active Subject state
  const [subjects, setSubjects] = useState([]);
  const [activeSubject, setActiveSubject] = useState(localStorage.getItem('activeSubject') || '');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('text'); // 'text' | 'pdf' | 'photo'
  const [targetAudience, setTargetAudience] = useState('all'); // 'all' | 'selected'
  const [selectedStudents, setSelectedStudents] = useState([]); // array of USNs
  const [dueDate, setDueDate] = useState('');
  const [totalMarks, setTotalMarks] = useState(20);
  const [files, setFiles] = useState([]); // Array of { id, file, name, size, type, preview }
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MAX_ATTACHMENTS = 5;
  const MAX_TOTAL_BYTES = 25 * 1024 * 1024; // 25 MB
  const totalFilesSizeBytes = files.reduce((acc, f) => acc + (f.size || 0), 0);
  const totalFilesSizeMB = (totalFilesSizeBytes / (1024 * 1024)).toFixed(2);

  // Student Roster for targeting
  const [students, setStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [loadingStudents, setLoadingStudents] = useState(true);

  // Assignments History / Feed
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);

  // Delete Alert Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editTotalMarks, setEditTotalMarks] = useState(20);
  const [editTargetAudience, setEditTargetAudience] = useState('all');
  const [editSelectedStudents, setEditSelectedStudents] = useState([]);
  const [editKeptAttachments, setEditKeptAttachments] = useState([]);
  const [editNewFiles, setEditNewFiles] = useState([]);
  const [editStudentSearch, setEditStudentSearch] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Mobile View Tab state ('feed' | 'preview')
  const [mobileTab, setMobileTab] = useState('feed');

  // Attachment Preview Modal state (supports both images and PDFs)
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    url: '',
    title: '',
    type: 'photo', // 'photo' | 'pdf'
  });

  // Helper: Get streaming or direct view URL for an attachment
  const getAttachmentViewUrl = (att) => {
    if (!att) return '';
    if (att.blobUrl) return att.blobUrl;
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
    if (att.preview) return att.preview;
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && previewModal.isOpen) {
        closeAttachmentPreview();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewModal.isOpen]);

  // Refs
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);
  const titleInputRef = useRef(null);
  const descInputRef = useRef(null);

  // Helper: Get current local datetime string for HTML5 input min attribute (YYYY-MM-DDTHH:mm)
  const getCurrentMinDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Helper: Format Date and Time for readable display (e.g. Sep 8, 2026, 05:30 PM)
  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'No deadline';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Invalid date';
    return d.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Helper: Format File Size
  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return '0 KB';
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  // ─── 1. Load Configured Subjects ───────────────────────────────────────────
  const fetchSubjects = async () => {
    try {
      const saved = localStorage.getItem('activeSubject');
      if (saved) {
        setActiveSubject(saved);
        return;
      }
      const res = await fetch(`${API_BASE_URL}/api/lecture/subjects`);
      const data = await res.json();
      if (data.success && data.subjects?.length > 0) {
        setSubjects(data.subjects);
        if (!activeSubject) {
          setActiveSubject(data.subjects[0].name);
          localStorage.setItem('activeSubject', data.subjects[0].name);
        }
      }
    } catch (err) {
      console.error('Failed to load subjects:', err);
    }
  };

  // ─── 2. Load Students List ────────────────────────────────────────────────
  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const res = await fetch(`${API_BASE_URL}/api/student/all`);
      const data = await res.json();
      if (data.success) {
        setStudents(data.students || []);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  // ─── 3. Load Posted Assignments (Filtered by lecturer) ───────────────────
  const fetchAssignments = async () => {
    try {
      setLoadingAssignments(true);
      const params = new URLSearchParams();
      if (activeSubject) params.append('subject', activeSubject);
      if (lecturerName) params.append('createdBy', lecturerName);

      const url = `${API_BASE_URL}/api/lecture/assignments?${params.toString()}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setAssignments(data.assignments || []);
      }
    } catch (err) {
      console.error('Failed to load assignments:', err);
    } finally {
      setLoadingAssignments(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchStudents();
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [activeSubject, lecturerName]);

  // Add files with validation: up to 5 attachments, total size < 25MB
  const addFiles = (incomingFiles) => {
    if (!incomingFiles || incomingFiles.length === 0) return;

    const currentCount = files.length;
    if (currentCount >= MAX_ATTACHMENTS) {
      toast.error('Maximum 5 attachments allowed per assignment.');
      return;
    }

    const availableSlots = MAX_ATTACHMENTS - currentCount;
    if (incomingFiles.length > availableSlots) {
      toast.error(
        `You can only add ${availableSlots} more attachment${availableSlots > 1 ? 's' : ''} (limit: 5 files).`
      );
      return;
    }

    let addedBytes = 0;
    const filesToProcess = [];

    for (const file of incomingFiles) {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const isImage = file.type.startsWith('image/');

      if (!isPdf && !isImage) {
        toast.error(`"${file.name}" is not supported. Please select PDF or images (PNG, JPG, WEBP).`);
        return;
      }

      addedBytes += file.size;
      filesToProcess.push({ file, isPdf });
    }

    if (totalFilesSizeBytes + addedBytes > MAX_TOTAL_BYTES) {
      const addedMB = (addedBytes / (1024 * 1024)).toFixed(2);
      toast.error(
        `Total attachments size would exceed 25MB limit (Current: ${totalFilesSizeMB}MB, New: ${addedMB}MB).`
      );
      return;
    }

    const readers = filesToProcess.map(({ file, isPdf }) => {
      return new Promise((resolve) => {
        const item = {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          file,
          name: file.name,
          size: file.size,
          type: isPdf ? 'pdf' : 'photo',
          preview: null,
          blobUrl: URL.createObjectURL(file),
        };

        if (!isPdf) {
          const reader = new FileReader();
          reader.onloadend = () => {
            item.preview = reader.result;
            resolve(item);
          };
          reader.readAsDataURL(file);
        } else {
          resolve(item);
        }
      });
    });

    Promise.all(readers).then((newItems) => {
      setFiles((prev) => [...prev, ...newItems]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    });
  };

  // Handle file selection from input
  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    addFiles(selected);
  };

  const removeFile = (id) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target && target.blobUrl) {
        try { URL.revokeObjectURL(target.blobUrl); } catch (e) {}
      }
      return prev.filter((f) => f.id !== id);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const clearAllFiles = () => {
    files.forEach((f) => {
      if (f.blobUrl) {
        try { URL.revokeObjectURL(f.blobUrl); } catch (e) {}
      }
    });
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Toggle student selection
  const toggleStudent = (usn) => {
    setSelectedStudents((prev) =>
      prev.includes(usn) ? prev.filter((id) => id !== usn) : [...prev, usn]
    );
  };

  const selectAllStudents = () => {
    setSelectedStudents(students.map((s) => s.usn));
  };

  const clearSelectedStudents = () => {
    setSelectedStudents([]);
  };

  // Submit Handler with precise missing field notifications
  const handlePostAssignment = async (e) => {
    e.preventDefault();

    if (!activeSubject) {
      toast.error('Not completed: Please select an Active Subject first!');
      return;
    }

    if (!title || !title.trim()) {
      toast.error('Not completed: "Assignment Title" is required! Please enter a title.');
      titleInputRef.current?.focus();
      return;
    }

    if (files.length === 0 && (!description || !description.trim())) {
      toast.error('Not completed: "Assignment Instructions & Media" is empty! Please write instructions or attach at least one file.');
      descInputRef.current?.focus();
      return;
    }

    if (targetAudience === 'selected' && selectedStudents.length === 0) {
      toast.error('Not completed: "Who Can View This Assignment" is set to "Particular Students", but no students were selected. Please select at least one student or choose "All Students".');
      return;
    }

    // Validate Due Date (must be current or future)
    if (dueDate) {
      const selectedTime = new Date(dueDate).getTime();
      const nowTime = Date.now() - 60000; // 1-minute buffer for form filling
      if (selectedTime < nowTime) {
        toast.error('Invalid Date: Due date cannot be in the past! Please select a current or future date and time.');
        return;
      }
    }

    if (totalMarks === '' || totalMarks === null || isNaN(totalMarks) || Number(totalMarks) < 0) {
      toast.error('Not completed: "Max Score / Weightage" must be a valid non-negative number.');
      return;
    }

    const finalType = files.length > 0
      ? (files.some((f) => f.type === 'pdf') ? 'pdf' : 'photo')
      : 'text';

    setIsSubmitting(true);
    const toastId = toast.loading(
      files.length > 0
        ? `Uploading ${files.length} attachment${files.length > 1 ? 's' : ''}...`
        : 'Posting assignment...'
    );

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('subject', activeSubject);
      formData.append('type', finalType);
      formData.append('targetAudience', targetAudience);
      formData.append('selectedStudents', JSON.stringify(selectedStudents));
      formData.append('totalMarks', totalMarks || 0);
      if (dueDate) formData.append('dueDate', dueDate);
      formData.append('createdBy', lecturerName);

      // Append all attachments
      files.forEach((item) => {
        formData.append('files', item.file);
      });

      const res = await fetch(`${API_BASE_URL}/api/lecture/assignment`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        toast.success(
          `Assignment published! Visible to ${
            targetAudience === 'all'
              ? 'All Students'
              : `${selectedStudents.length} Selected Student(s)`
          }`,
          { id: toastId, duration: 3500 }
        );

        // Reset composer
        setTitle('');
        setDescription('');
        clearAllFiles();
        if (targetAudience === 'selected') setSelectedStudents([]);

        // Refresh feed
        fetchAssignments();
      } else {
        toast.error(data.message || 'Failed to post assignment', { id: toastId });
      }
    } catch (err) {
      console.error('Error posting assignment:', err);
      toast.error('Server error connecting to backend', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Handler
  const handleDeleteAssignment = async () => {
    if (!assignmentToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/lecture/assignment/${assignmentToDelete._id}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deletedBy: lecturerName }),
        }
      );
      const data = await res.json();

      if (data.success) {
        toast.success('Assignment deleted successfully');
        setDeleteModalOpen(false);
        setAssignmentToDelete(null);
        fetchAssignments();
      } else {
        toast.error(data.message || 'Failed to delete');
      }
    } catch (err) {
      toast.error('Error connecting to server');
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── Edit Modal Handlers ──────────────────────────────────────────────
  const openEditModal = (asgn) => {
    setEditingAssignment(asgn);
    setEditTitle(asgn.title || '');
    setEditDescription(asgn.description || '');
    if (asgn.dueDate) {
      const d = new Date(asgn.dueDate);
      if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        setEditDueDate(`${year}-${month}-${day}T${hours}:${minutes}`);
      } else {
        setEditDueDate('');
      }
    } else {
      setEditDueDate('');
    }
    setEditTotalMarks(asgn.totalMarks !== undefined ? asgn.totalMarks : 20);
    setEditTargetAudience(asgn.targetAudience || 'all');
    setEditSelectedStudents(asgn.selectedStudents || []);

    const existing = (asgn.attachments && asgn.attachments.length > 0)
      ? asgn.attachments
      : asgn.fileUrl
      ? [{
          fileUrl: asgn.fileUrl,
          filePublicId: asgn.filePublicId,
          fileName: asgn.fileName || 'Attachment',
          fileSize: asgn.fileSize || '',
          fileType: asgn.type || 'pdf'
        }]
      : [];
    setEditKeptAttachments(existing);
    setEditNewFiles([]);
    setEditStudentSearch('');
    setEditModalOpen(true);
  };

  const handleEditFileChange = (e) => {
    const incoming = Array.from(e.target.files || []);
    if (incoming.length === 0) return;

    const currentTotalCount = editKeptAttachments.length + editNewFiles.length;
    if (currentTotalCount >= 5) {
      toast.error('Maximum 5 attachments allowed per assignment.');
      return;
    }

    const availableSlots = 5 - currentTotalCount;
    if (incoming.length > availableSlots) {
      toast.error(`You can only add ${availableSlots} more attachment${availableSlots > 1 ? 's' : ''} (max 5 allowed).`);
      return;
    }

    let addedBytes = 0;
    const toProcess = [];
    for (const f of incoming) {
      const isPdf = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
      const isImage = f.type.startsWith('image/');
      if (!isPdf && !isImage) {
        toast.error(`"${f.name}" is not supported. Please select PDF or images.`);
        return;
      }
      addedBytes += f.size;
      toProcess.push({ f, isPdf });
    }

    const editNewFilesBytes = editNewFiles.reduce((acc, f) => acc + (f.size || 0), 0);
    if (editNewFilesBytes + addedBytes > 25 * 1024 * 1024) {
      toast.error('Attachments total size exceeds 25MB limit.');
      return;
    }

    const readers = toProcess.map(({ f, isPdf }) => {
      return new Promise((resolve) => {
        const item = {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          file: f,
          name: f.name,
          size: f.size,
          type: isPdf ? 'pdf' : 'photo',
          preview: null,
          blobUrl: URL.createObjectURL(f),
        };
        if (!isPdf) {
          const reader = new FileReader();
          reader.onloadend = () => {
            item.preview = reader.result;
            resolve(item);
          };
          reader.readAsDataURL(f);
        } else {
          resolve(item);
        }
      });
    });

    Promise.all(readers).then((newItems) => {
      setEditNewFiles((prev) => [...prev, ...newItems]);
      if (editFileInputRef.current) editFileInputRef.current.value = '';
    });
  };

  const removeKeptAttachment = (idx) => {
    setEditKeptAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeEditNewFile = (id) => {
    setEditNewFiles((prev) => prev.filter((f) => f.id !== id));
    if (editFileInputRef.current) editFileInputRef.current.value = '';
  };

  const toggleEditStudent = (usn) => {
    setEditSelectedStudents((prev) =>
      prev.includes(usn) ? prev.filter((id) => id !== usn) : [...prev, usn]
    );
  };

  const handleUpdateAssignment = async (e) => {
    e.preventDefault();
    if (!editingAssignment) return;

    if (!editTitle.trim()) {
      toast.error('Not completed: "Assignment Title" is required!');
      return;
    }

    if (editKeptAttachments.length === 0 && editNewFiles.length === 0 && !editDescription.trim()) {
      toast.error('Not completed: Assignment must have instructions or at least one attachment.');
      return;
    }

    if (editTargetAudience === 'selected' && editSelectedStudents.length === 0) {
      toast.error('Not completed: You selected "Particular Students", but have not chosen any students. Please select at least one student or choose "All Students".');
      return;
    }

    if (editDueDate) {
      const selectedTime = new Date(editDueDate).getTime();
      const nowTime = Date.now() - 60000;
      if (selectedTime < nowTime) {
        toast.error('Invalid Date: Due date cannot be in the past! Please select a current or future date.');
        return;
      }
    }

    if (editKeptAttachments.length + editNewFiles.length > 5) {
      toast.error('Maximum 5 attachments allowed per assignment.');
      return;
    }

    setIsUpdating(true);
    const toastId = toast.loading('Saving assignment changes...');

    try {
      const formData = new FormData();
      formData.append('title', editTitle.trim());
      formData.append('description', editDescription.trim());
      formData.append('dueDate', editDueDate || '');
      formData.append('totalMarks', editTotalMarks || 0);
      formData.append('targetAudience', editTargetAudience);
      formData.append('selectedStudents', JSON.stringify(editSelectedStudents));
      formData.append('keptAttachments', JSON.stringify(editKeptAttachments));

      editNewFiles.forEach((item) => {
        formData.append('files', item.file);
      });

      const res = await fetch(`${API_BASE_URL}/api/lecture/assignment/${editingAssignment._id}`, {
        method: 'PUT',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Assignment updated successfully!', { id: toastId });
        setEditModalOpen(false);
        setEditingAssignment(null);
        fetchAssignments();
      } else {
        toast.error(data.message || 'Failed to update assignment', { id: toastId });
      }
    } catch (err) {
      console.error('Error updating assignment:', err);
      toast.error('Server error updating assignment', { id: toastId });
    } finally {
      setIsUpdating(false);
    }
  };

  // Filter students for picker
  const filteredStudents = students.filter(
    (s) =>
      s.username?.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.usn?.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredEditStudents = students.filter(
    (s) =>
      s.username?.toLowerCase().includes(editStudentSearch.toLowerCase()) ||
      s.usn?.toLowerCase().includes(editStudentSearch.toLowerCase())
  );

  // Filter posted assignments - strictly visible ONLY to this lecturer
  const filteredAssignments = assignments.filter((a) => {
    if (!lecturerName || lecturerName === 'Lecturer') return true;
    return a.createdBy?.toLowerCase() === lecturerName.toLowerCase();
  });

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-sky-50 font-sans pb-16">
      <Toaster position="top-right" />

      {/* ── Sticky Top Navbar ── */}
      <div className="sticky top-0 z-40 w-full shadow-xs">
        <Navbar1 />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-8 flex flex-col gap-4 sm:gap-6">
        {/* ── Header Bar ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 sm:gap-6 bg-white p-3.5 sm:p-6 lg:p-7 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex-1 min-w-0 w-full">
            <button
              onClick={() => navigate('/lecturedash')}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors mb-2 sm:mb-3 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              <span>Back to Dashboard</span>
            </button>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
                Assignments
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs">
                {assignments.length} Total
              </span>
            </div>

            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Create and manage assignments for your class.
            </p>
          </div>

          {/* Active Subject Display (Fixed / Non-editable) */}
          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
            <span className="text-2xs sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Subject:</span>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs sm:text-sm font-bold shadow-2xs max-w-[200px] sm:max-w-none">
              <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
              <span className="truncate">{activeSubject || 'No subject'}</span>
            </div>
          </div>
        </div>

        {/* ── Main Workspace Grid (Left: Composer, Right: Live Preview & Feed) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          {/* ── Left Column: Assignment Composer Form (7 cols) ── */}
          <div className="lg:col-span-7 flex flex-col gap-5 sm:gap-6">
            <div className="bg-white rounded-xl p-3.5 sm:p-6 border border-slate-200/80 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4 sm:mb-5 border-b border-slate-100 pb-3 sm:pb-4">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-800">
                    New Assignment
                  </h2>
                  <p className="text-2xs sm:text-xs text-slate-400 mt-0.5">
                    For <strong className="text-blue-600">{activeSubject || 'selected subject'}</strong>
                  </p>
                </div>
                <span className="text-2xs sm:text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-200">
                  By {lecturerName}
                </span>
              </div>

              <form onSubmit={handlePostAssignment} className="flex flex-col gap-4 sm:gap-5">
                {/* 1. Assignment Title */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Title"
                    className="w-full px-3.5 py-2.5 rounded-lg text-base sm:text-sm font-medium border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all hover:border-slate-400 min-h-[44px]"
                  />
                </div>

                {/* 2. Instructions & File Attachment */}
                <div className="flex flex-col gap-1.5">
                  <label className="block text-xs sm:text-sm font-bold text-slate-700">
                    Instructions & Files <span className="text-red-500">*</span>
                  </label>

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const dropped = Array.from(e.dataTransfer.files || []);
                      if (dropped.length > 0) {
                        addFiles(dropped);
                      }
                    }}
                    className={`rounded-lg border transition-all flex flex-col bg-white overflow-hidden ${
                      isDragging
                        ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50/20'
                        : 'border-slate-300 hover:border-slate-400 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100'
                    }`}
                  >
                    {/* Top Bar */}
                    <div className="px-3 sm:px-3.5 py-2 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-1.5">
                      <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                        <span>Details & Media</span>
                      </span>
                      {files.length > 0 ? (
                        <span className="text-2xs font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded border border-blue-200 whitespace-nowrap">
                          {files.length}/5 files ({totalFilesSizeMB} MB)
                        </span>
                      ) : (
                        <span className="text-2xs text-slate-400 font-medium whitespace-nowrap">
                          Max 5 files (up to 25MB)
                        </span>
                      )}
                    </div>

                    <div className="p-3 sm:p-3.5 flex flex-col gap-2.5 sm:gap-3">
                      {/* Attached Files Chips Grid */}
                      {files.length > 0 && (
                        <div className="flex flex-col gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                          <div className="flex items-center justify-between">
                            <span className="text-2xs font-bold text-slate-600 uppercase tracking-wide">
                              Attached ({files.length}/5)
                            </span>
                            {files.length > 1 && (
                              <button
                                type="button"
                                onClick={clearAllFiles}
                                className="text-2xs text-red-600 hover:text-red-700 font-semibold hover:underline cursor-pointer"
                              >
                                Remove All
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {files.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white border border-slate-200 shadow-2xs group hover:border-blue-300 transition-all"
                              >
                                <button
                                  type="button"
                                  onClick={() => openAttachmentPreview(item)}
                                  className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer"
                                  title={`Click to preview ${item.name}`}
                                >
                                  {item.type === 'photo' && item.preview ? (
                                    <img
                                      src={item.preview}
                                      alt={item.name}
                                      className="w-10 h-10 shrink-0 object-cover rounded-md border border-slate-200 group-hover:opacity-90 shadow-2xs"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 shrink-0 rounded-md bg-red-100 border border-red-200 text-red-600 flex flex-col items-center justify-center font-bold text-2xs">
                                      <span>📄</span>
                                      <span className="text-[9px]">PDF</span>
                                    </div>
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition-colors truncate" title={item.name}>
                                      {item.name}
                                    </p>
                                    <p className="text-2xs text-slate-400 truncate">
                                      {formatFileSize(item.size)} • {item.type === 'pdf' ? 'PDF' : 'Photo'}
                                    </p>
                                  </div>
                                </button>

                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => openAttachmentPreview(item)}
                                    className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer flex items-center gap-1 text-2xs font-bold"
                                    title="View attachment in modal"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                      <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                    <span className="hidden xs:inline">View</span>
                                  </button>

                                  <a
                                    href={item.blobUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors cursor-pointer flex items-center gap-1 text-2xs font-bold"
                                    title="Open in new window"
                                  >
                                    <ExternalLinkIcon />
                                    <span className="hidden xs:inline">Open</span>
                                  </a>

                                  <button
                                    type="button"
                                    onClick={() => removeFile(item.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                                    title="Remove attachment"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <line x1="18" y1="6" x2="6" y2="18"></line>
                                      <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Textarea for instructions */}
                      <textarea
                        ref={descInputRef}
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add instructions or details here..."
                        className="w-full text-base sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none bg-transparent min-h-[96px]"
                      />
                    </div>

                    {/* Docked bottom action toolbar */}
                    <div className="px-3 sm:px-3.5 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".pdf,application/pdf,image/*"
                        multiple
                        className="hidden"
                      />

                      <button
                        type="button"
                        disabled={files.length >= 5}
                        onClick={() => fileInputRef.current?.click()}
                        className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all min-h-[40px] ${
                          files.length >= 5
                            ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                            : 'text-blue-700 bg-white hover:bg-blue-600 hover:text-white border border-blue-200 shadow-2xs cursor-pointer active:scale-[0.98]'
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                        </svg>
                        <span>
                          {files.length === 0
                            ? '📎 Attach files'
                            : files.length >= 5
                            ? 'Limit reached (5/5)'
                            : `📎 Add more files (${files.length}/5)`}
                        </span>
                      </button>

                      <span className="text-2xs text-slate-400 font-medium text-center sm:text-right leading-tight">
                        Up to 5 files (max 25MB total)
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Target Audience: ALL vs SELECTED STUDENTS */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-2">
                    <label className="block text-xs sm:text-sm font-bold text-slate-700">
                      Assign to <span className="text-red-500">*</span>
                    </label>
                    <span className="text-2xs font-semibold text-slate-400">
                      {targetAudience === 'all'
                        ? 'All students'
                        : `${selectedStudents.length} of ${students.length} students selected`}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                    <button
                      type="button"
                      onClick={() => setTargetAudience('all')}
                      className={`flex items-center justify-center gap-2 p-2.5 sm:p-3 rounded-lg border text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[42px] ${
                        targetAudience === 'all'
                          ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-2xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <UsersIcon />
                      <span>All Students</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTargetAudience('selected')}
                      className={`flex items-center justify-center gap-2 p-2.5 sm:p-3 rounded-lg border text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[42px] ${
                        targetAudience === 'selected'
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-2xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <TargetIcon />
                      <span>Specific Students</span>
                    </button>
                  </div>

                  {/* Student Picker Accordion / Card */}
                  {targetAudience === 'selected' && (
                    <div className="mt-3 p-3 sm:p-3.5 bg-slate-50/70 rounded-lg border border-slate-200 flex flex-col gap-2.5">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={studentSearch}
                            onChange={(e) => setStudentSearch(e.target.value)}
                            placeholder="Search student or USN..."
                            className="flex-1 min-w-0 px-3 py-2 text-xs sm:text-sm rounded-md border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 min-h-[36px]"
                          />
                          <span className="text-2xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-1.5 rounded-md shrink-0 whitespace-nowrap">
                            {selectedStudents.length} Selected
                          </span>
                        </div>

                        <div className="flex items-center justify-end gap-2 shrink-0 pt-1 sm:pt-0">
                          <button
                            type="button"
                            onClick={selectAllStudents}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer py-1 px-1.5"
                          >
                            Select All
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={clearSelectedStudents}
                            className="text-xs font-bold text-slate-500 hover:text-slate-700 hover:underline cursor-pointer py-1 px-1.5"
                          >
                            Clear All
                          </button>
                        </div>
                      </div>

                      {/* Student Chips / List */}
                      <div className="max-h-52 overflow-y-auto pr-1 flex flex-col gap-1.5 custom-scrollbar">
                        {loadingStudents ? (
                          <p className="text-xs text-slate-400 py-3 text-center">Loading roster…</p>
                        ) : filteredStudents.length === 0 ? (
                          <p className="text-xs text-slate-400 py-3 text-center">No students matched search</p>
                        ) : (
                          filteredStudents.map((st) => {
                            const isSelected = selectedStudents.includes(st.usn);
                            return (
                              <div
                                key={st.usn}
                                onClick={() => toggleStudent(st.usn)}
                                className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-md border text-xs cursor-pointer transition-all active:scale-[0.99] min-h-[40px] ${
                                  isSelected
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-indigo-50/50'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => {}} // handled by parent div
                                    className="w-4 h-4 rounded-sm border-slate-300 text-indigo-600 pointer-events-none shrink-0"
                                  />
                                  <span className="font-semibold truncate">{st.username}</span>
                                </div>
                                <span
                                  className={`text-2xs font-mono font-bold px-2 py-0.5 rounded shrink-0 ${
                                    isSelected
                                      ? 'bg-indigo-500 text-white'
                                      : 'bg-blue-50 text-blue-700 border border-blue-100'
                                  }`}
                                >
                                  {st.usn}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {selectedStudents.length === 0 && (
                        <p className="text-2xs text-amber-700 font-medium bg-amber-50 p-2 rounded-md border border-amber-200">
                          ⚠️ Please select at least one student.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* 4. Due Date & Marks (2 columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
                      Due Date
                    </label>
                    <input
                      type="datetime-local"
                      value={dueDate}
                      min={getCurrentMinDateTime()}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg text-base sm:text-sm font-medium border border-slate-300 bg-white text-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all hover:border-slate-400 cursor-pointer min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
                      Total Marks
                    </label>
                    <input
                      type="number"
                      value={totalMarks}
                      onChange={(e) => setTotalMarks(e.target.value)}
                      placeholder="20"
                      min="0"
                      max="1000"
                      className="w-full px-3.5 py-2.5 rounded-lg text-base sm:text-sm font-medium border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all hover:border-slate-400 min-h-[44px]"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm sm:text-base shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[48px] active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Posting…</span>
                    </>
                  ) : (
                    <>
                      <span>Post Assignment</span>
                      <span className="text-xs bg-white/20 px-2 py-0.5 rounded">
                        {targetAudience === 'all'
                          ? 'All Students'
                          : `${selectedStudents.length} Students`}
                      </span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
          {/* ── Right Column: Live Student Preview & Active Assignments (5 cols) ── */}
          <div className="lg:col-span-5 flex flex-col gap-4 sm:gap-6">
            {/* Mobile View Toggle: Segmented control for small screens */}
            <div className="lg:hidden flex items-center p-1 bg-slate-200/80 rounded-xl shadow-2xs">
              <button
                type="button"
                onClick={() => setMobileTab('feed')}
                className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer min-h-[42px] active:scale-[0.98] ${
                  mobileTab === 'feed'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>📋 Posted</span>
                <span className="px-1.5 py-0.5 rounded-full text-2xs bg-blue-100 text-blue-700 font-bold">
                  {filteredAssignments.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setMobileTab('preview')}
                className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer min-h-[42px] active:scale-[0.98] ${
                  mobileTab === 'preview'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>📱 Preview</span>
                {files.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                )}
              </button>
            </div>

            {/* Live Preview Card */}
            <div className={`${mobileTab === 'preview' ? 'flex' : 'hidden lg:flex'} flex-col bg-white rounded-xl p-3.5 sm:p-6 border border-slate-200/80 shadow-xs`}>
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
                <span className="text-2xs sm:text-xs font-bold uppercase tracking-wider text-slate-400">
                  Student Preview
                </span>
                <span className="text-2xs font-semibold text-emerald-700 bg-emerald-50 px-2 sm:px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Audience: {targetAudience === 'all' ? 'All Students' : `${selectedStudents.length} Selected`}
                </span>
              </div>

              {/* Mock Student Card */}
              <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 sm:p-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-2xs font-bold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-700 truncate max-w-[150px]">
                    {activeSubject || 'Subject'}
                  </span>
                  <span className="text-2xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700 shrink-0">
                    🎯 {totalMarks || 0} Marks
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-slate-800 mt-2.5 line-clamp-1">
                  {title.trim() || 'Title'}
                </h3>

                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {description.trim() || 'Instructions will appear here.'}
                </p>

                {/* Attachments list in preview */}
                {files.length > 0 && (
                  <div className="mt-3 flex flex-col gap-1.5">
                    <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">
                      Attachments ({files.length}):
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {files.map((f) => (
                        <div
                          key={f.id}
                          className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between gap-2 text-xs hover:border-blue-300 transition-colors"
                        >
                          <button
                            type="button"
                            onClick={() => openAttachmentPreview(f)}
                            className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer group/prev"
                          >
                            {f.type === 'pdf' ? (
                              <span className="text-red-600 font-bold text-xs shrink-0 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                                📄 PDF
                              </span>
                            ) : (
                              <span className="text-emerald-600 font-bold text-xs shrink-0 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                                🖼️ Photo
                              </span>
                            )}
                            <span className="text-2xs text-slate-700 font-medium truncate flex-1 min-w-0 group-hover/prev:text-blue-600">
                              {f.name}
                            </span>
                          </button>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-2xs text-slate-400">
                              {formatFileSize(f.size)}
                            </span>
                            <button
                              type="button"
                              onClick={() => openAttachmentPreview(f)}
                              className="text-2xs font-bold text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 cursor-pointer"
                              title="Preview file"
                            >
                              View
                            </button>
                            <a
                              href={f.blobUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-2xs font-bold text-slate-500 hover:text-blue-600 p-1 rounded hover:bg-blue-50 cursor-pointer"
                              title="Open in new window"
                            >
                              <ExternalLinkIcon />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1 text-2xs text-slate-400 font-medium">
                  <span>📅 Due: {formatDateTime(dueDate)}</span>
                  <span>By {lecturerName}</span>
                </div>
              </div>
            </div>

            {/* Active Assignments Feed */}
            <div className={`${mobileTab === 'feed' ? 'flex' : 'hidden lg:flex'} flex-col bg-white rounded-xl p-3.5 sm:p-6 border border-slate-200/80 shadow-xs`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-4 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Posted Assignments
                  </h3>
                  <p className="text-2xs text-slate-400 mt-0.5">
                    {filteredAssignments.length} assignments {activeSubject ? `• ${activeSubject}` : ''}
                  </p>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-2xs font-semibold self-start sm:self-auto shrink-0">
                  <span>Your Posts</span>
                </div>
              </div>

              {/* List of assignments */}
              <div className="flex flex-col gap-3 max-h-[480px] overflow-y-auto pr-1 custom-scrollbar">
                {loadingAssignments ? (
                  <p className="text-xs text-slate-400 py-6 text-center">Loading assignments…</p>
                ) : filteredAssignments.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="text-3xl block mb-2">📭</span>
                    <p className="text-xs font-bold text-slate-600">No assignments yet</p>
                    <p className="text-2xs text-slate-400 mt-1">
                      Assignments you post for this subject will appear here.
                    </p>
                  </div>
                ) : (
                  filteredAssignments.map((asgn) => {
                    const isAll = asgn.targetAudience === 'all';
                    return (
                      <div
                        key={asgn._id}
                        className="p-3 sm:p-3.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs flex flex-col gap-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-2xs font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                              {asgn.subject}
                            </span>
                            <span
                              className={`text-2xs font-bold px-2 py-0.5 rounded ${
                                asgn.type === 'pdf'
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : asgn.type === 'photo'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}
                            >
                              {asgn.type === 'pdf' ? '📄 PDF' : asgn.type === 'photo' ? '🖼️ Photo' : '📝 Text'}
                            </span>
                            <span
                              className={`text-2xs font-bold px-2 py-0.5 rounded ${
                                isAll
                                  ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              }`}
                            >
                              {isAll
                                ? '🌐 All Students'
                                : `🎯 ${asgn.selectedStudents?.length || 0} Students`}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => openEditModal(asgn)}
                              title="Edit Assignment"
                              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 active:bg-blue-100 rounded-lg transition-colors cursor-pointer flex items-center justify-center min-w-[36px] min-h-[36px]"
                            >
                              <EditIcon />
                            </button>
                            <button
                              onClick={() => {
                                setAssignmentToDelete(asgn);
                                setDeleteModalOpen(true);
                              }}
                              title="Delete Assignment"
                              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 active:bg-red-100 rounded-lg transition-colors cursor-pointer flex items-center justify-center min-w-[36px] min-h-[36px]"
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </div>

                        <h4 className="text-sm font-bold text-slate-800 line-clamp-1">
                          {asgn.title}
                        </h4>

                        {asgn.description && (
                          <p className="text-xs text-slate-500 line-clamp-2">
                            {asgn.description}
                          </p>
                        )}

                        {/* Attachments (multi or legacy fallback) */}
                        {asgn.attachments && asgn.attachments.length > 0 ? (
                          <div className="flex flex-col gap-1.5 mt-1">
                            <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">
                              Attachments ({asgn.attachments.length}):
                            </span>
                            <div className="flex flex-col gap-1.5">
                              {asgn.attachments.map((att, idx) => {
                                const attName = att.fileName || `Attachment ${idx + 1}`;
                                const isPdf = att.fileType === 'pdf' || attName.toLowerCase().endsWith('.pdf');
                                const viewUrl = getAttachmentViewUrl(att);
                                const thumbUrl = getAttachmentThumbnailUrl(att);

                                return (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between gap-2.5 p-2 rounded-lg bg-slate-50/80 border border-slate-200/90 hover:border-blue-300 hover:bg-blue-50/30 transition-all shadow-2xs"
                                  >
                                    {/* Thumbnail + Name (Click to preview in modal) */}
                                    <button
                                      type="button"
                                      onClick={() => openAttachmentPreview(att)}
                                      className="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer group/att"
                                      title={`View ${attName}`}
                                    >
                                      {thumbUrl ? (
                                        <div className="relative w-11 h-11 shrink-0 rounded-lg overflow-hidden border border-slate-200 bg-white shadow-2xs group-hover/att:scale-105 transition-transform">
                                          <img
                                            src={thumbUrl}
                                            alt={attName}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              e.target.style.display = 'none';
                                              if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                            }}
                                          />
                                          <div
                                            style={{ display: 'none' }}
                                            className="w-full h-full items-center justify-center bg-red-100 text-red-600 font-bold text-xs"
                                          >
                                            PDF
                                          </div>
                                          {isPdf && (
                                            <span className="absolute bottom-0 inset-x-0 bg-red-600 text-white text-[8px] font-bold text-center leading-tight py-0.5">
                                              PDF
                                            </span>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="w-11 h-11 shrink-0 rounded-lg bg-red-100 border border-red-200 text-red-600 flex flex-col items-center justify-center font-bold text-xs shadow-2xs">
                                          <span>📄</span>
                                          <span className="text-[8px] uppercase font-mono">PDF</span>
                                        </div>
                                      )}

                                      <div className="min-w-0 flex-1">
                                        <p className="text-xs font-bold text-slate-800 group-hover/att:text-blue-600 truncate" title={attName}>
                                          {attName}
                                        </p>
                                        <div className="flex items-center gap-2 text-2xs text-slate-400 mt-0.5">
                                          {att.fileSize && <span>{att.fileSize}</span>}
                                          <span className="text-blue-600 font-medium">Click to view</span>
                                        </div>
                                      </div>
                                    </button>

                                    {/* Actions: View in Modal and Open in New Window */}
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => openAttachmentPreview(att)}
                                        className="px-2.5 py-1.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 text-2xs font-bold transition-all flex items-center gap-1 cursor-pointer min-h-[30px]"
                                        title={`View ${isPdf ? 'PDF' : 'image'} preview`}
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                          <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                        <span>View</span>
                                      </button>

                                      <a
                                        href={viewUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-2.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-2xs font-bold transition-all flex items-center gap-1 cursor-pointer min-h-[30px] shadow-2xs"
                                        title="Open file in new tab"
                                      >
                                        <ExternalLinkIcon />
                                        <span>Open</span>
                                      </a>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : asgn.fileUrl ? (
                          <div className="flex items-center justify-between gap-2.5 p-2 rounded-lg bg-slate-50/80 border border-slate-200/90 hover:border-blue-300 hover:bg-blue-50/30 transition-all shadow-2xs mt-1">
                            <button
                              type="button"
                              onClick={() => openAttachmentPreview({
                                fileUrl: asgn.fileUrl,
                                filePublicId: asgn.filePublicId,
                                fileName: asgn.fileName || 'Attachment',
                                fileSize: asgn.fileSize,
                                fileType: asgn.type || 'pdf'
                              })}
                              className="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer group/att"
                            >
                              <div className="w-11 h-11 shrink-0 rounded-lg bg-blue-100 border border-blue-200 text-blue-700 flex flex-col items-center justify-center font-bold text-xs shadow-2xs">
                                <span>{asgn.type === 'pdf' ? '📄' : '🖼️'}</span>
                                <span className="text-[8px] uppercase font-mono">{asgn.type || 'FILE'}</span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-slate-800 group-hover/att:text-blue-600 truncate">
                                  {asgn.fileName || 'View / Download Attachment'}
                                </p>
                                {asgn.fileSize && (
                                  <p className="text-2xs text-slate-400 mt-0.5">{asgn.fileSize}</p>
                                )}
                              </div>
                            </button>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => openAttachmentPreview({
                                  fileUrl: asgn.fileUrl,
                                  filePublicId: asgn.filePublicId,
                                  fileName: asgn.fileName || 'Attachment',
                                  fileSize: asgn.fileSize,
                                  fileType: asgn.type || 'pdf'
                                })}
                                className="px-2.5 py-1.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 text-2xs font-bold transition-all flex items-center gap-1 cursor-pointer min-h-[30px]"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                  <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                                <span>View</span>
                              </button>

                              <a
                                href={getAttachmentViewUrl({
                                  fileUrl: asgn.fileUrl,
                                  filePublicId: asgn.filePublicId,
                                  fileName: asgn.fileName || 'Attachment',
                                  fileType: asgn.type || 'pdf'
                                })}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-2xs font-bold transition-all flex items-center gap-1 cursor-pointer min-h-[30px] shadow-2xs"
                              >
                                <ExternalLinkIcon />
                                <span>Open</span>
                              </a>
                            </div>
                          </div>
                        ) : null}

                        {/* Audience details if selected */}
                        {!isAll && asgn.selectedStudents?.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap text-2xs">
                            <span className="text-slate-400 font-semibold">Targeted:</span>
                            {asgn.selectedStudents.slice(0, 3).map((usn) => (
                              <span key={usn} className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono font-semibold">
                                {usn}
                              </span>
                            ))}
                            {asgn.selectedStudents.length > 3 && (
                              <span className="text-slate-400 font-semibold">
                                +{asgn.selectedStudents.length - 3} more
                              </span>
                            )}
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row gap-1 sm:gap-2 items-start sm:items-center justify-between text-2xs text-slate-400">
                          <span>
                            Due: {formatDateTime(asgn.dueDate)} • {asgn.totalMarks || 0} Marks
                          </span>
                          <span>{new Date(asgn.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {deleteModalOpen && assignmentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl p-5 sm:p-6 max-w-sm sm:max-w-md w-full border border-slate-200 shadow-xl flex flex-col gap-4 animate-in fade-in duration-150">
            <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold text-lg">
              🗑️
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Delete Assignment?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete{' '}
                <strong className="text-slate-700">"{assignmentToDelete.title}"</strong>?
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer min-h-[40px] flex-1 sm:flex-none justify-center flex items-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAssignment}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-red-600 hover:bg-red-700 text-white shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 min-h-[40px] flex-1 sm:flex-none"
              >
                {isDeleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Assignment Modal (Responsive Bottom Sheet on Mobile / Centered on Desktop) ── */}
      {editModalOpen && editingAssignment && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-hidden">
          <div className="bg-white rounded-t-2xl sm:rounded-xl max-w-2xl w-full border border-slate-200 shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            {/* Mobile Sheet Grab Handle */}
            <div className="sm:hidden w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-2.5 mb-1 shrink-0"></div>

            {/* Sticky Modal Header */}
            <div className="p-3.5 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                  ✏️
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm sm:text-base font-bold text-slate-800 truncate">
                    Edit Assignment
                  </h3>
                  <p className="text-2xs text-slate-400 truncate">
                    Subject: <span className="font-semibold text-blue-600">{editingAssignment.subject}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 cursor-pointer shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdateAssignment} className="flex flex-col flex-1 overflow-hidden">
              {/* Scrollable Form Body */}
              <div className="p-3.5 sm:p-6 overflow-y-auto flex flex-col gap-3.5 sm:gap-4 custom-scrollbar flex-1">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Title"
                    className="w-full px-3 py-2 rounded-lg text-base sm:text-sm font-medium border border-slate-300 bg-white text-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none min-h-[42px]"
                  />
                </div>

                {/* Instructions */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Instructions
                  </label>
                  <textarea
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Instructions..."
                    className="w-full px-3 py-2 rounded-lg text-base sm:text-sm font-medium border border-slate-300 bg-white text-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none resize-none min-h-[80px]"
                  />
                </div>

                {/* Attachments Management */}
                <div className="flex flex-col gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      Attachments ({editKeptAttachments.length + editNewFiles.length}/5)
                    </span>
                    <span className="text-2xs text-slate-400">
                      Max 5 files (up to 25MB)
                    </span>
                  </div>

                  {/* Existing Kept Attachments */}
                  {editKeptAttachments.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-2xs font-semibold text-slate-500 uppercase tracking-wide">
                        Existing attachments:
                      </span>
                      <div className="flex flex-col gap-1">
                        {editKeptAttachments.map((att, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between gap-2 p-2 rounded-md bg-white border border-slate-200 text-xs min-h-[38px]"
                          >
                            <div className="flex items-center gap-1.5 min-w-0 flex-1">
                              <span className="shrink-0">{att.fileType === 'pdf' ? '📄' : '🖼️'}</span>
                              <span className="truncate font-semibold text-slate-700">
                                {att.fileName || `Attachment ${idx + 1}`}
                              </span>
                              {att.fileSize && (
                                <span className="text-2xs text-slate-400 shrink-0">({att.fileSize})</span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeKeptAttachment(idx)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded cursor-pointer shrink-0 min-w-[28px] min-h-[28px] flex items-center justify-center"
                              title="Remove attachment"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New Attachments Added in Edit */}
                  {editNewFiles.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-2xs font-semibold text-blue-600 uppercase tracking-wide">
                        New attachments:
                      </span>
                      <div className="flex flex-col gap-1">
                        {editNewFiles.map((nf) => (
                          <div
                            key={nf.id}
                            className="flex items-center justify-between gap-2 p-2 rounded-md bg-blue-50/60 border border-blue-200 text-xs min-h-[38px]"
                          >
                            <div className="flex items-center gap-1.5 min-w-0 flex-1">
                              <span className="shrink-0">{nf.type === 'pdf' ? '📄' : '🖼️'}</span>
                              <span className="truncate font-semibold text-blue-800">
                                {nf.name}
                              </span>
                              <span className="text-2xs text-blue-600 shrink-0">({formatFileSize(nf.size)})</span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => openAttachmentPreview(nf)}
                                className="px-2 py-1 text-2xs font-bold text-blue-700 bg-white border border-blue-200 rounded hover:bg-blue-100 cursor-pointer"
                              >
                                View
                              </button>
                              <a
                                href={nf.blobUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 text-blue-600 hover:text-blue-800 rounded hover:bg-white cursor-pointer"
                                title="Open in new window"
                              >
                                <ExternalLinkIcon />
                              </a>
                              <button
                                type="button"
                                onClick={() => removeEditNewFile(nf.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded cursor-pointer shrink-0 min-w-[28px] min-h-[28px] flex items-center justify-center"
                                title="Remove"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add files button */}
                  <input
                    type="file"
                    ref={editFileInputRef}
                    onChange={handleEditFileChange}
                    accept=".pdf,application/pdf,image/*"
                    multiple
                    className="hidden"
                  />

                  <button
                    type="button"
                    disabled={editKeptAttachments.length + editNewFiles.length >= 5}
                    onClick={() => editFileInputRef.current?.click()}
                    className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold border transition-all min-h-[38px] ${
                      editKeptAttachments.length + editNewFiles.length >= 5
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        : 'bg-white text-blue-700 hover:bg-blue-600 hover:text-white border-blue-200 cursor-pointer shadow-2xs'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                    </svg>
                    <span>
                      {editKeptAttachments.length + editNewFiles.length >= 5
                        ? 'Limit reached (5/5)'
                        : '📎 Attach files'}
                    </span>
                  </button>
                </div>

                {/* Target Audience */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Assign to
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditTargetAudience('all')}
                      className={`p-2.5 rounded-lg border text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[44px] ${
                        editTargetAudience === 'all'
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      All Students
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditTargetAudience('selected')}
                      className={`p-2.5 rounded-lg border text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[44px] ${
                        editTargetAudience === 'selected'
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Specific Students
                    </button>
                  </div>

                  {editTargetAudience === 'selected' && (
                    <div className="mt-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={editStudentSearch}
                          onChange={(e) => setEditStudentSearch(e.target.value)}
                          placeholder="Search student or USN..."
                          className="flex-1 px-3 py-2 text-base sm:text-sm rounded border border-slate-300 bg-white min-h-[40px]"
                        />
                        <span className="text-2xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-1.5 rounded shrink-0 whitespace-nowrap">
                          {editSelectedStudents.length} Selected
                        </span>
                      </div>

                      <div className="max-h-36 overflow-y-auto flex flex-col gap-1 pr-1 custom-scrollbar">
                        {filteredEditStudents.map((st) => {
                          const isSel = editSelectedStudents.includes(st.usn);
                          return (
                            <div
                              key={st.usn}
                              onClick={() => toggleEditStudent(st.usn)}
                              className={`flex items-center justify-between px-3 py-2 rounded border text-xs cursor-pointer min-h-[40px] ${
                                isSel
                                  ? 'bg-indigo-600 text-white border-indigo-600'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-indigo-50/40'
                              }`}
                            >
                              <span className="truncate font-semibold">{st.username}</span>
                              <span className={`text-2xs font-mono px-1.5 py-0.5 rounded shrink-0 ${
                                isSel ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {st.usn}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Due date & marks */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Due Date
                    </label>
                    <input
                      type="datetime-local"
                      value={editDueDate}
                      min={getCurrentMinDateTime()}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg text-base sm:text-sm font-medium border border-slate-300 bg-white text-slate-800 focus:border-blue-600 min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Total Marks
                    </label>
                    <input
                      type="number"
                      value={editTotalMarks}
                      onChange={(e) => setEditTotalMarks(e.target.value)}
                      placeholder="20"
                      min="0"
                      max="1000"
                      className="w-full px-3 py-2.5 rounded-lg text-base sm:text-sm font-medium border border-slate-300 bg-white text-slate-800 focus:border-blue-600 min-h-[44px]"
                    />
                  </div>
                </div>
              </div>

              {/* Sticky Modal Footer */}
              <div className="p-3 sm:p-4 border-t border-slate-100 bg-slate-50/90 flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  disabled={isUpdating}
                  className="px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-200/70 cursor-pointer min-h-[44px] flex-1 sm:flex-none justify-center flex items-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer flex items-center justify-center gap-1.5 min-h-[44px] flex-1 sm:flex-none"
                >
                  {isUpdating ? 'Saving Changes…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ── Attachment Preview Modal (Viewer for PDF and Images) ─────────────── */}
      {previewModal.isOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-5"
          onClick={closeAttachmentPreview}
        >
          <div
            className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200/80"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-3.5 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                  previewModal.type === 'pdf' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {previewModal.type === 'pdf' ? '📄 PDF' : '🖼️ Photo'}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-800 truncate" title={previewModal.title}>
                  {previewModal.title}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={previewModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  title="Open in full browser window"
                >
                  <ExternalLinkIcon />
                  <span className="hidden xs:inline">Open in New Tab</span>
                </a>

                <button
                  type="button"
                  onClick={closeAttachmentPreview}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                  title="Close preview"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto bg-slate-900/95 flex items-center justify-center min-h-[320px] max-h-[calc(92vh-60px)] p-2 sm:p-4">
              {previewModal.type === 'photo' ? (
                <img
                  src={previewModal.url}
                  alt={previewModal.title}
                  className="max-w-full max-h-[78vh] object-contain rounded-lg shadow-xl"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-stretch min-h-[500px] sm:min-h-[620px] bg-white rounded-lg overflow-hidden">
                  <iframe
                    src={previewModal.url}
                    title={previewModal.title}
                    className="w-full flex-1 border-0 min-h-[500px] sm:min-h-[620px]"
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

export default Assignment;
