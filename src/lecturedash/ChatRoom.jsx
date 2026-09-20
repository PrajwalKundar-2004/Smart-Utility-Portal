import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';
import Navbar1 from '../components/Navbar1';
import Navbar2 from '../components/Navbar2';
import { API_BASE_URL } from '../config/api';

// ─── Inline SVG Icons ────────────────────────────────────────────────────────
const UsersIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const TargetIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const PlusIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const SendIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const PaperclipIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);

const CloseIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SearchIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const FileIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const DownloadIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const TrashIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const CheckIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const EyeIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const ClockIcon = ({ className = 'w-3 h-3 text-[#8696a0]' }) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
    <circle cx="8" cy="8" r="6.2" />
    <polyline points="8 4.2 8 8 10.5 9.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── WhatsApp-style Status / Ticks Component ─────────────────────────────────
const MessageTicks = ({ message, currentUsn }) => {
  // 1. Sending in flight / optimistic temporary state -> WhatsApp Clock Icon 🕒
  if (message.status === 'sending' || (message._id && String(message._id).startsWith('temp_'))) {
    return (
      <span className="inline-flex items-center text-[#8696a0] ml-1 select-none" title="Sending...">
        <ClockIcon className="w-3.5 h-3.5 text-[#8696a0]" />
      </span>
    );
  }

  // 2. Failed state
  if (message.status === 'error') {
    return (
      <span className="inline-flex items-center text-red-500 ml-1 select-none" title="Failed to send">
        <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0-1A6 6 0 1 0 8 2a6 6 0 0 0 0 12zM7.25 4.5h1.5v5h-1.5v-5zm0 6.5h1.5v1.5h-1.5V11z" />
        </svg>
      </span>
    );
  }

  const readCount = message.readBy?.filter((r) => r.usn !== currentUsn)?.length || 0;
  const deliveredCount = message.deliveredTo?.filter((d) => d.usn !== currentUsn)?.length || 0;

  // 3. Double Blue Tick (Seen / Read)
  if (readCount > 0) {
    return (
      <span className="inline-flex items-center text-[#53bdeb] ml-1 select-none" title="Seen">
        <svg viewBox="0 0 16 15" width="16" height="15" fill="none">
          <path d="M15.01 3.316l-7.9 7.9-3.13-3.13a.75.75 0 1 0-1.06 1.06l3.66 3.66a.75.75 0 0 0 1.06 0l8.43-8.43a.75.75 0 1 0-1.06-1.06z" fill="currentColor" />
          <path d="M11.01 3.316l-7.9 7.9-1.13-1.13a.75.75 0 1 0-1.06 1.06l1.66 1.66a.75.75 0 0 0 1.06 0l8.43-8.43a.75.75 0 1 0-1.06-1.06z" fill="currentColor" />
        </svg>
      </span>
    );
  }

  // 4. Double Gray Tick (Delivered)
  if (deliveredCount > 0) {
    return (
      <span className="inline-flex items-center text-[#8696a0] ml-1 select-none" title="Delivered">
        <svg viewBox="0 0 16 15" width="16" height="15" fill="none">
          <path d="M15.01 3.316l-7.9 7.9-3.13-3.13a.75.75 0 1 0-1.06 1.06l3.66 3.66a.75.75 0 0 0 1.06 0l8.43-8.43a.75.75 0 1 0-1.06-1.06z" fill="currentColor" />
          <path d="M11.01 3.316l-7.9 7.9-1.13-1.13a.75.75 0 1 0-1.06 1.06l1.66 1.66a.75.75 0 0 0 1.06 0l8.43-8.43a.75.75 0 1 0-1.06-1.06z" fill="currentColor" opacity="0.8" />
        </svg>
      </span>
    );
  }

  // 5. Single Gray Tick (Sent to server)
  return (
    <span className="inline-flex items-center text-[#8696a0] ml-1 select-none" title="Sent">
      <svg viewBox="0 0 16 15" width="14" height="14" fill="none">
        <path d="M13.5 3.5l-7.5 7.5-3.5-3.5a.75.75 0 1 0-1.06 1.06l4.03 4.03a.75.75 0 0 0 1.06 0l8.03-8.03a.75.75 0 1 0-1.06-1.06z" fill="currentColor" />
      </svg>
    </span>
  );
};

