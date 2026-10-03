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

const ClockIcon = ({ className = 'w-3 h-3 text-slate-400' }) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
    <circle cx="8" cy="8" r="6.2" />
    <polyline points="8 4.2 8 8 10.5 9.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowLeftIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const ReplyIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 17 4 12 9 7" />
    <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
  </svg>
);

// ─── Status / Delivery Ticks Component ─────────────────────────────────
const MessageTicks = ({ message, currentUsn, isMe = false }) => {
  const tickColor = isMe ? 'text-blue-200' : 'text-slate-400';
  const seenColor = isMe ? 'text-sky-200' : 'text-blue-500';

  // 1. Sending in flight / optimistic temporary state -> Clock Icon
  if (message.status === 'sending' || (message._id && String(message._id).startsWith('temp_'))) {
    return (
      <span className={`inline-flex items-center ${tickColor} ml-1 select-none`} title="Sending...">
        <ClockIcon className={`w-3 h-3 ${tickColor}`} />
      </span>
    );
  }

  // 2. Failed state
  if (message.status === 'error') {
    return (
      <span className="inline-flex items-center text-rose-300 ml-1 select-none" title="Failed to send">
        <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0-1A6 6 0 1 0 8 2a6 6 0 0 0 0 12zM7.25 4.5h1.5v5h-1.5v-5zm0 6.5h1.5v1.5h-1.5V11z" />
        </svg>
      </span>
    );
  }

  const readCount = message.readBy?.filter((r) => r.usn !== currentUsn)?.length || 0;
  const deliveredCount = message.deliveredTo?.filter((d) => d.usn !== currentUsn)?.length || 0;

  // 3. Double Tick (Seen / Read)
  if (readCount > 0) {
    return (
      <span className={`inline-flex items-center ${seenColor} ml-1 select-none`} title="Seen">
        <svg viewBox="0 0 16 15" width="15" height="14" fill="none">
          <path d="M15.01 3.316l-7.9 7.9-3.13-3.13a.75.75 0 1 0-1.06 1.06l3.66 3.66a.75.75 0 0 0 1.06 0l8.43-8.43a.75.75 0 1 0-1.06-1.06z" fill="currentColor" />
          <path d="M11.01 3.316l-7.9 7.9-1.13-1.13a.75.75 0 1 0-1.06 1.06l1.66 1.66a.75.75 0 0 0 1.06 0l8.43-8.43a.75.75 0 1 0-1.06-1.06z" fill="currentColor" />
        </svg>
      </span>
    );
  }

  // 4. Double Tick (Delivered)
  if (deliveredCount > 0) {
    return (
      <span className={`inline-flex items-center ${tickColor} ml-1 select-none`} title="Delivered">
        <svg viewBox="0 0 16 15" width="15" height="14" fill="none">
          <path d="M15.01 3.316l-7.9 7.9-3.13-3.13a.75.75 0 1 0-1.06 1.06l3.66 3.66a.75.75 0 0 0 1.06 0l8.43-8.43a.75.75 0 1 0-1.06-1.06z" fill="currentColor" />
          <path d="M11.01 3.316l-7.9 7.9-1.13-1.13a.75.75 0 1 0-1.06 1.06l1.66 1.66a.75.75 0 0 0 1.06 0l8.43-8.43a.75.75 0 1 0-1.06-1.06z" fill="currentColor" opacity="0.8" />
        </svg>
      </span>
    );
  }

  // 5. Single Tick (Sent to server)
  return (
    <span className={`inline-flex items-center ${tickColor} ml-1 select-none`} title="Sent">
      <svg viewBox="0 0 16 15" width="13" height="13" fill="none">
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

  // ─── WhatsApp Swipe-to-Reply State ────────────────────────────────────
  const [replyingTo, setReplyingTo] = useState(null); // { _id, sender, content, file, messageType }
  const [swipingMsgId, setSwipingMsgId] = useState(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);

  // ─── Multi-Select & Delete State ──────────────────────────────────────
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMsgIds, setSelectedMsgIds] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeletingMessages, setIsDeletingMessages] = useState(false);
  const longPressTimerRef = useRef(null);

  // ─── Add Members to Existing Group State (Lecturer) ───────────────────
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);
  const [nonMemberStudents, setNonMemberStudents] = useState([]);
  const [selectedAddUsns, setSelectedAddUsns] = useState([]);
  const [addMemberSearch, setAddMemberSearch] = useState('');
  const [loadingNonMembers, setLoadingNonMembers] = useState(false);
  const [isAddingMembers, setIsAddingMembers] = useState(false);

  // ─── Delete Group Modal State (Lecturer) ──────────────────────────────
  const [showDeleteGroupModal, setShowDeleteGroupModal] = useState(false);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);

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

    // Messages deleted event (Real-time Delete for Everyone)
    socket.on('messages_deleted', ({ groupId, messageIds, deleteType }) => {
      if (deleteType === 'for_everyone') {
        setMessages((prev) =>
          prev.map((m) =>
            messageIds.includes(m._id)
              ? {
                  ...m,
                  isDeletedForEveryone: true,
                  content: '🚫 This message was deleted',
                  file: null,
                }
              : m
          )
        );
      }
    });

    // Group deleted event
    socket.on('group_deleted', ({ groupId }) => {
      setGroups((prev) => prev.filter((g) => g._id !== groupId));
      setActiveGroup((prev) => (prev?._id === groupId ? null : prev));
      toast.error('This group was deleted by the lecturer');
    });

    // Group members updated event
    socket.on('group_members_updated', ({ groupId, group }) => {
      setGroups((prev) => prev.map((g) => (g._id === groupId ? group : g)));
      setActiveGroup((prev) => (prev?._id === groupId ? group : prev));
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

    // Prepare reply payload if replying
    const pendingReplyTo = replyingTo ? {
      messageId: replyingTo._id,
      senderName: replyingTo.sender?.name || 'User',
      content: replyingTo.content || replyingTo.file?.fileName || 'Attachment',
      messageType: replyingTo.messageType || 'text',
      fileName: replyingTo.file?.fileName || '',
    } : null;

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
      replyTo: pendingReplyTo,
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

    // Clear input, file & reply immediately so user is not blocked
    setInput('');
    setSelectedFile(null);
    setReplyingTo(null);
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

    // Step C: Emit through socket with clientTempId & replyTo
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
      replyTo: pendingReplyTo,
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

  // ─── 10. Swipe-to-Reply & Long-Press Selection Handlers ───────────────────
  const handleTouchStart = (e, msg) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;

    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      setIsSelectionMode(true);
      setSelectedMsgIds((prev) => (prev.includes(msg._id) ? prev : [...prev, msg._id]));
      if (window.navigator?.vibrate) window.navigator.vibrate(40);
    }, 450);
  };

  const handleTouchMove = (e, msg) => {
    const diffX = e.touches[0].clientX - touchStartXRef.current;
    const diffY = Math.abs(e.touches[0].clientY - touchStartYRef.current);

    if (Math.abs(diffX) > 10 || diffY > 10) {
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    }

    if (!isSelectionMode && diffX > 8 && diffY < 30) {
      setSwipingMsgId(msg._id);
      setSwipeOffset(Math.min(diffX * 0.55, 60));
    }
  };

  const handleTouchEnd = (e, msg) => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);

    if (swipingMsgId === msg._id && swipeOffset >= 35) {
      setReplyingTo(msg);
      if (window.navigator?.vibrate) window.navigator.vibrate(25);
    }
    setSwipingMsgId(null);
    setSwipeOffset(0);
  };

  const handleMouseDown = (msg) => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      setIsSelectionMode(true);
      setSelectedMsgIds((prev) => (prev.includes(msg._id) ? prev : [...prev, msg._id]));
    }, 500);
  };

  const handleMouseUp = () => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
  };

  const handleMessageClick = (msg) => {
    if (isSelectionMode) {
      setSelectedMsgIds((prev) => {
        if (prev.includes(msg._id)) {
          const next = prev.filter((id) => id !== msg._id);
          if (next.length === 0) setIsSelectionMode(false);
          return next;
        } else {
          return [...prev, msg._id];
        }
      });
    }
  };

  // ─── 11. Delete Messages Handler (Delete for Me vs Delete for Everyone) ─────
  const handleDeleteMessages = async (deleteType) => {
    if (!activeGroup || selectedMsgIds.length === 0) return;
    try {
      setIsDeletingMessages(true);
      const res = await fetch(`${API_BASE_URL}/api/chat/groups/${activeGroup._id}/delete-messages`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageIds: selectedMsgIds,
          deleteType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Messages deleted');
        if (deleteType === 'for_me') {
          setMessages((prev) => prev.filter((m) => !selectedMsgIds.includes(m._id)));
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              selectedMsgIds.includes(m._id)
                ? {
                    ...m,
                    isDeletedForEveryone: true,
                    content: '🚫 This message was deleted',
                    file: null,
                  }
                : m
            )
          );
          socketRef.current?.emit('messages_deleted', {
            groupId: activeGroup._id,
            messageIds: selectedMsgIds,
            deleteType: 'for_everyone',
          });
        }
        setIsSelectionMode(false);
        setSelectedMsgIds([]);
        setShowDeleteModal(false);
      } else {
        toast.error(data.message || 'Failed to delete messages');
      }
    } catch (err) {
      console.error('Error deleting messages:', err);
      toast.error('Server error deleting messages');
    } finally {
      setIsDeletingMessages(false);
    }
  };

  // ─── 12. Delete Group Handler (Lecturer) ──────────────────────────────────
  const confirmDeleteGroup = async () => {
    if (!activeGroup) return;
    try {
      setIsDeletingGroup(true);
      const res = await fetch(`${API_BASE_URL}/api/chat/groups/${activeGroup._id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Group "${activeGroup.name}" deleted`);
        socketRef.current?.emit('group_deleted', { groupId: activeGroup._id });
        setShowDeleteGroupModal(false);
        setShowMembersDrawer(false);
        const remaining = groups.filter((g) => g._id !== activeGroup._id);
        setGroups(remaining);
        setActiveGroup(remaining.length > 0 ? remaining[0] : null);
      } else {
        toast.error(data.message || 'Failed to delete group');
      }
    } catch (err) {
      console.error('Error deleting group:', err);
      toast.error('Server error deleting group');
    } finally {
      setIsDeletingGroup(false);
    }
  };

  // ─── 13. Add Members to Existing Group (Lecturer) ─────────────────────────
  const openAddMembersModal = async () => {
    if (!activeGroup) return;
    setShowAddMembersModal(true);
    setSelectedAddUsns([]);
    setAddMemberSearch('');
    setLoadingNonMembers(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/groups/${activeGroup._id}/non-members`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setNonMemberStudents(data.nonMembers || []);
      } else {
        toast.error(data.message || 'Failed to load students');
      }
    } catch (err) {
      console.error('Error fetching non-members:', err);
      toast.error('Server error loading students');
    } finally {
      setLoadingNonMembers(false);
    }
  };

  const confirmAddMembers = async () => {
    if (!activeGroup || selectedAddUsns.length === 0) return;
    try {
      setIsAddingMembers(true);
      const res = await fetch(`${API_BASE_URL}/api/chat/groups/${activeGroup._id}/add-members`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selectedStudents: selectedAddUsns }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Members added successfully');
        setShowAddMembersModal(false);
        setActiveGroup(data.group);
        setGroups((prev) => prev.map((g) => (g._id === data.group._id ? data.group : g)));
        if (data.systemMessage) {
          setMessages((prev) => [...prev, data.systemMessage]);
        }
        socketRef.current?.emit('members_updated', { groupId: activeGroup._id, group: data.group });
      } else {
        toast.error(data.message || 'Failed to add members');
      }
    } catch (err) {
      console.error('Error adding members:', err);
      toast.error('Server error adding members');
    } finally {
      setIsAddingMembers(false);
    }
  };

  // Check if all selected messages belong to current user for "Delete for Everyone"
  const selectedMsgs = messages.filter((m) => selectedMsgIds.includes(m._id));
  const canDeleteForEveryone =
    selectedMsgs.length > 0 &&
    selectedMsgs.every(
      (m) =>
        m.sender?.id === currentUsn ||
        m.sender?.name === currentUserName ||
        (!isStudent && m.sender?.role === 'lecture')
    );

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

  const filteredNonMembers = nonMemberStudents.filter(
    (s) =>
      s.username.toLowerCase().includes(addMemberSearch.toLowerCase()) ||
      s.usn.toLowerCase().includes(addMemberSearch.toLowerCase())
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
    <main className="h-[100dvh] w-full bg-slate-100 font-sans flex flex-col overflow-hidden">
      <Toaster position="top-right" />

      {/* ── Sticky College Top Navbar ── */}
      <div className="flex-shrink-0 z-40 w-full shadow-xs">
        {isStudent ? <Navbar2 /> : <Navbar1 />}
      </div>

      {/* ── Main Container: Full width edge-to-edge on mobile and desktop for optimal layout ── */}
      <div className="flex-1 w-full flex overflow-hidden relative min-w-0 bg-white">

        {/* ── Left Sidebar (Conversations List) ── */}
        <aside
          className={`${
            showSidebar ? 'flex' : 'hidden'
          } md:flex flex-col w-full md:w-80 lg:w-96 flex-shrink-0 bg-white border-r border-slate-200 z-20 h-full min-w-0`}
        >
          {/* Professional Sidebar Header */}
          <div className="px-3.5 sm:px-4 py-2.5 sm:py-3 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* User Profile Avatar with Online Status */}
              <div className="relative">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-sm bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-xs">
                  {currentUserName[0]?.toUpperCase()}
                </div>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-white ${
                    socketConnected ? 'bg-emerald-500' : 'bg-amber-400'
                  }`}
                  title={socketConnected ? 'Connected' : 'Reconnecting...'}
                />
              </div>

              <div>
                <h2 className="text-slate-900 font-bold text-sm sm:text-base tracking-tight leading-tight">
                  Discussions
                </h2>
                <p className="text-[10px] sm:text-[11px] text-slate-500 leading-none mt-0.5">
                  {isStudent ? 'Student Portal' : 'Faculty Portal'}
                </p>
              </div>
            </div>

            {/* Lecturer "+ New Group" Button */}
            {!isStudent && (
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-sm text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-xs transition-all cursor-pointer"
                title="Create a new chat room"
              >
                <PlusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>New Group</span>
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="p-2 sm:p-2.5 bg-white border-b border-slate-200 shrink-0">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-sm px-2.5 sm:px-3 py-1.5 sm:py-2 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
              <SearchIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={groupSearch}
                onChange={(e) => setGroupSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none border-none p-0"
              />
              {groupSearch && (
                <button
                  type="button"
                  onClick={() => setGroupSearch('')}
                  className="text-slate-400 hover:text-slate-600 shrink-0 p-0.5 cursor-pointer"
                  title="Clear search"
                >
                  <CloseIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Groups List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loadingGroups ? (
              <div className="p-6 sm:p-8 text-center text-slate-500 text-xs sm:text-sm">
                <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading conversations...
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="p-6 sm:p-8 text-center text-slate-500 text-xs sm:text-sm">
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
                    className={`w-full flex items-center gap-2.5 sm:gap-3 px-3 py-2.5 sm:px-3.5 sm:py-3 text-left transition-all cursor-pointer border-l-3 ${
                      isActive
                        ? 'bg-blue-50/70 border-blue-600'
                        : 'hover:bg-slate-50 border-transparent'
                    }`}
                  >
                    {/* Channel Avatar */}
                    <div
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-sm flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 shadow-2xs transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {group.name[0]?.toUpperCase()}
                    </div>

                    {/* Channel Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h3 className={`text-xs sm:text-sm truncate font-semibold ${isActive ? 'text-blue-950 font-bold' : 'text-slate-900'}`}>
                          {group.name}
                        </h3>
                        {group.lastMessage?.time && (
                          <span className="text-[10px] sm:text-[11px] text-slate-400 shrink-0 font-medium">
                            {formatTime(group.lastMessage.time)}
                          </span>
                        )}
                      </div>

                      {/* Last Message Snippet */}
                      <div className="flex items-center text-[11px] sm:text-xs text-slate-500 truncate mb-1">
                        {isLastMsgMine && (
                          <span className="inline-flex items-center mr-1 text-slate-400 shrink-0" title="Sent by you">
                            <svg viewBox="0 0 16 15" width="12" height="12" fill="none">
                              <path d="M13.5 3.5l-7.5 7.5-3.5-3.5a.75.75 0 1 0-1.06 1.06l4.03 4.03a.75.75 0 0 0 1.06 0l8.03-8.03a.75.75 0 1 0-1.06-1.06z" fill="currentColor" />
                            </svg>
                          </span>
                        )}
                        <p className="truncate">
                          {group.lastMessage?.content ? (
                            <>
                              {!isLastMsgMine && group.lastMessage.senderName && (
                                <span className="font-medium text-slate-700">
                                  {group.lastMessage.senderName}:{' '}
                                </span>
                              )}
                              {group.lastMessage.content}
                            </>
                          ) : (
                            group.description || 'Tap to join discussion'
                          )}
                        </p>
                      </div>

                      {/* Clean Group Audience Pill */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] sm:text-[10px] font-medium px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-sm bg-slate-100 text-slate-600 border border-slate-200/80">
                          {group.targetAudience === 'all' ? 'All Students' : `${group.members?.length || 0} participants`}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* ── Right Panel (Chat Conversation Area) ── */}
        <section
          className={`${
            !showSidebar ? 'flex' : 'hidden'
          } md:flex flex-1 flex-col overflow-hidden relative bg-slate-50/70 min-w-0 w-full h-full`}
          style={{
            backgroundImage: `radial-gradient(#cbd5e1 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        >
          {activeGroup ? (
            <>
              {/* Chat Header / Multi-Select Mode Bar */}
              {isSelectionMode ? (
                <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shadow-2xs z-20 min-w-0 shrink-0">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSelectionMode(false);
                        setSelectedMsgIds([]);
                      }}
                      className="p-1.5 rounded-sm text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition-colors cursor-pointer"
                      title="Cancel selection"
                    >
                      <CloseIcon className="w-5 h-5 text-slate-700" />
                    </button>
                    <h2 className="text-slate-900 font-bold text-xs sm:text-sm">
                      {selectedMsgIds.length} Selected
                    </h2>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 shadow-xs transition-colors cursor-pointer"
                      title="Delete selected messages"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white border-b border-slate-200 flex items-center justify-between shadow-2xs z-20 min-w-0 shrink-0">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => setShowSidebar(true)}
                      className="md:hidden p-1.5 -ml-1 rounded-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0 flex items-center cursor-pointer"
                      title="Back to conversations"
                      aria-label="Back to conversations"
                    >
                      <ArrowLeftIcon className="w-5 h-5 text-slate-700" />
                    </button>

                    {/* Channel Avatar */}
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-sm bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-xs shrink-0">
                      {activeGroup.name[0]?.toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="text-slate-900 font-bold text-sm sm:text-base truncate leading-tight">
                        {activeGroup.name}
                      </h2>
                      {/* Participant Subtitle */}
                      <p className="text-[11px] sm:text-xs truncate leading-none mt-0.5 text-slate-500">
                        {typingUsers.length > 0 ? (
                          <span className="text-blue-600 font-medium animate-pulse">
                            {typingUsers.join(', ')} typing...
                          </span>
                        ) : (
                          <span>
                            {activeGroup.members && activeGroup.members.length > 0
                              ? activeGroup.members
                                  .map((m) => (m.usn === currentUsn || m.name === currentUserName ? 'You' : m.name))
                                  .slice(0, 4)
                                  .join(', ') +
                                (activeGroup.members.length > 4 ? `, +${activeGroup.members.length - 4}` : '')
                              : `${activeGroup.members?.length || 0} participants`}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-2">
                    {/* Add Participants Button (Lecturers only) */}
                    {!isStudent && (
                      <button
                        type="button"
                        onClick={openAddMembersModal}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 shadow-2xs transition-colors cursor-pointer"
                        title="Add participants to group"
                      >
                        <PlusIcon className="w-3.5 h-3.5 text-blue-600" />
                        <span className="hidden sm:inline">Add Participants</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowMembersDrawer((p) => !p)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                      title="Group details & participants"
                    >
                      <UsersIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                      <span className="hidden sm:inline">Details</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Messages Scroll Flow Area with Date Dividers */}
              <div className="flex-1 overflow-y-auto px-2.5 sm:px-6 py-2.5 sm:py-4 space-y-2.5 sm:space-y-3 min-w-0">
                {loadingMessages ? (
                  <div className="flex justify-center items-center h-full text-slate-500 text-xs sm:text-sm">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
                    Loading conversation...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 p-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-sm bg-white text-blue-600 border border-slate-200 flex items-center justify-center mb-2.5 shadow-2xs">
                      <SendIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-slate-900">No messages yet</p>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
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
                            <div className="flex justify-center my-2 sm:my-3 sticky top-1 sm:top-2 z-10 pointer-events-none">
                              <span className="bg-white/95 text-slate-600 text-[10px] sm:text-xs font-medium px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-sm shadow-2xs border border-slate-200 uppercase tracking-wide pointer-events-auto select-none">
                                {dateBadge}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-center my-1.5 sm:my-2">
                            <span className="bg-white/95 text-slate-600 text-[11px] sm:text-xs font-medium px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-sm shadow-2xs border border-slate-200">
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
                        {/* Centered Date Divider Pill */}
                        {isDifferentDay && (
                          <div className="flex justify-center my-2 sm:my-3 sticky top-1 sm:top-2 z-10 pointer-events-none">
                            <span className="bg-white/95 text-slate-600 text-[10px] sm:text-xs font-medium px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-sm shadow-2xs border border-slate-200 uppercase tracking-wide pointer-events-auto select-none">
                              {dateBadge}
                            </span>
                          </div>
                        )}

                        {/* Message Bubble Row */}
                        {(() => {
                          const isSelected = selectedMsgIds.includes(msg._id);
                          const isSwipingThis = swipingMsgId === msg._id;
                          const isDeletedForEveryone = Boolean(msg.isDeletedForEveryone);

                          return (
                            <div
                              id={`msg_${msg._id}`}
                              onTouchStart={(e) => handleTouchStart(e, msg)}
                              onTouchMove={(e) => handleTouchMove(e, msg)}
                              onTouchEnd={(e) => handleTouchEnd(e, msg)}
                              onMouseDown={() => handleMouseDown(msg)}
                              onMouseUp={handleMouseUp}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                setIsSelectionMode(true);
                                setSelectedMsgIds((prev) => (prev.includes(msg._id) ? prev : [...prev, msg._id]));
                              }}
                              onClick={() => handleMessageClick(msg)}
                              className={`relative flex items-center ${isMe ? 'justify-end' : 'justify-start'} w-full min-w-0 transition-colors select-none py-0.5 group ${
                                isSelected ? 'bg-blue-500/10 -mx-1.5 px-1.5 rounded-sm' : ''
                              }`}
                            >
                              {/* Multi-Select Checkbox Indicator */}
                              {isSelectionMode && (
                                <div className="mr-2 flex items-center justify-center shrink-0">
                                  <div
                                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded-sm border-2 flex items-center justify-center transition-colors ${
                                      isSelected
                                        ? 'bg-blue-600 border-blue-600 text-white'
                                        : 'border-slate-300 bg-white'
                                    }`}
                                  >
                                    {isSelected && <CheckIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />}
                                  </div>
                                </div>
                              )}

                              {/* Swipe-to-reply reveal curved icon */}
                              {isSwipingThis && swipeOffset > 8 && (
                                <div
                                  className="absolute left-1 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-sm bg-blue-100 text-blue-600 shadow-xs z-10"
                                  style={{ opacity: Math.min(swipeOffset / 30, 1) }}
                                >
                                  <ReplyIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </div>
                              )}

                              <div
                                style={{
                                  transform: isSwipingThis ? `translateX(${swipeOffset}px)` : 'none',
                                  transition: isSwipingThis ? 'none' : 'transform 0.18s ease-out',
                                }}
                                className={`relative max-w-[85%] sm:max-w-[70%] min-w-0 ${
                                  isDeletedForEveryone ? 'py-1.5 px-3' : 'p-2.5 sm:p-3.5'
                                } shadow-xs text-sm sm:text-[14px] leading-normal sm:leading-relaxed break-words [overflow-wrap:anywhere] [word-break:break-word] rounded-sm overflow-hidden ${
                                  isDeletedForEveryone
                                    ? 'bg-slate-100 text-slate-500 border border-slate-200/90 shadow-2xs'
                                    : isMe
                                    ? 'bg-blue-600 text-white shadow-blue-500/10'
                                    : 'bg-white text-slate-900 border border-slate-200/90 shadow-2xs'
                                }`}
                              >
                                {/* Quoted Reply Block (WhatsApp Style) */}
                                {msg.replyTo && msg.replyTo.senderName && !isDeletedForEveryone && (
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (msg.replyTo.messageId) {
                                        const target = document.getElementById(`msg_${msg.replyTo.messageId}`);
                                        if (target) {
                                          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                          target.classList.add('ring-2', 'ring-blue-400');
                                          setTimeout(() => target.classList.remove('ring-2', 'ring-blue-400'), 1500);
                                        }
                                      }
                                    }}
                                    className={`mb-1.5 p-1.5 sm:p-2 rounded-sm border-l-4 text-xs cursor-pointer select-none transition-opacity hover:opacity-90 ${
                                      isMe
                                        ? 'bg-blue-700/60 border-sky-300 text-blue-50'
                                        : 'bg-slate-100 border-blue-600 text-slate-700'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1 mb-0.5">
                                      <ReplyIcon className="w-2.5 h-2.5 shrink-0 opacity-80" />
                                      <span className={`font-bold text-[10px] sm:text-[11px] truncate ${isMe ? 'text-sky-200' : 'text-blue-600'}`}>
                                        {msg.replyTo.senderName}
                                      </span>
                                    </div>
                                    <p className="truncate text-[10px] sm:text-[11px] opacity-90 pl-3.5">
                                      {msg.replyTo.content || msg.replyTo.fileName || 'Attachment'}
                                    </p>
                                  </div>
                                )}

                                {/* Sender Name in Incoming Bubble */}
                                {!isMe && !isDeletedForEveryone && (
                                  <div className="flex items-center gap-1.5 mb-1 px-0.5 min-w-0">
                                    <span className={`text-[11px] sm:text-xs font-bold truncate flex-1 min-w-0 ${msg.sender?.role === 'lecture' ? 'text-indigo-600' : 'text-blue-600'}`}>
                                      {msg.sender?.name || 'User'}
                                    </span>
                                    <span
                                      className={`text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider shrink-0 ${
                                        msg.sender?.role === 'lecture'
                                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
                                          : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                                      }`}
                                    >
                                      {msg.sender?.role === 'lecture' ? 'Lecturer' : 'Student'}
                                    </span>
                                  </div>
                                )}

                                {/* Deleted For Everyone Notice */}
                                {isDeletedForEveryone ? (
                                  <div className="flex items-center gap-1.5 italic text-xs py-0.5 text-slate-500">
                                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                                    <span>This message was deleted</span>
                                  </div>
                                ) : (
                                  <>
                                    {/* Media Attachments */}
                                    {fileObj && fileUrl && (
                                      <div className="mb-1.5 sm:mb-2 w-full max-w-full min-w-0 overflow-hidden">
                                        {/* Image Attachment with Lightbox & Download */}
                                        {isImage && (
                                          <div className="w-full max-w-full min-w-0 overflow-hidden">
                                            <div
                                              onClick={(e) => {
                                                if (isSelectionMode) return;
                                                setPreviewModalImage({ url: fileUrl, fileName: fileObj.fileName || 'image.png' });
                                              }}
                                              className="rounded-sm overflow-hidden border border-slate-200/80 cursor-pointer shadow-2xs hover:opacity-95 transition-all group relative bg-slate-100 max-w-full"
                                            >
                                              <img
                                                src={fileUrl}
                                                alt={fileObj.fileName || 'Attached Image'}
                                                className="max-h-48 sm:max-h-80 w-full object-cover rounded-sm transition-transform duration-200 group-hover:scale-[1.01]"
                                                loading="lazy"
                                              />
                                              <div className="absolute inset-0 bg-slate-900/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 gap-2">
                                                <span className="bg-slate-900/85 text-white text-[10px] sm:text-xs px-2.5 py-1 rounded-sm font-medium backdrop-blur-xs flex items-center gap-1 shadow-md">
                                                  <SearchIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Enlarge
                                                </span>
                                                <button
                                                  type="button"
                                                  onClick={(e) => downloadFile(fileObj, e)}
                                                  className="p-1 rounded-sm text-slate-700 hover:text-blue-600 transition-colors cursor-pointer flex items-center justify-center active:scale-90"
                                                  title={`Download ${fileObj.fileName || 'image'}`}
                                                  aria-label="Download image"
                                                >
                                                  <DownloadIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                </button>
                                              </div>
                                            </div>
                                            <div className={`flex items-center justify-between text-[10px] sm:text-xs mt-1 px-0.5 gap-2 min-w-0 ${isMe ? 'text-blue-100' : 'text-slate-500'}`}>
                                              <span className="truncate flex-1 min-w-0 font-medium">{fileObj.fileName}</span>
                                              <div className="flex items-center gap-1 shrink-0">
                                                {fileObj.fileSize && <span className="opacity-80">{fileObj.fileSize}</span>}
                                                <button
                                                  type="button"
                                                  onClick={(e) => downloadFile(fileObj, e)}
                                                  className={`p-0.5 rounded-sm transition-colors cursor-pointer flex items-center justify-center ${isMe ? 'hover:bg-white/20 text-white' : 'hover:bg-slate-100 text-slate-600'}`}
                                                  title={`Download ${fileObj.fileName || 'image'}`}
                                                  aria-label="Download image"
                                                >
                                                  <DownloadIcon className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5" />
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        )}

                                        {/* Video Attachment */}
                                        {isVideo && (
                                          <div className="rounded-sm overflow-hidden border border-slate-200 bg-black shadow-xs w-full max-w-full min-w-0">
                                            <video
                                              src={fileUrl}
                                              controls
                                              className="max-h-60 sm:max-h-72 w-full"
                                            />
                                            {fileObj.fileName && (
                                              <div className="flex items-center justify-between text-[10px] sm:text-xs p-1.5 text-slate-300 gap-2 min-w-0">
                                                <span className="truncate flex-1 min-w-0">{fileObj.fileName}</span>
                                                <button
                                                  type="button"
                                                  onClick={(e) => downloadFile(fileObj, e)}
                                                  className="p-1 rounded-sm hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center justify-center shrink-0"
                                                  title={`Download ${fileObj.fileName || 'video'}`}
                                                  aria-label="Download video"
                                                >
                                                  <DownloadIcon className="w-3.5 h-3.5" />
                                                </button>
                                              </div>
                                            )}
                                          </div>
                                        )}

                                        {/* Document / PDF Card */}
                                        {(isPdf || isDoc) && (
                                          <div
                                            className={`flex items-center gap-2 p-2 sm:p-2.5 rounded-sm border transition-all w-full max-w-full min-w-0 overflow-hidden ${
                                              isMe
                                                ? 'bg-blue-700/60 border-blue-500/60 text-white'
                                                : 'bg-slate-50 border-slate-200 text-slate-900'
                                            }`}
                                          >
                                            <div className={`p-1.5 rounded-sm shrink-0 ${
                                              isMe
                                                ? 'bg-white/15 text-white border border-white/20'
                                                : (isPdf ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-blue-50 text-blue-600 border border-blue-200')
                                            }`}>
                                              <FileIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center gap-1.5 min-w-0">
                                                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm shrink-0 ${
                                                  isMe
                                                    ? 'bg-white/20 text-white'
                                                    : (isPdf ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700')
                                                }`}>
                                                  {isPdf ? 'PDF' : 'DOC'}
                                                </span>
                                                <p className={`text-xs sm:text-sm font-semibold truncate ${isMe ? 'text-white' : 'text-slate-900'}`}>
                                                  {fileObj.fileName || (isPdf ? 'Document.pdf' : 'Attachment')}
                                                </p>
                                              </div>
                                              <p className={`text-[10px] mt-0.5 truncate ${isMe ? 'text-blue-100' : 'text-slate-500'}`}>
                                                {fileObj.fileSize || 'Document File'}
                                              </p>
                                            </div>

                                            <div className="flex items-center gap-1.5 shrink-0 ml-1">
                                              {/* In-App PDF Reader Modal */}
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
                                                  className={`p-1.5 flex items-center justify-center transition-colors cursor-pointer ${
                                                    isMe
                                                      ? 'text-white/80 hover:text-white'
                                                      : 'text-slate-500 hover:text-blue-600'
                                                  }`}
                                                  title="Preview PDF"
                                                  aria-label="Preview PDF"
                                                >
                                                  <EyeIcon className="w-3.5 h-3.5" />
                                                </button>
                                              )}

                                              {/* Download Button */}
                                              <button
                                                type="button"
                                                onClick={(e) => downloadFile(fileObj, e)}
                                                className={`p-1.5 flex items-center justify-center transition-colors cursor-pointer ${
                                                  isMe
                                                    ? 'text-white/80 hover:text-white'
                                                    : 'text-slate-500 hover:text-blue-600'
                                                }`}
                                                title={`Download ${fileObj.fileName || 'file'}`}
                                                aria-label="Download file"
                                              >
                                                <DownloadIcon className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {/* Message Text */}
                                    {hasUserText && (
                                      <div className={`whitespace-pre-wrap break-words [overflow-wrap:anywhere] [word-break:break-word] text-sm sm:text-[14px] leading-relaxed ${isMe ? 'text-white' : 'text-slate-900'}`}>
                                        {msg.content}
                                      </div>
                                    )}
                                  </>
                                )}

                                {/* Timestamp & Status Icons - Securely contained inside bubble */}
                                <div className={`flex items-center justify-end gap-1 mt-1 pt-0.5 text-[10px] sm:text-[11px] select-none ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                                  <span>{formatTime(msg.createdAt)}</span>
                                  {isMe && !isDeletedForEveryone && <MessageTicks message={msg} currentUsn={currentUsn} isMe={true} />}
                                </div>
                              </div>

                              {/* Desktop Hover Quick Actions (Reply & Delete) */}
                              {!isSelectionMode && !isDeletedForEveryone && (
                                <div
                                  className={`opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-all self-center shrink-0 ${
                                    isMe ? 'mr-1 order-first' : 'ml-1'
                                  }`}
                                >
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setReplyingTo(msg);
                                    }}
                                    className="p-1 rounded-sm hover:bg-slate-200/80 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                                    title="Reply"
                                  >
                                    <ReplyIcon className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedMsgIds([msg._id]);
                                      setShowDeleteModal(true);
                                    }}
                                    className="p-1 rounded-sm hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                    title="Delete message"
                                  >
                                    <TrashIcon className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </React.Fragment>
                    );
                  })
                )}

                {/* Live Typing Indicator */}
                {typingUsers.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 py-0.5 px-1">
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                    <span className="text-[11px] sm:text-xs">{typingUsers.join(', ')} typing...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* ── Input Bar ── */}
              <div className="p-2.5 sm:p-3 bg-white border-t border-slate-200 shadow-xs z-20 shrink-0 w-full">
                {/* WhatsApp Style Reply Preview Bar */}
                {replyingTo && (
                  <div className="mb-2 bg-slate-50 border border-slate-200 border-l-4 border-l-blue-600 p-2 sm:p-2.5 rounded-sm shadow-xs flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-7 h-7 rounded-sm bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <ReplyIcon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-blue-600 truncate">
                          Replying to {replyingTo.sender?.name || 'User'}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {replyingTo.content || replyingTo.file?.fileName || 'Attachment'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReplyingTo(null)}
                      className="text-slate-400 hover:text-slate-700 p-1 rounded-sm hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
                      title="Cancel reply"
                    >
                      <CloseIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {/* Pending Attachment Card & Sender Live Preview */}
                {selectedFile && (
                  <div className="mb-2 bg-slate-50 border border-slate-200 p-2 sm:p-2.5 rounded-sm shadow-xs">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span
                          className={`p-1.5 rounded-sm shrink-0 ${
                            selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf')
                              ? 'bg-rose-50 text-rose-600 border border-rose-200'
                              : 'bg-blue-50 text-blue-600 border border-blue-200'
                          }`}
                        >
                          <FileIcon className="w-4 h-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{selectedFile.name}</p>
                          <p className="text-[10px] sm:text-xs text-slate-500">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Ready to send
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* PDF Sender Controls */}
                        {(selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf')) && (
                          <button
                            type="button"
                            onClick={() =>
                              setPdfModalPreview({
                                url: selectedFilePreviewUrl,
                                title: selectedFile.name,
                              })
                            }
                            className="px-2.5 py-1 rounded-sm text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-2xs transition-colors cursor-pointer"
                            title="Preview PDF"
                          >
                            Preview
                          </button>
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
                              className="w-8 h-8 rounded-sm object-cover border border-slate-300 shadow-2xs"
                            />
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="text-slate-400 hover:text-slate-700 p-1 rounded-sm hover:bg-slate-200 transition-colors cursor-pointer"
                          title="Remove attachment"
                        >
                          <CloseIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
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

                  {/* Attachment Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-sm text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer shrink-0 active:scale-95 disabled:opacity-50 flex items-center justify-center"
                    title="Attach File"
                  >
                    <PaperclipIcon className="w-5 h-5" />
                  </button>

                  {/* Text Input Pill - Increased height and generous left padding for cursor */}
                  <div className="flex-1 min-w-0 bg-slate-50 rounded-sm px-3.5 sm:px-4 py-2 sm:py-2.5 min-h-[40px] sm:min-h-[44px] flex items-center border border-slate-200 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all shadow-2xs">
                    <input
                      type="text"
                      value={input}
                      onChange={handleInputChange}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                      placeholder={selectedFile ? 'Add caption…' : 'Type a message...'}
                      disabled={isUploading}
                      className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none border-none p-0 pl-1"
                    />
                  </div>

                  {/* Send Button */}
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={(!input.trim() && !selectedFile) || isUploading}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-sm font-bold shadow-xs transition-all cursor-pointer flex items-center justify-center shrink-0 active:scale-95 ${
                      input.trim() || selectedFile
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    }`}
                    title="Send Message"
                  >
                    {isUploading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <SendIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 p-4 sm:p-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-sm bg-white text-blue-600 border border-slate-200 flex items-center justify-center mb-2.5 shadow-xs">
                <UsersIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Discussion Channels</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 max-w-sm mt-0.5">
                Select a channel from the left panel to join discussions and share study resources.
              </p>
            </div>
          )}
        </section>

        {/* ── Slide-Over Group Info Drawer ── */}
        {showMembersDrawer && activeGroup && (
          <aside className="w-full sm:w-88 bg-white border-l border-slate-200 flex flex-col shadow-2xl absolute right-0 top-0 bottom-0 z-30">
            <div className="px-4 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-slate-900 font-bold text-sm sm:text-base">Group Info</h3>
                <p className="text-slate-500 text-xs">{activeGroup.members?.length || 0} participants</p>
              </div>
              <button
                type="button"
                onClick={() => setShowMembersDrawer(false)}
                className="p-1.5 rounded-sm text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Close"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 border-b border-slate-100 bg-white text-center">
              <div className="w-14 h-14 rounded-sm bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xl mx-auto mb-2.5 shadow-xs">
                {activeGroup.name[0]?.toUpperCase()}
              </div>
              <h4 className="text-slate-900 font-bold text-base">{activeGroup.name}</h4>
              {activeGroup.description && (
                <p className="text-slate-500 text-xs mt-1">{activeGroup.description}</p>
              )}
              <p className="mt-1.5 text-xs text-slate-400">
                Created by <span className="font-semibold text-slate-700">{activeGroup.createdBy?.name || 'Lecturer'}</span>
              </p>
            </div>

            {/* Filter Member Input */}
            <div className="p-3 border-b border-slate-100">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-sm px-3 py-1.5 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
                <SearchIcon className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Search participants..."
                  className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none border-none p-0"
                />
              </div>
            </div>

            {!isStudent && (
              <div className="p-3 border-b border-slate-100 bg-slate-50/60">
                <button
                  type="button"
                  onClick={openAddMembersModal}
                  className="w-full h-10 px-3.5 rounded-sm bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <PlusIcon className="w-4 h-4 text-white" />
                  <span>Add Participants</span>
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-3 divide-y divide-slate-100">
              {filteredMembers.map((member) => (
                <div
                  key={member.usn}
                  className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-sm transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-sm bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center text-xs font-bold shrink-0">
                      {member.name[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">{member.name}</p>
                        {member.role === 'lecture' && (
                          <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200/60 px-1.5 py-0.5 rounded-sm font-bold">
                            Lecturer
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 truncate">{member.usn}</p>
                    </div>
                  </div>

                  {!isStudent && member.role === 'student' && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStudent(member.usn, member.name)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-sm transition-colors cursor-pointer"
                      title="Remove student from group"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-slate-50 space-y-2.5">
              <button
                type="button"
                onClick={handleLeaveGroup}
                className="w-full h-12 px-4 rounded-sm text-sm sm:text-base font-semibold text-red-600 bg-white hover:bg-red-50 border border-red-200 transition-colors cursor-pointer shadow-2xs flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Leave Group</span>
              </button>

              {!isStudent && (
                <button
                  type="button"
                  onClick={() => setShowDeleteGroupModal(true)}
                  className="w-full h-12 px-4 rounded-sm text-sm sm:text-base font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer shadow-2xs flex items-center justify-center gap-2"
                >
                  <TrashIcon className="w-5 h-5 text-white" />
                  <span>Delete Group</span>
                </button>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* ── Modal: New Group (Clean, Compact & Sleek) ── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-sm border border-slate-200 shadow-2xl w-[90%] sm:w-full max-w-[340px] sm:max-w-[360px] overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="px-4 py-3 border-b border-slate-200 bg-white flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Create New Group
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-sm text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Close"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateGroup} className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {/* Group Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Channel Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="e.g. CS601 - Database Engineering"
                  className="w-full px-3 py-2 rounded-sm text-xs sm:text-sm font-medium border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 focus:outline-none transition-all shadow-2xs"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={createDesc}
                  onChange={(e) => setCreateDesc(e.target.value)}
                  placeholder="Brief note about this channel..."
                  className="w-full px-3 py-2 rounded-sm text-xs sm:text-sm font-medium border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 focus:outline-none transition-all shadow-2xs"
                />
              </div>

              {/* Audience Choice Buttons */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Audience
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCreateAudience('all')}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-sm border text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                      createAudience === 'all'
                        ? 'bg-blue-50 border-blue-600 text-blue-700 font-semibold shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <UsersIcon className="w-4 h-4 shrink-0" />
                    <span>All Students</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreateAudience('selected')}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-sm border text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                      createAudience === 'selected'
                        ? 'bg-blue-50 border-blue-600 text-blue-700 font-semibold shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <TargetIcon className="w-4 h-4 shrink-0" />
                    <span>Select Students</span>
                  </button>
                </div>
              </div>

              {/* ── Registered Students Roster (Click-to-Select) ── */}
              {createAudience === 'selected' && (
                <div className="p-3 bg-slate-50 rounded-sm border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
                    <span className="text-xs font-semibold text-slate-700">
                      Roster ({selectedStudentUsns.length}/{availableStudents.length})
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={selectAllStudents}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                      >
                        Select All
                      </button>
                      <span className="text-slate-300 text-xs">|</span>
                      <button
                        type="button"
                        onClick={clearSelectedStudents}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-700 hover:underline cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Filter by Name */}
                  <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-sm px-2.5 py-1.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
                    <SearchIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={studentNameFilter}
                      onChange={(e) => setStudentNameFilter(e.target.value)}
                      placeholder="Filter by student name or USN..."
                      className="w-full bg-transparent text-xs text-slate-800 placeholder:text-slate-400 outline-none border-none p-0"
                    />
                    {studentNameFilter && (
                      <button
                        type="button"
                        onClick={() => setStudentNameFilter('')}
                        className="text-slate-400 hover:text-slate-600 shrink-0 p-0.5 cursor-pointer"
                        title="Clear filter"
                      >
                        <CloseIcon className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Student Cards List */}
                  <div className="max-h-44 overflow-y-auto pr-0.5 space-y-1">
                    {loadingStudents ? (
                      <div className="py-6 text-center text-slate-400 text-xs">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-1.5" />
                        Loading student records...
                      </div>
                    ) : filteredAvailableStudents.length === 0 ? (
                      <div className="py-6 text-center text-slate-400 text-xs">
                        No registered students found.
                      </div>
                    ) : (
                      filteredAvailableStudents.map((st) => {
                        const isSelected = selectedStudentUsns.includes(st.usn);
                        return (
                          <div
                            key={st.usn}
                            onClick={() => toggleStudentSelection(st.usn)}
                            className={`flex items-center justify-between py-1.5 px-2.5 rounded-sm border text-xs cursor-pointer transition-all select-none ${
                              isSelected
                                ? 'bg-blue-50 border-blue-500 text-slate-900 shadow-2xs'
                                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <div
                                className={`w-6 h-6 rounded-sm flex items-center justify-center font-bold text-[11px] shrink-0 ${
                                  isSelected
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {st.username[0]?.toUpperCase()}
                              </div>

                              <div className="min-w-0">
                                <p className={`font-semibold text-xs truncate ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                                  {st.username}
                                </p>
                                <p className="text-[10px] font-mono text-slate-400 truncate">
                                  {st.usn}
                                </p>
                              </div>
                            </div>

                            {/* Checkmark Box */}
                            <div
                              className={`w-4 h-4 rounded-sm flex items-center justify-center shrink-0 transition-all ${
                                isSelected
                                  ? 'bg-blue-600 text-white'
                                  : 'border border-slate-300 text-transparent'
                              }`}
                            >
                              <CheckIcon className="w-3 h-3" />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-2 rounded-sm text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingGroup}
                  className="px-4 py-2 rounded-sm text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  {isCreatingGroup && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>Create Channel</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Image Lightbox Modal with Direct Download ── */}
      {previewModalImage && (
        <div
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewModalImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={typeof previewModalImage === 'string' ? previewModalImage : previewModalImage.url}
              alt="Expanded Preview"
              className="max-h-[82vh] max-w-full rounded-sm object-contain shadow-2xl"
            />
            
            <div className="mt-3 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() =>
                  downloadFile({
                    fileName: typeof previewModalImage === 'string' ? 'image.png' : (previewModalImage.fileName || 'image.png'),
                    fileUrl: typeof previewModalImage === 'string' ? previewModalImage : previewModalImage.url,
                  })
                }
                className="px-3.5 py-1.5 rounded-sm bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer active:scale-95"
                title="Download image"
              >
                <DownloadIcon className="w-4 h-4" />
                <span>Download Image</span>
              </button>

              <button
                onClick={() => setPreviewModalImage(null)}
                className="p-1.5 rounded-sm bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
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
            className="bg-white rounded-sm border border-slate-300 shadow-2xl w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-3 border-b border-slate-800 bg-slate-900 text-white flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-1.5 rounded-sm bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
                  <FileIcon className="w-4 h-4 sm:w-5 sm:h-5" />
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

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    downloadFile({
                      fileName: pdfModalPreview.title || 'document.pdf',
                      fileUrl: pdfModalPreview.url,
                    })
                  }
                  className="px-3 py-1.5 rounded-sm bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-medium text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  title="Download PDF"
                >
                  <DownloadIcon className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPdfModalPreview(null)}
                  className="p-1.5 rounded-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
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
            className="bg-white rounded-sm border border-slate-200 shadow-xl w-[88%] sm:w-full max-w-[320px] sm:max-w-[340px] overflow-hidden p-5 sm:p-6 text-center transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning Exit Icon */}
            <div className="w-10 h-10 rounded-sm bg-rose-50 text-rose-600 border border-rose-200/80 flex items-center justify-center mx-auto mb-3 shadow-2xs">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              Leave &ldquo;{activeGroup.name}&rdquo;?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-5">
              You will no longer receive new messages, announcements, or shared resources from this channel. You can rejoin only if the lecturer adds you back.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowLeaveModal(false)}
                disabled={isLeavingGroup}
                className="flex-1 h-11 sm:h-12 px-4 rounded-sm text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer flex items-center justify-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmLeaveGroup}
                disabled={isLeavingGroup}
                className="flex-1 h-11 sm:h-12 px-4 rounded-sm text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
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
            className="bg-white rounded-sm border border-slate-200 shadow-xl w-[88%] sm:w-full max-w-[320px] sm:max-w-[340px] overflow-hidden p-5 sm:p-6 text-center transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-10 rounded-sm bg-red-50 text-red-600 border border-red-100 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <TrashIcon className="w-5 h-5" />
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              Remove {studentToRemove.name}?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-5">
              Student <span className="font-mono font-semibold text-slate-800">({studentToRemove.usn})</span> will be removed from <span className="font-semibold text-slate-800">&ldquo;{activeGroup.name}&rdquo;</span> and will lose access to this conversation.
            </p>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setStudentToRemove(null)}
                disabled={isRemovingStudent}
                className="flex-1 h-11 sm:h-12 px-3.5 rounded-sm text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer flex items-center justify-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRemoveStudent}
                disabled={isRemovingStudent}
                className="flex-1 h-11 sm:h-12 px-3.5 rounded-sm text-xs sm:text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:scale-95 transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
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

      {/* ── WhatsApp-Style Delete Messages Modal (Delete for Me / Delete for Everyone) ── */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => !isDeletingMessages && setShowDeleteModal(false)}
        >
          <div
            className="bg-white rounded-sm border border-slate-200 shadow-xl w-[88%] sm:w-full max-w-[310px] sm:max-w-[330px] overflow-hidden p-5 sm:p-6 text-center transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-10 rounded-sm bg-rose-50 text-rose-600 border border-rose-200/80 flex items-center justify-center mx-auto mb-3 shadow-2xs">
              <TrashIcon className="w-5 h-5" />
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              Delete {selectedMsgIds.length} {selectedMsgIds.length === 1 ? 'Message' : 'Messages'}?
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Choose how you want to remove the selected message(s).
            </p>

            <div className="space-y-2">
              {canDeleteForEveryone && (
                <button
                  type="button"
                  disabled={isDeletingMessages}
                  onClick={() => handleDeleteMessages('for_everyone')}
                  className="w-full h-10 px-3 rounded-sm text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  {isDeletingMessages ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Delete for everyone</span>
                  )}
                </button>
              )}

              <button
                type="button"
                disabled={isDeletingMessages}
                onClick={() => handleDeleteMessages('for_me')}
                className="w-full h-10 px-3 rounded-sm text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Delete for me</span>
              </button>

              {!canDeleteForEveryone && (
                <p className="text-[11px] text-slate-400 italic">
                  Note: &ldquo;Delete for everyone&rdquo; is only available when all selected messages were sent by you.
                </p>
              )}

              <button
                type="button"
                disabled={isDeletingMessages}
                onClick={() => setShowDeleteModal(false)}
                className="w-full h-9 px-3 rounded-sm text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer mt-1 flex items-center justify-center"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Members to Existing Group Modal (Lecturer - Clean & Compact) ── */}
      {showAddMembersModal && activeGroup && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={() => !isAddingMembers && setShowAddMembersModal(false)}
        >
          <div
            className="bg-white rounded-sm border border-slate-200 shadow-xl w-[90%] sm:w-full max-w-[340px] sm:max-w-[360px] overflow-hidden flex flex-col max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-200 bg-white flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                  Add Participants
                </h3>
                <p className="text-xs text-slate-500 truncate">
                  {activeGroup.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddMembersModal(false)}
                disabled={isAddingMembers}
                className="p-1 rounded-sm text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                title="Close"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-3.5 flex-1 overflow-y-auto space-y-2.5">
              {/* Search & Selection Controls */}
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-sm px-2.5 py-1.5 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
                  <SearchIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={addMemberSearch}
                    onChange={(e) => setAddMemberSearch(e.target.value)}
                    placeholder="Search name or USN..."
                    className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none border-none p-0"
                  />
                  {addMemberSearch && (
                    <button
                      type="button"
                      onClick={() => setAddMemberSearch('')}
                      className="text-slate-400 hover:text-slate-600 shrink-0 p-0.5 cursor-pointer"
                      title="Clear search"
                    >
                      <CloseIcon className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAddUsns(filteredNonMembers.map((s) => s.usn))}
                  className="px-2.5 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-sm transition-colors cursor-pointer shrink-0"
                >
                  Select All
                </button>
                {selectedAddUsns.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedAddUsns([])}
                    className="px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 border border-slate-200 rounded-sm transition-colors cursor-pointer shrink-0"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Status counter */}
              <div className="text-[11px] text-slate-500 flex items-center justify-between px-0.5">
                <span>{filteredNonMembers.length} available</span>
                <span className="font-semibold text-blue-600">
                  {selectedAddUsns.length} selected
                </span>
              </div>

              {/* Students List */}
              {loadingNonMembers ? (
                <div className="py-8 flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span>Loading available students...</span>
                </div>
              ) : filteredNonMembers.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  {nonMemberStudents.length === 0
                    ? 'All registered students are already members.'
                    : 'No matching students found.'}
                </div>
              ) : (
                <div className="border border-slate-200 rounded-sm overflow-hidden divide-y divide-slate-100 max-h-52 overflow-y-auto">
                  {filteredNonMembers.map((student) => {
                    const isChecked = selectedAddUsns.includes(student.usn);
                    return (
                      <label
                        key={student.usn}
                        className={`flex items-center justify-between py-2 px-2.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                          isChecked ? 'bg-blue-50/60' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedAddUsns((prev) =>
                                prev.includes(student.usn)
                                  ? prev.filter((id) => id !== student.usn)
                                  : [...prev, student.usn]
                              );
                            }}
                            className="w-4 h-4 text-blue-600 rounded-2xs border-slate-300 focus:ring-blue-500 cursor-pointer"
                          />
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                              {student.username}
                            </p>
                            <p className="text-[11px] font-mono text-slate-400 truncate">
                              {student.usn}
                            </p>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddMembersModal(false)}
                disabled={isAddingMembers}
                className="py-1.5 px-3 rounded-sm text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAddMembers}
                disabled={isAddingMembers || selectedAddUsns.length === 0}
                className="py-1.5 px-3.5 rounded-sm text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                {isAddingMembers ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <span>Add {selectedAddUsns.length > 0 ? `(${selectedAddUsns.length}) ` : ''}Participants</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Group Confirmation Modal (Lecturer) ── */}
      {showDeleteGroupModal && activeGroup && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => !isDeletingGroup && setShowDeleteGroupModal(false)}
        >
          <div
            className="bg-white rounded-sm border border-slate-200 shadow-xl w-[88%] sm:w-full max-w-[320px] sm:max-w-[340px] overflow-hidden p-5 sm:p-6 text-center transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-10 rounded-sm bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <TrashIcon className="w-5 h-5" />
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              Delete Group &ldquo;{activeGroup.name}&rdquo;?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-5">
              This will permanently delete this discussion group and all its messages, shared files, and history for everyone. This action cannot be reversed.
            </p>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowDeleteGroupModal(false)}
                disabled={isDeletingGroup}
                className="flex-1 h-11 sm:h-12 px-3.5 rounded-sm text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer flex items-center justify-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteGroup}
                disabled={isDeletingGroup}
                className="flex-1 h-11 sm:h-12 px-3.5 rounded-sm text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                {isDeletingGroup ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Delete Group</span>
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