// ─── Main Chat Room Component ──────────────────────────────────────────────────
const ChatRoom = () => {
  // Authentication & Identity
  const role = localStorage.getItem('role') || 'lecture';
  const isStudent = role === 'student';
  const token = localStorage.getItem('token');
  const currentUserName = isStudent
    ? (localStorage.getItem('username') || 'Student')
    : (localStorage.getItem('lectureName') || 'Lecturer');
  const currentUsn = isStudent ? localStorage.getItem('usn') : 'LECTURER';

  // State
  const [socketConnected, setSocketConnected] = useState(false);
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [groupSearch, setGroupSearch] = useState('');
  const [input, setInput] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showMembersDrawer, setShowMembersDrawer] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // File Upload State & Previews
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFilePreviewUrl, setSelectedFilePreviewUrl] = useState(null);
  const [showPdfSenderPreview, setShowPdfSenderPreview] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [previewModalImage, setPreviewModalImage] = useState(null); // { url, fileName } or string
  const [pdfModalPreview, setPdfModalPreview] = useState(null); // { url, title }

  // Create Object URL for sender preview (PDF & Images)
  useEffect(() => {
    if (!selectedFile) {
      setSelectedFilePreviewUrl(null);
      setShowPdfSenderPreview(true);
      return;
    }
    const objUrl = URL.createObjectURL(selectedFile);
    setSelectedFilePreviewUrl(objUrl);
    setShowPdfSenderPreview(true);
    return () => {
      URL.revokeObjectURL(objUrl);
    };
  }, [selectedFile]);

  // Group Creation Modal State (Lecturer Only)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createDesc, setCreateDesc] = useState('');
  const [createAudience, setCreateAudience] = useState('all'); // 'all' | 'selected'
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudentUsns, setSelectedStudentUsns] = useState([]);
  const [studentNameFilter, setStudentNameFilter] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Refs
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auth Headers helper
  const getAuthHeaders = useCallback(() => ({
    'Authorization': `Bearer ${token}`,
    'x-user-name': currentUserName,
  }), [token, currentUserName]);

  // Resolves accessible URL that streams through backend proxy without Cloudinary 401
  const getFileViewUrl = useCallback((fileObj) => {
    if (!fileObj) return '';
    if (fileObj.fileUrl && fileObj.fileUrl.includes('/api/attachment/view')) {
      return fileObj.fileUrl.startsWith('http') ? fileObj.fileUrl : `${API_BASE_URL}${fileObj.fileUrl}`;
    }
    if (fileObj.filePublicId) {
      const isDoc = fileObj.fileType === 'pdf' || fileObj.fileType === 'document' ||
        (fileObj.fileName && /\.pdf$/i.test(fileObj.fileName));
      return `${API_BASE_URL}/api/attachment/view?publicId=${encodeURIComponent(fileObj.filePublicId)}&fileName=${encodeURIComponent(fileObj.fileName || 'document.pdf')}&resourceType=${isDoc ? 'raw' : 'image'}`;
    }
    const rawUrl = fileObj.fileUrl || fileObj.url;
    if (rawUrl && rawUrl.includes('cloudinary.com') && (rawUrl.includes('/raw/') || rawUrl.toLowerCase().endsWith('.pdf'))) {
      return `${API_BASE_URL}/api/attachment/view?url=${encodeURIComponent(rawUrl)}&fileName=${encodeURIComponent(fileObj.fileName || 'document.pdf')}`;
    }
    return rawUrl || '';
  }, []);

  // ─── Direct Local Device File Download ───────────────────────────────────────
  // Downloads the file directly to the user's computer with the EXACT filename sent
  const downloadFile = useCallback(async (fileObj, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!fileObj) return;

    const originalName = fileObj.fileName || (fileObj.fileType === 'pdf' ? 'document.pdf' : 'attachment');
    toast.loading(`Downloading ${originalName}...`, { id: 'file-download' });

    try {
      let downloadUrl = getFileViewUrl(fileObj);
      if (!downloadUrl) throw new Error('File URL not found');

      // Append download=true parameter so proxy attaches Content-Disposition
      if (!downloadUrl.includes('download=')) {
        downloadUrl += (downloadUrl.includes('?') ? '&' : '?') + 'download=true';
      }

      // Fetch as Blob and create object URL to trigger immediate download with original name
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);

      toast.success(`Downloaded ${originalName}`, { id: 'file-download' });
    } catch (err) {
      console.error('Blob download failed, falling back to direct link:', err);
      // Fallback direct link
      const fallbackUrl = getFileViewUrl(fileObj);
      const link = document.createElement('a');
      link.href = fallbackUrl;
      link.download = originalName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.dismiss('file-download');
    }
  }, [getFileViewUrl]);

  // ─── 1. Socket.IO Setup ──────────────────────────────────────────────────────
  useEffect(() => {
    const socket = io(API_BASE_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketConnected(true);
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
    });

    // Real-Time Incoming Message
    socket.on('receive_message', (msg) => {
      setMessages((prev) => {
        // If message has clientTempId, replace optimistic temporary message in place
        if (msg.clientTempId) {
          const idx = prev.findIndex(
            (m) => m.clientTempId === msg.clientTempId || m._id === msg.clientTempId
          );
          if (idx !== -1) {
            const next = [...prev];
            next[idx] = msg;
            return next;
          }
        }
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });

      // Update Group's lastMessage in the chat list
      setGroups((prev) =>
        prev.map((g) => {
          if (g._id === msg.groupId) {
            return {
              ...g,
              lastMessage: {
                content: msg.content || (msg.file ? `📎 ${msg.file.fileName}` : 'Attachment'),
                senderName: msg.sender?.name || 'User',
                time: msg.createdAt,
              },
              updatedAt: new Date(),
            };
          }
          return g;
        })
      );

      // Mark delivered & read if received from others
      if (msg.sender?.id !== currentUsn && msg.sender?.name !== currentUserName) {
        socket.emit('mark_delivered', {
          messageId: msg._id,
          groupId: msg.groupId,
          userUsn: currentUsn,
        });

        socket.emit('mark_read', {
          messageId: msg._id,
          groupId: msg.groupId,
          userUsn: currentUsn,
          userName: currentUserName,
        });
      }
    });

    // Status updates (Ticks)
    socket.on('message_status_updated', ({ messageId, deliveredTo, readBy }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === messageId ? { ...msg, deliveredTo, readBy } : msg))
      );
    });

    // Batch all read
    socket.on('all_messages_read', ({ groupId, userUsn }) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.groupId === groupId) {
            const alreadyRead = msg.readBy?.some((r) => r.usn === userUsn);
            if (!alreadyRead) {
              const updatedRead = [...(msg.readBy || []), { usn: userUsn, name: 'User', readAt: new Date() }];
              return { ...msg, readBy: updatedRead };
            }
          }
          return msg;
        })
      );
    });

    // Live typing indicators
    socket.on('user_typing', ({ userName }) => {
      if (userName === currentUserName) return;
      setTypingUsers((prev) => (prev.includes(userName) ? prev : [...prev, userName]));
    });

    socket.on('user_stop_typing', () => {
      setTypingUsers([]);
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUsn, currentUserName]);

  // ─── 2. Fetch Groups ────────────────────────────────────────────────────────
  const fetchGroups = useCallback(async () => {
    try {
      setLoadingGroups(true);
      const res = await fetch(`${API_BASE_URL}/api/chat/groups`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setGroups(data.groups || []);
        if (data.groups?.length > 0) {
          setActiveGroup((prev) => prev || data.groups[0]);
        }
      } else {
        toast.error(data.message || 'Failed to load groups');
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
    } finally {
      setLoadingGroups(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // ─── 3. Room Switching & Joining Socket Room ────────────────────────────────
  useEffect(() => {
    if (!activeGroup || !socketRef.current) return;

    socketRef.current.emit('join_group', {
      groupId: activeGroup._id,
      userName: currentUserName,
    });

    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        const res = await fetch(`${API_BASE_URL}/api/chat/groups/${activeGroup._id}/messages`, {
          headers: getAuthHeaders(),
        });
        const data = await res.json();
        if (data.success) {
          setMessages(data.messages || []);

          socketRef.current.emit('mark_all_read', {
            groupId: activeGroup._id,
            userUsn: currentUsn,
            userName: currentUserName,
          });
        }
      } catch (err) {
        console.error('Error loading messages:', err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
    setTypingUsers([]);

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave_group_room', { groupId: activeGroup._id });
      }
    };
  }, [activeGroup, currentUserName, currentUsn, getAuthHeaders]);

  // ─── 4. Auto-Scroll to bottom on new message ────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  // ─── 5. Typing Handlers ─────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!activeGroup || !socketRef.current) return;

    socketRef.current.emit('typing', {
      groupId: activeGroup._id,
      userName: currentUserName,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('stop_typing', { groupId: activeGroup._id });
    }, 1500);
  };

  // ─── 6. Send Message with WhatsApp Optimistic Sending (Clock -> Tick) ────────
  const handleSend = async () => {
    if (!activeGroup) return;
    const content = input.trim();
    if (!content && !selectedFile) return;

    // Generate unique temp id for optimistic message
    const clientTempId = 'temp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    const pendingFile = selectedFile;
    const pendingPreviewUrl = selectedFilePreviewUrl;

    let tempMessageType = 'text';
    let tempFileData = null;
    if (pendingFile) {
      const isImg = pendingFile.type?.startsWith('image/');
      const isDocPdf = pendingFile.type === 'application/pdf' || pendingFile.name?.toLowerCase().endsWith('.pdf');
      tempMessageType = isImg ? 'image' : (isDocPdf ? 'pdf' : 'document');
      tempFileData = {
        fileName: pendingFile.name,
        fileSize: (pendingFile.size / (1024 * 1024)).toFixed(2) + ' MB',
        fileType: tempMessageType,
        fileUrl: pendingPreviewUrl,
      };
    }

    // Step A: Optimistically insert message into UI right now!
    // Shows WhatsApp Clock Icon (🕒) immediately
    const optimisticMessage = {
      _id: clientTempId,
      clientTempId,
      groupId: activeGroup._id,
      sender: {
        id: currentUsn,
        name: currentUserName,
        role: isStudent ? 'student' : 'lecture',
      },
      content: content || (pendingFile ? pendingFile.name : ''),
      messageType: tempMessageType,
      file: tempFileData,
      status: 'sending', // <--- Renders the Clock icon (🕒)
      createdAt: new Date().toISOString(),
      readBy: [],
      deliveredTo: [],
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    // Update the group list snippet optimistically
    setGroups((prev) =>
      prev.map((g) => {
        if (g._id === activeGroup._id) {
          return {
            ...g,
            lastMessage: {
              content: content || (pendingFile ? `📎 ${pendingFile.name}` : 'Attachment'),
              senderName: currentUserName,
              time: new Date().toISOString(),
            },
            updatedAt: new Date(),
          };
        }
        return g;
      })
    );

    // Clear input & file immediately so user is not blocked
    setInput('');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    socketRef.current?.emit('stop_typing', { groupId: activeGroup._id });

    // Step B: Upload file if attachment was included
    let fileData = null;
    if (pendingFile) {
      try {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', pendingFile);

        const uploadRes = await fetch(`${API_BASE_URL}/api/chat/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-user-name': currentUserName,
          },
          body: formData,
        });

        const uploadJson = await uploadRes.json();
        if (!uploadJson.success) {
          toast.error(uploadJson.message || 'File upload failed');
          setMessages((prev) =>
            prev.map((m) => (m.clientTempId === clientTempId ? { ...m, status: 'error' } : m))
          );
          setIsUploading(false);
          return;
        }
        fileData = uploadJson.file;
      } catch (err) {
        console.error('Upload error:', err);
        toast.error('File upload failed');
        setMessages((prev) =>
          prev.map((m) => (m.clientTempId === clientTempId ? { ...m, status: 'error' } : m))
        );
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    let finalMessageType = 'text';
    if (fileData) {
      finalMessageType = fileData.fileType || 'document';
    }

    // Step C: Emit through socket with clientTempId
    socketRef.current?.emit('send_message', {
      groupId: activeGroup._id,
      clientTempId,
      sender: {
        id: currentUsn,
        name: currentUserName,
        role: isStudent ? 'student' : 'lecture',
      },
      content: content || (fileData ? fileData.fileName : ''),
      messageType: finalMessageType,
      file: fileData,
    });
  };

  // ─── 7. Create Group Modal (Lecturer) ───────────────────────────────────────
  const openCreateModal = async () => {
    setShowCreateModal(true);
    setCreateName('');
    setCreateDesc('');
    setCreateAudience('all');
    setSelectedStudentUsns([]);
    setStudentNameFilter('');

    try {
      setLoadingStudents(true);
      const res = await fetch(`${API_BASE_URL}/api/student/all`);
      const data = await res.json();
      if (data.success) {
        setAvailableStudents(data.students || []);
      }
    } catch (err) {
      console.error('Error fetching student list:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!createName.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    if (createAudience === 'selected' && selectedStudentUsns.length === 0) {
      toast.error('Please select at least one student from the roster');
      return;
    }

    try {
      setIsCreatingGroup(true);
      const res = await fetch(`${API_BASE_URL}/api/chat/groups`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: createName.trim(),
          description: createDesc.trim(),
          targetAudience: createAudience,
          selectedStudents: createAudience === 'selected' ? selectedStudentUsns : [],
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Group "${data.group.name}" created!`);
        setShowCreateModal(false);
        setGroups((prev) => [data.group, ...prev]);
        setActiveGroup(data.group);
      } else {
        toast.error(data.message || 'Failed to create group');
      }
    } catch (err) {
      console.error('Create group error:', err);
      toast.error('Server error creating group');
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const toggleStudentSelection = (usn) => {
    setSelectedStudentUsns((prev) =>
      prev.includes(usn) ? prev.filter((id) => id !== usn) : [...prev, usn]
    );
  };

  const selectAllStudents = () => {
    setSelectedStudentUsns(availableStudents.map((s) => s.usn));
  };

  const clearSelectedStudents = () => {
    setSelectedStudentUsns([]);
  };

  // ─── 8. Remove Student Modal & Handler (Lecturer) ──────────────────────────
  const [studentToRemove, setStudentToRemove] = useState(null); // { usn, name }
  const [isRemovingStudent, setIsRemovingStudent] = useState(false);

  const handleRemoveStudent = (studentUsn, studentName) => {
    setStudentToRemove({ usn: studentUsn, name: studentName });
  };

  const confirmRemoveStudent = async () => {
    if (!studentToRemove || !activeGroup) return;

    try {
      setIsRemovingStudent(true);
      const res = await fetch(`${API_BASE_URL}/api/chat/groups/${activeGroup._id}/remove-student`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usn: studentToRemove.usn }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${studentToRemove.name} removed`);
        setActiveGroup(data.group);
        setGroups((prev) => prev.map((g) => (g._id === data.group._id ? data.group : g)));
        if (data.systemMessage) {
          setMessages((prev) => [...prev, data.systemMessage]);
        }
        setStudentToRemove(null);
      } else {
        toast.error(data.message || 'Failed to remove student');
      }
    } catch (err) {
      console.error('Remove student error:', err);
      toast.error('Server error removing student');
    } finally {
      setIsRemovingStudent(false);
    }
  };

  // ─── 9. Leave Group Modal & Handler (Student) ───────────────────────────────
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [isLeavingGroup, setIsLeavingGroup] = useState(false);

  const handleLeaveGroup = () => {
    setShowLeaveModal(true);
  };

  const confirmLeaveGroup = async () => {
    if (!activeGroup) return;

    try {
      setIsLeavingGroup(true);
      const res = await fetch(`${API_BASE_URL}/api/chat/groups/${activeGroup._id}/leave`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`You left "${activeGroup.name}"`);
        setShowLeaveModal(false);
        setShowMembersDrawer(false);
        const updated = groups.filter((g) => g._id !== activeGroup._id);
        setGroups(updated);
        setActiveGroup(updated.length > 0 ? updated[0] : null);
      } else {
        toast.error(data.message || 'Failed to leave group');
      }
    } catch (err) {
      console.error('Leave group error:', err);
      toast.error('Server error leaving group');
    } finally {
      setIsLeavingGroup(false);
    }
  };

  // Filters
  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(groupSearch.toLowerCase())
  );

  const filteredMembers = (activeGroup?.members || []).filter((m) =>
    m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.usn.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const filteredAvailableStudents = availableStudents.filter(
    (s) =>
      s.username.toLowerCase().includes(studentNameFilter.toLowerCase()) ||
      s.usn.toLowerCase().includes(studentNameFilter.toLowerCase())
  );

  // Time & Date format helpers (WhatsApp Web style)
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatChatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  };

  return (
    <main className="h-screen w-full bg-gradient-to-br from-sky-50 via-white to-[rgba(112,177,230,0.18)] font-sans flex flex-col overflow-hidden">
      <Toaster position="top-right" />

      {/* ── Sticky College Top Navbar ── */}
      <div className="flex-shrink-0 z-40 w-full shadow-xs">
        {isStudent ? <Navbar2 /> : <Navbar1 />}
      </div>

      {/* ── Main WhatsApp-Style Container ── */}
      <div className="flex-1 flex overflow-hidden w-full relative">

        {/* ── Left Sidebar (WhatsApp Web Chat List) ── */}
        <aside
          className={`${
            showSidebar ? 'flex' : 'hidden'
          } md:flex flex-col w-full md:w-80 lg:w-96 flex-shrink-0 bg-white border-r border-[#e9edef] z-20 h-full shadow-xs`}
        >
          {/* WhatsApp-Style Sidebar Header */}
          <div className="px-4 py-3 bg-[#f0f2f5] border-b border-[#e9edef] flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* User Profile Avatar with Online Status */}
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00a884] to-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                  {currentUserName[0]?.toUpperCase()}
                </div>
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                    socketConnected ? 'bg-[#25d366]' : 'bg-amber-400'
                  }`}
                  title={socketConnected ? 'Connected' : 'Reconnecting...'}
                />
              </div>

              <div>
                <h2 className="text-[#111b21] font-bold text-base tracking-tight leading-tight">
                  Chats
                </h2>
                <p className="text-[11px] text-[#667781] leading-none">
                  {isStudent ? 'Student Portal' : 'Lecturer Portal'}
                </p>
              </div>
            </div>

            {/* Lecturer "+ New Group" WhatsApp emerald button */}
            {!isStudent && (
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-white bg-[#00a884] hover:bg-[#008f72] active:scale-95 shadow-sm transition-all cursor-pointer"
                title="Create a new chat room"
              >
                <PlusIcon className="w-4 h-4" />
                <span>New Group</span>
              </button>
            )}
          </div>

          {/* WhatsApp Search Bar (Zero overlap between icon and input text) */}
          <div className="p-2.5 bg-white border-b border-[#e9edef]">
            <div className="flex items-center gap-2.5 bg-[#f0f2f5] border border-transparent focus-within:border-slate-300 focus-within:bg-white rounded-lg px-3 py-2 transition-all">
              <SearchIcon className="w-4 h-4 text-[#54656f] shrink-0" />
              <input
                type="text"
                value={groupSearch}
                onChange={(e) => setGroupSearch(e.target.value)}
                placeholder="Search or start new chat"
                className="w-full bg-transparent text-sm text-[#111b21] placeholder:text-[#8696a0] outline-none border-none p-0"
              />
              {groupSearch && (
                <button
                  type="button"
                  onClick={() => setGroupSearch('')}
                  className="text-[#54656f] hover:text-[#111b21] shrink-0 p-0.5 cursor-pointer"
                  title="Clear search"
                >
                  <CloseIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Groups List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#e9edef]/60">
            {loadingGroups ? (
              <div className="p-8 text-center text-[#667781] text-sm">
                <div className="w-6 h-6 border-2 border-[#00a884] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading conversations...
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="p-8 text-center text-[#667781] text-sm">
                {groupSearch ? 'No matching chats found' : 'No chats yet. Click "+ New Group" to get started.'}
              </div>
            ) : (
              filteredGroups.map((group) => {
                const isActive = activeGroup?._id === group._id;
                const isLastMsgMine =
                  group.lastMessage?.senderName === currentUserName ||
                  group.lastMessage?.isMe;

                return (
                  <button
                    key={group._id}
                    onClick={() => {
                      setActiveGroup(group);
                      if (window.innerWidth < 768) setShowSidebar(false);
                    }}
                    className={`w-full flex items-center gap-3.5 px-3.5 py-3 text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#f0f2f5] border-l-4 border-[#00a884]'
                        : 'hover:bg-[#f5f6f6] border-l-4 border-transparent'
                    }`}
                  >
                    {/* WhatsApp Channel Avatar */}
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base shrink-0 shadow-2xs ${
                        isActive
                          ? 'bg-gradient-to-tr from-[#00a884] to-teal-500 text-white'
                          : 'bg-[#dfe5e7] text-[#54656f]'
                      }`}
                    >
                      {group.name[0]?.toUpperCase()}
                    </div>

                    {/* Channel Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h3 className="text-sm font-semibold truncate text-[#111b21]">
                          {group.name}
                        </h3>
                        {group.lastMessage?.time && (
                          <span className="text-[11px] text-[#667781] shrink-0 font-medium">
                            {formatTime(group.lastMessage.time)}
                          </span>
                        )}
                      </div>

                      {/* WhatsApp Last Message Snippet with Sent Tick Indicator */}
                      <div className="flex items-center text-xs text-[#667781] truncate mb-1">
                        {isLastMsgMine && (
                          <span className="inline-flex items-center mr-1 text-[#8696a0]" title="Sent by you">
                            <svg viewBox="0 0 16 15" width="13" height="13" fill="none">
                              <path d="M13.5 3.5l-7.5 7.5-3.5-3.5a.75.75 0 1 0-1.06 1.06l4.03 4.03a.75.75 0 0 0 1.06 0l8.03-8.03a.75.75 0 1 0-1.06-1.06z" fill="currentColor" />
                            </svg>
                          </span>
                        )}
                        <p className="truncate">
                          {group.lastMessage?.content ? (
                            <>
                              {!isLastMsgMine && group.lastMessage.senderName && (
                                <span className="font-medium text-[#111b21]">
                                  {group.lastMessage.senderName}:{' '}
                                </span>
                              )}
                              {group.lastMessage.content}
                            </>
                          ) : (
                            group.description || 'Tap to open chat'
                          )}
                        </p>
                      </div>

                      {/* Clean Group Audience / Members Indicator */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {group.targetAudience === 'all' ? 'All Students' : `${group.members?.length || 0} members`}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* ── Right Panel (WhatsApp Chat Conversation Area) ── */}
        <section
          className="flex-1 flex flex-col overflow-hidden relative"
          style={{
            backgroundColor: '#efeae2',
            backgroundImage: `radial-gradient(#cfd6db 1.2px, transparent 1.2px)`,
            backgroundSize: '24px 24px',
          }}
        >
          {activeGroup ? (
            <>
              {/* WhatsApp Web Chat Header */}
              <div className="px-4 py-2.5 bg-[#f0f2f5] border-b border-[#e9edef] flex items-center justify-between shadow-2xs z-20">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => setShowSidebar(true)}
                    className="md:hidden p-2 rounded-full text-[#54656f] hover:bg-slate-200 transition-colors"
                    title="View Chats"
                  >
                    <UsersIcon className="w-5 h-5" />
                  </button>

                  {/* Channel Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00a884] to-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
                    {activeGroup.name[0]?.toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-[#111b21] font-semibold text-base truncate leading-tight">
                      {activeGroup.name}
                    </h2>
                    {/* WhatsApp-Style Member Subtitle: Clean list of participants */}
                    <p className="text-xs truncate leading-none mt-0.5">
                      {typingUsers.length > 0 ? (
                        <span className="text-[#00a884] font-medium animate-pulse">
                          {typingUsers.join(', ')} typing...
                        </span>
                      ) : (
                        <span className="text-[#667781]">
                          {activeGroup.members && activeGroup.members.length > 0
                            ? activeGroup.members
                                .map((m) => (m.usn === currentUsn || m.name === currentUserName ? 'You' : m.name))
                                .slice(0, 5)
                                .join(', ') +
                              (activeGroup.members.length > 5 ? `, +${activeGroup.members.length - 5} more` : '')
                            : `${activeGroup.members?.length || 0} participants`}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowMembersDrawer((p) => !p)}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#111b21] bg-white hover:bg-slate-100 border border-slate-300 shadow-2xs transition-colors cursor-pointer"
                    title="Group details & participants"
                  >
                    <UsersIcon className="w-4 h-4 text-[#00a884]" />
                    <span>Group Info</span>
                  </button>
                </div>
              </div>

              {/* WhatsApp Messages Scroll Flow Area with Date Dividers */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 space-y-2.5">
                {loadingMessages ? (
                  <div className="flex justify-center items-center h-full text-[#667781] text-sm">
                    <div className="w-6 h-6 border-2 border-[#00a884] border-t-transparent rounded-full animate-spin mr-2" />
                    Loading conversation...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-[#667781]">
                    <div className="w-14 h-14 rounded-full bg-white/90 text-[#00a884] border border-slate-200 flex items-center justify-center mb-3 shadow-xs">
                      <SendIcon className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-[#111b21]">No messages yet</p>
                    <p className="text-xs text-[#667781] mt-1">
                      Say hello or share study resources to start chatting.
                    </p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    // Date Separator calculation
                    const prevMsg = idx > 0 ? messages[idx - 1] : null;
                    const isDifferentDay =
                      !prevMsg ||
                      new Date(prevMsg.createdAt).toDateString() !== new Date(msg.createdAt).toDateString();
                    const dateBadge = isDifferentDay ? formatChatDate(msg.createdAt) : null;

                    // System Message Pill
                    if (msg.messageType === 'system' || msg.sender?.role === 'system') {
                      return (
                        <React.Fragment key={msg._id || msg.clientTempId || idx}>
                          {isDifferentDay && (
                            <div className="flex justify-center my-3 sticky top-2 z-10 pointer-events-none">
                              <span className="bg-white/95 backdrop-blur-md text-[#54656f] text-xs font-semibold px-3 py-1 rounded-lg shadow-xs border border-slate-200/80 uppercase tracking-wide pointer-events-auto select-none">
                                {dateBadge}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-center my-2">
                            <span className="bg-white/90 backdrop-blur-xs text-[#54656f] text-xs font-medium px-4 py-1 rounded-lg shadow-2xs border border-slate-200/60">
                              ℹ️ {msg.content}
                            </span>
                          </div>
                        </React.Fragment>
                      );
                    }

                    const isMe =
                      msg.sender?.id === currentUsn ||
                      msg.sender?.name === currentUserName ||
                      (!isStudent && msg.sender?.role === 'lecture');

                    // Smart file detection & fallback
                    const fileObj = msg.file;
                    const fileUrl = fileObj ? (fileObj.fileUrl || fileObj.url) : null;
                    const ext = (fileObj?.fileName || '').split('.').pop()?.toLowerCase() || '';
                    const isImage = Boolean(fileUrl && (
                      msg.messageType === 'image' ||
                      fileObj?.fileType === 'image' ||
                      ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)
                    ));
                    const isPdf = Boolean(fileUrl && (
                      msg.messageType === 'pdf' ||
                      fileObj?.fileType === 'pdf' ||
                      ext === 'pdf'
                    ));
                    const isVideo = Boolean(fileUrl && (
                      msg.messageType === 'video' ||
                      fileObj?.fileType === 'video' ||
                      ['mp4', 'mov', 'webm'].includes(ext)
                    ));
                    const isDoc = Boolean(fileUrl && !isImage && !isPdf && !isVideo);

                    // Check if content is just redundant file name
                    const hasUserText = msg.content && (!fileObj || msg.content.trim() !== (fileObj.fileName || '').trim());

                    return (
                      <React.Fragment key={msg._id || msg.clientTempId || idx}>
                        {/* Centered WhatsApp Date Divider Pill */}
                        {isDifferentDay && (
                          <div className="flex justify-center my-3 sticky top-2 z-10 pointer-events-none">
                            <span className="bg-white/95 backdrop-blur-md text-[#54656f] text-xs font-semibold px-3.5 py-1 rounded-lg shadow-xs border border-slate-200/80 uppercase tracking-wide pointer-events-auto select-none">
                              {dateBadge}
                            </span>
                          </div>
                        )}

                        {/* WhatsApp Message Bubble */}
                        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`relative max-w-[88%] sm:max-w-[70%] p-2.5 sm:p-3 shadow-[0_1px_0.5px_rgba(11,20,26,0.13)] text-sm sm:text-[15px] leading-relaxed break-words ${
                              isMe
                                ? 'bg-[#d9fdd3] text-[#111b21] rounded-2xl rounded-tr-xs border border-[#c4f4be]/70'
                                : 'bg-white text-[#111b21] rounded-2xl rounded-tl-xs border border-slate-200/80'
                            }`}
                          >
                            {/* Sender Name in WhatsApp Incoming Bubble */}
                            {!isMe && (
                              <div className="flex items-center gap-1.5 mb-1 px-0.5">
                                <span className={`text-xs font-bold ${msg.sender?.role === 'lecture' ? 'text-[#008069]' : 'text-[#128c7e]'}`}>
                                  {msg.sender?.name || 'User'}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                    msg.sender?.role === 'lecture'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}
                                >
                                  {msg.sender?.role === 'lecture' ? 'Lecturer' : 'Student'}
                                </span>
                              </div>
                            )}

                            {/* Media Attachments */}
                            {fileObj && fileUrl && (
                              <div className="mb-2">
                                {/* Image Attachment with Lightbox & One-Click Download */}
                                {isImage && (
                                  <div>
                                    <div
                                      onClick={() => setPreviewModalImage({ url: fileUrl, fileName: fileObj.fileName || 'image.png' })}
                                      className="rounded-xl overflow-hidden border border-black/10 cursor-pointer shadow-2xs hover:opacity-95 transition-all group relative bg-black/5"
                                    >
                                      <img
                                        src={fileUrl}
                                        alt={fileObj.fileName || 'Attached Image'}
                                        className="max-h-80 sm:max-h-96 w-full object-contain rounded-xl transition-transform duration-200 group-hover:scale-[1.01]"
                                        loading="lazy"
                                      />
                                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 gap-2">
                                        <span className="bg-black/75 text-white text-xs px-3 py-1.5 rounded-full font-medium backdrop-blur-xs flex items-center gap-1.5 shadow-md">
                                          <SearchIcon className="w-3.5 h-3.5" /> Enlarge
                                        </span>
                                        <button
                                          type="button"
                                          onClick={(e) => downloadFile(fileObj, e)}
                                          className="bg-[#00a884] hover:bg-[#008f72] text-white p-2 rounded-full font-bold shadow-md flex items-center justify-center active:scale-90 cursor-pointer"
                                          title={`Download ${fileObj.fileName || 'image'}`}
                                          aria-label="Download image"
                                        >
                                          <DownloadIcon className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs mt-1 px-1 text-[#667781]">
                                      <span className="truncate max-w-[200px] font-medium">{fileObj.fileName}</span>
                                      <div className="flex items-center gap-1.5">
                                        {fileObj.fileSize && <span>{fileObj.fileSize}</span>}
                                        <button
                                          type="button"
                                          onClick={(e) => downloadFile(fileObj, e)}
                                          className="text-[#00a884] hover:text-[#008f72] p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center"
                                          title={`Download ${fileObj.fileName || 'image'}`}
                                          aria-label="Download image"
                                        >
                                          <DownloadIcon className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Video Attachment */}
                                {isVideo && (
                                  <div className="rounded-xl overflow-hidden border border-black/10 bg-black shadow-xs">
                                    <video
                                      src={fileUrl}
                                      controls
                                      className="max-h-80 w-full"
                                    />
                                    {fileObj.fileName && (
                                      <div className="flex items-center justify-between text-xs p-1 text-slate-300">
                                        <span className="truncate">{fileObj.fileName}</span>
                                        <button
                                          type="button"
                                          onClick={(e) => downloadFile(fileObj, e)}
                                          className="text-[#00a884] hover:text-[#008f72] p-1 rounded-full hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center"
                                          title={`Download ${fileObj.fileName || 'video'}`}
                                          aria-label="Download video"
                                        >
                                          <DownloadIcon className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* WhatsApp Document / PDF Card with Direct Device Download */}
                                {(isPdf || isDoc) && (
                                  <div
                                    className={`flex items-center gap-3 p-3 rounded-xl border shadow-2xs transition-all ${
                                      isMe
                                        ? 'bg-[#cbf7c3]/80 border-[#b5eab0] text-[#111b21]'
                                        : 'bg-[#f0f2f5] border-slate-200 text-[#111b21]'
                                    }`}
                                  >
                                    <div className={`p-2.5 rounded-lg shrink-0 ${
                                      isPdf ? 'bg-red-500 text-white' : 'bg-[#00a884] text-white'
                                    }`}>
                                      <FileIcon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                                          isPdf ? 'bg-red-100 text-red-700' : 'bg-teal-100 text-teal-800'
                                        }`}>
                                          {isPdf ? 'PDF' : 'DOC'}
                                        </span>
                                        <p className="text-xs sm:text-sm font-semibold truncate text-[#111b21]">
                                          {fileObj.fileName || (isPdf ? 'Document.pdf' : 'Attachment')}
                                        </p>
                                      </div>
                                      <p className="text-xs mt-0.5 text-[#667781]">
                                        {fileObj.fileSize || 'Document File'}
                                      </p>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                      {/* In-App PDF Reader Modal (Eye Icon Only) */}
                                      {isPdf && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const accessibleUrl = getFileViewUrl(fileObj);
                                            setPdfModalPreview({
                                              url: accessibleUrl,
                                              title: fileObj.fileName || 'PDF Document',
                                            });
                                          }}
                                          className="p-2 rounded-full font-bold text-xs flex items-center justify-center transition-all shadow-2xs cursor-pointer bg-white text-[#00a884] border border-slate-300 hover:bg-slate-100 active:scale-90"
                                          title="Preview PDF"
                                          aria-label="Preview PDF"
                                        >
                                          <EyeIcon className="w-4 h-4 text-[#00a884]" />
                                        </button>
                                      )}

                                      {/* Direct Local Device Download (Download Icon Only) */}
                                      <button
                                        type="button"
                                        onClick={(e) => downloadFile(fileObj, e)}
                                        className="p-2 rounded-full font-bold text-xs flex items-center justify-center transition-all shadow-2xs cursor-pointer bg-[#00a884] hover:bg-[#008f72] text-white active:scale-90"
                                        title={`Download ${fileObj.fileName || 'file'} to your device`}
                                        aria-label="Download file"
                                      >
                                        <DownloadIcon className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Message Text */}
                            {hasUserText && (
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                            )}

                            {/* WhatsApp Timestamp & Status Icons */}
                            <div className="flex items-center justify-end gap-1 mt-1 text-[11px] text-[#667781] select-none float-right ml-2 -mb-0.5">
                              <span>{formatTime(msg.createdAt)}</span>
                              {isMe && <MessageTicks message={msg} currentUsn={currentUsn} />}
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                )}

                {/* Live Typing Indicator */}
                {typingUsers.length > 0 && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#00a884] py-1 px-1">
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                    <span>{typingUsers.join(', ')} typing...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* ── WhatsApp-Style Input Bar ── */}
              <div className="p-2.5 sm:p-3 bg-[#f0f2f5] border-t border-[#e9edef] shadow-sm z-20">
                {/* Pending Attachment Card & Sender Live Preview */}
                {selectedFile && (
                  <div className="mb-2.5 bg-white border border-slate-200 p-3 rounded-xl shadow-md">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`p-2.5 rounded-lg shrink-0 ${
                            selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf')
                              ? 'bg-red-100 text-red-600'
                              : 'bg-emerald-100 text-[#00a884]'
                          }`}
                        >
                          <FileIcon className="w-5 h-5" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-[#111b21] truncate">{selectedFile.name}</p>
                          <p className="text-xs text-[#667781] mt-0.5">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB ·{' '}
                            {selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf')
                              ? 'PDF Document'
                              : 'Attachment'}{' '}
                            — Ready to send
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* PDF Sender Controls */}
                        {(selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf')) && (
                          <>
                            <button
                              type="button"
                              onClick={() => setShowPdfSenderPreview((prev) => !prev)}
                              className="px-2.5 py-1.5 rounded-md text-xs font-semibold text-[#111b21] bg-[#f0f2f5] hover:bg-slate-200 border border-slate-300 shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                              title="Toggle inline preview"
                            >
                              <EyeIcon className="w-3.5 h-3.5 text-[#00a884]" />
                              <span>{showPdfSenderPreview ? 'Hide Preview' : 'Preview'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setPdfModalPreview({
                                  url: selectedFilePreviewUrl,
                                  title: selectedFile.name,
                                })
                              }
                              className="px-2.5 py-1.5 rounded-md text-xs font-semibold text-white bg-[#00a884] hover:bg-[#008f72] shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                              title="Expand to Full Screen Reader"
                            >
                              <span>Full Screen</span>
                            </button>
                          </>
                        )}

                        {/* Image Thumbnail preview click */}
                        {selectedFile.type.startsWith('image/') && selectedFilePreviewUrl && (
                          <div
                            onClick={() => setPreviewModalImage({ url: selectedFilePreviewUrl, fileName: selectedFile.name })}
                            className="cursor-pointer hover:opacity-90 transition-opacity"
                            title="Click to view image"
                          >
                            <img
                              src={selectedFilePreviewUrl}
                              alt="Thumbnail"
                              className="w-10 h-10 rounded-lg object-cover border border-slate-300 shadow-2xs"
                            />
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="text-[#54656f] hover:text-[#111b21] p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Remove attachment"
                        >
                          <CloseIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Sender PDF Live Inline Preview */}
                    {(selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf')) &&
                      showPdfSenderPreview &&
                      selectedFilePreviewUrl && (
                        <div className="mt-2.5 rounded-lg border border-slate-300 overflow-hidden bg-slate-900 shadow-inner">
                          <div className="px-3.5 py-1.5 bg-slate-800 border-b border-slate-700 flex items-center justify-between text-xs text-white">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                              <span className="font-bold">PDF Live Preview: {selectedFile.name}</span>
                            </div>
                            <span className="text-[11px] text-slate-400">Scroll inside to read pages</span>
                          </div>
                          <iframe
                            src={selectedFilePreviewUrl}
                            title="Sender PDF Preview"
                            className="w-full h-60 sm:h-72 bg-white"
                          />
                        </div>
                      )}
                  </div>
                )}

                {/* Input Bar Row */}
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                  />

                  {/* Attachment Button (Paperclip) */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="p-2.5 rounded-full text-[#54656f] hover:text-[#111b21] hover:bg-slate-200/80 transition-all cursor-pointer shrink-0 active:scale-95 disabled:opacity-50"
                    title="Attach File (PDFs, Images, Docs)"
                  >
                    <PaperclipIcon className="w-5 h-5" />
                  </button>

                  {/* Text Input Pill */}
                  <div className="flex-1 bg-white rounded-lg px-4 py-2.5 shadow-2xs border border-transparent focus-within:border-slate-300 transition-all">
                    <input
                      type="text"
                      value={input}
                      onChange={handleInputChange}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                      placeholder={selectedFile ? 'Add a caption for this attachment…' : 'Type a message'}
                      disabled={isUploading}
                      className="w-full bg-transparent text-sm sm:text-base text-[#111b21] placeholder:text-[#8696a0] outline-none border-none p-0"
                    />
                  </div>

                  {/* WhatsApp Circular Emerald Send Button */}
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={(!input.trim() && !selectedFile) || isUploading}
                    className={`w-11 h-11 rounded-full font-bold shadow-md transition-all cursor-pointer flex items-center justify-center shrink-0 active:scale-90 ${
                      input.trim() || selectedFile
                        ? 'bg-[#00a884] hover:bg-[#008f72] text-white shadow-emerald-600/25'
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60'
                    }`}
                    title="Send Message"
                  >
                    {isUploading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <SendIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-[#667781] p-6">
              <div className="w-16 h-16 rounded-full bg-white text-[#00a884] border border-slate-200 flex items-center justify-center mb-3 shadow-xs">
                <UsersIcon className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-[#111b21]">WhatsApp-Style Chat Room</h3>
              <p className="text-xs text-[#667781] max-w-sm mt-1">
                Select a chat from the left panel to join the conversation, share files, and view real-time status.
              </p>
            </div>
          )}
        </section>

        {/* ── Slide-Over WhatsApp Group Info Drawer ── */}
        {showMembersDrawer && activeGroup && (
          <aside className="w-full sm:w-88 bg-white border-l border-[#e9edef] flex flex-col shadow-2xl absolute right-0 top-0 bottom-0 z-30">
            <div className="p-3.5 bg-[#f0f2f5] border-b border-[#e9edef] flex items-center justify-between">
              <div>
                <h3 className="text-[#111b21] font-bold text-sm sm:text-base">Group Info</h3>
                <p className="text-[#667781] text-xs">{activeGroup.members?.length || 0} participants</p>
              </div>
              <button
                onClick={() => setShowMembersDrawer(false)}
                className="p-1.5 rounded-full text-[#54656f] hover:text-[#111b21] hover:bg-slate-200 transition-colors"
                title="Close"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 border-b border-[#e9edef] bg-white text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#00a884] to-teal-600 text-white flex items-center justify-center font-bold text-2xl mx-auto mb-2.5 shadow-xs">
                {activeGroup.name[0]?.toUpperCase()}
              </div>
              <h4 className="text-[#111b21] font-bold text-base">{activeGroup.name}</h4>
              {activeGroup.description && (
                <p className="text-[#667781] text-xs mt-1">{activeGroup.description}</p>
              )}
              <p className="mt-1.5 text-xs text-[#667781]">
                Created by <span className="font-semibold text-[#111b21]">{activeGroup.createdBy?.name || 'Lecturer'}</span>
              </p>
            </div>

            {/* Filter Member Input */}
            <div className="p-3 border-b border-[#e9edef]">
              <div className="flex items-center gap-2 bg-[#f0f2f5] rounded-lg px-3 py-1.5">
                <SearchIcon className="w-4 h-4 text-[#54656f] shrink-0" />
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Search participants..."
                  className="w-full bg-transparent text-sm text-[#111b21] placeholder:text-[#8696a0] outline-none border-none p-0"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 divide-y divide-[#e9edef]/60">
              {filteredMembers.map((member) => (
                <div
                  key={member.usn}
                  className="flex items-center justify-between p-2.5 hover:bg-[#f5f6f6] rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-[#dfe5e7] text-[#54656f] flex items-center justify-center text-xs font-bold shrink-0">
                      {member.name[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-[#111b21] truncate">{member.name}</p>
                        {member.role === 'lecture' && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                            Lecturer
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono text-[#667781] truncate">{member.usn}</p>
                    </div>
                  </div>

                  {!isStudent && member.role === 'student' && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStudent(member.usn, member.name)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                      title="Remove student from group"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {isStudent && (
              <div className="p-4 border-t border-[#e9edef] bg-[#f0f2f5]">
                <button
                  type="button"
                  onClick={handleLeaveGroup}
                  className="w-full py-2.5 rounded-lg text-sm font-bold text-red-600 bg-white hover:bg-red-50 border border-red-200 transition-colors cursor-pointer shadow-2xs"
                >
                  Leave Group
                </button>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* ── Modal: New Group with Clear, Visible Buttons & Roster Selection ── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[#e9edef] bg-[#f0f2f5] flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#111b21]">
                  Create New Chat Group
                </h3>
                <p className="text-[#667781] text-xs mt-0.5">
                  Broadcast to all students or pick a specific roster
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-full text-[#54656f] hover:text-[#111b21] hover:bg-slate-200 transition-colors"
                title="Close"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateGroup} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {/* Group Name */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
                  Group Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="e.g. CS601 - Database Engineering"
                  className="w-full px-4 py-2.5 rounded-lg text-sm font-medium border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 focus:border-[#00a884] focus:ring-1 focus:ring-[#00a884]/20 focus:outline-none transition-all shadow-xs"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={createDesc}
                  onChange={(e) => setCreateDesc(e.target.value)}
                  placeholder="Brief note about this channel..."
                  className="w-full px-4 py-2.5 rounded-lg text-sm font-medium border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 focus:border-[#00a884] focus:ring-1 focus:ring-[#00a884]/20 focus:outline-none transition-all shadow-xs"
                />
              </div>

              {/* Audience Choice Buttons */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
                  Audience <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setCreateAudience('all')}
                    className={`flex items-center gap-3 p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                      createAudience === 'all'
                        ? 'bg-emerald-50 border-[#00a884] text-[#111b21] shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-emerald-100 text-[#00a884] shrink-0">
                      <UsersIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">All Students</p>
                      <p className="text-xs text-slate-500">All registered students</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreateAudience('selected')}
                    className={`flex items-center gap-3 p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                      createAudience === 'selected'
                        ? 'bg-emerald-50 border-[#00a884] text-[#111b21] shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-teal-100 text-teal-800 shrink-0">
                      <TargetIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Select Students</p>
                      <p className="text-xs text-slate-500">Pick from student roster</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* ── Registered Students Roster (Click-to-Select) ── */}
              {createAudience === 'selected' && (
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Student Roster
                      </h4>
                      <p className="text-xs text-slate-500">
                        Click on any student card to select
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#00a884] bg-emerald-100 px-2.5 py-1 rounded-md">
                        {selectedStudentUsns.length} / {availableStudents.length} Selected
                      </span>
                      <button
                        type="button"
                        onClick={selectAllStudents}
                        className="text-xs font-bold text-[#00a884] hover:underline cursor-pointer px-1"
                      >
                        Select All
                      </button>
                      <span className="text-slate-300 text-xs">|</span>
                      <button
                        type="button"
                        onClick={clearSelectedStudents}
                        className="text-xs font-bold text-slate-500 hover:text-slate-700 hover:underline cursor-pointer px-1"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Filter by Name */}
                  <div className="flex items-center gap-2.5 bg-white border border-slate-300 rounded-lg px-3.5 py-2 focus-within:border-[#00a884] transition-all shadow-2xs">
                    <SearchIcon className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={studentNameFilter}
                      onChange={(e) => setStudentNameFilter(e.target.value)}
                      placeholder="Filter student list by name..."
                      className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none border-none p-0"
                    />
                    {studentNameFilter && (
                      <button
                        type="button"
                        onClick={() => setStudentNameFilter('')}
                        className="text-slate-400 hover:text-slate-600 shrink-0 p-0.5"
                      >
                        <CloseIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Student Cards Grid */}
                  <div className="max-h-56 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {loadingStudents ? (
                      <div className="col-span-full py-8 text-center text-slate-400 text-sm">
                        <div className="w-5 h-5 border-2 border-[#00a884] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        Loading student records...
                      </div>
                    ) : filteredAvailableStudents.length === 0 ? (
                      <div className="col-span-full py-8 text-center text-slate-400 text-sm">
                        No registered students found.
                      </div>
                    ) : (
                      filteredAvailableStudents.map((st) => {
                        const isSelected = selectedStudentUsns.includes(st.usn);
                        return (
                          <div
                            key={st.usn}
                            onClick={() => toggleStudentSelection(st.usn)}
                            className={`flex items-center justify-between p-2.5 sm:p-3 rounded-lg border text-sm cursor-pointer transition-all select-none ${
                              isSelected
                                ? 'bg-emerald-50 border-[#00a884] text-slate-900 shadow-xs'
                                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                  isSelected
                                    ? 'bg-[#00a884] text-white'
                                    : 'bg-slate-200 text-slate-700'
                                }`}
                              >
                                {st.username[0]?.toUpperCase()}
                              </div>

                              <div className="min-w-0">
                                <p className={`font-bold text-xs sm:text-sm truncate ${isSelected ? 'text-[#008069]' : 'text-slate-900'}`}>
                                  {st.username}
                                </p>
                                <p className="text-xs font-mono text-slate-500 truncate">
                                  {st.usn}
                                </p>
                              </div>
                            </div>

                            {/* Checkmark Box */}
                            <div
                              className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-all ${
                                isSelected
                                  ? 'bg-[#00a884] text-white'
                                  : 'border border-slate-300 text-transparent'
                              }`}
                            >
                              <CheckIcon className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingGroup}
                  className="px-6 py-2 rounded-lg text-sm font-bold bg-[#00a884] hover:bg-[#008f72] text-white disabled:opacity-50 transition-all shadow-md cursor-pointer flex items-center gap-2"
                >
                  {isCreatingGroup && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>Create Group</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Image Lightbox Modal with Direct Download ── */}
      {previewModalImage && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewModalImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={typeof previewModalImage === 'string' ? previewModalImage : previewModalImage.url}
              alt="Expanded Preview"
              className="max-h-[82vh] max-w-full rounded-xl object-contain shadow-2xl"
            />
            
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  downloadFile({
                    fileName: typeof previewModalImage === 'string' ? 'image.png' : (previewModalImage.fileName || 'image.png'),
                    fileUrl: typeof previewModalImage === 'string' ? previewModalImage : previewModalImage.url,
                  })
                }
                className="px-4 py-2 rounded-lg bg-[#00a884] hover:bg-[#008f72] text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95"
                title="Download image to your computer"
              >
                <DownloadIcon className="w-4 h-4" />
                <span>Download Image</span>
              </button>

              <button
                onClick={() => setPreviewModalImage(null)}
                className="p-2 rounded-lg bg-black/60 hover:bg-black text-white transition-colors cursor-pointer"
                title="Close Preview"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── In-App PDF Document Viewer Modal with Direct Download ── */}
      {pdfModalPreview && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-5"
          onClick={() => setPdfModalPreview(null)}
        >
          <div
            className="bg-white rounded-xl border border-slate-300 shadow-2xl w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-3 border-b border-slate-800 bg-slate-900 text-white flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-red-500 text-white shrink-0 shadow-xs">
                  <FileIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold truncate text-white">
                    {pdfModalPreview.title || 'PDF Document Viewer'}
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate">
                    Interactive PDF Reader & Viewer
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Download PDF button that downloads with exact original filename */}
                <button
                  type="button"
                  onClick={() =>
                    downloadFile({
                      fileName: pdfModalPreview.title || 'document.pdf',
                      fileUrl: pdfModalPreview.url,
                    })
                  }
                  className="px-4 py-2 rounded-lg bg-[#00a884] hover:bg-[#008f72] active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  title="Download PDF to your computer"
                >
                  <DownloadIcon className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPdfModalPreview(null)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Close viewer"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PDF Viewer Body */}
            <div className="flex-1 bg-slate-100 relative">
              <iframe
                src={pdfModalPreview.url}
                title={pdfModalPreview.title || 'PDF Reader'}
                className="w-full h-full border-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Beautiful Leave Group Confirmation Modal ── */}
      {showLeaveModal && activeGroup && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => !isLeavingGroup && setShowLeaveModal(false)}
        >
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden p-6 text-center transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning Exit Icon */}
            <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 border border-red-100 flex items-center justify-center mx-auto mb-4 shadow-xs">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-1.5">
              Leave &ldquo;{activeGroup.name}&rdquo;?
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              You will no longer receive new messages, announcements, or shared resources from this group. You can rejoin only if the lecturer adds you back.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowLeaveModal(false)}
                disabled={isLeavingGroup}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmLeaveGroup}
                disabled={isLeavingGroup}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 active:scale-95 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                {isLeavingGroup ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Leave Group</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Remove Student Confirmation Modal (Lecturer) ── */}
      {studentToRemove && activeGroup && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => !isRemovingStudent && setStudentToRemove(null)}
        >
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden p-6 text-center transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 border border-red-100 flex items-center justify-center mx-auto mb-4 shadow-xs">
              <TrashIcon className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-1.5">
              Remove {studentToRemove.name}?
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              Student <span className="font-mono font-semibold text-slate-800">({studentToRemove.usn})</span> will be removed from <span className="font-semibold text-slate-800">&ldquo;{activeGroup.name}&rdquo;</span> and will lose access to this conversation.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStudentToRemove(null)}
                disabled={isRemovingStudent}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRemoveStudent}
                disabled={isRemovingStudent}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 active:scale-95 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                {isRemovingStudent ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Remove</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ChatRoom;
