import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api';
import PageWrapper from '../components/PageWrapper';
import './Chat.css';

const Chat = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editContent, setEditContent] = useState('');
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchRoom();
  }, [username]);

  useEffect(() => {
    let interval;
    if (room) {
      fetchMessages();
      interval = setInterval(fetchMessages, 3000); // simple polling
    }
    return () => clearInterval(interval);
  }, [room]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchRoom = async () => {
    try {
      const res = await API.get(`chat/room/${username}/`);
      setRoom(res.data);
    } catch (err) {
      console.error(err);
      alert("Unable to open secure channel.");
      navigate('/messages');
    }
  };

  const fetchMessages = async () => {
    if (!room) return;
    try {
      const res = await API.get(`chat/messages/${room.id}/`);
      setMessages(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !room) return;
    try {
      const res = await API.post(`chat/messages/${room.id}/`, { content: newMessage });
      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  const submitEdit = async (id) => {
    if (!editContent.trim()) return;
    try {
      const res = await API.put(`chat/messages/detail/${id}/`, { content: editContent });
      setMessages(messages.map(m => m.id === id ? res.data : m));
      setEditingMsgId(null);
    } catch (err) {
      console.error(err);
      alert('Failed to edit message');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await API.delete(`chat/messages/detail/${id}/`);
      setMessages(messages.filter(m => m.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete message');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <PageWrapper>
      <div className="chat-glass-wrapper">
        <motion.div 
          className="chat-glass-container"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          {loading && !room ? (
            <div className="chat-glass-loading">
              <motion.div 
                className="spinner"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              />
              <p>Establishing Secure Link...</p>
            </div>
          ) : (
            <>
              {/* Sidebar / Directory (Optional, keeping minimal) */}
              <div className="chat-glass-sidebar">
                <div className="sidebar-header">
                  <h2>Directory</h2>
                </div>
                <div className="sidebar-list">
                  <motion.div 
                    className="sidebar-item active"
                    whileHover={{ x: 5 }}
                  >
                    <div className="sidebar-avatar">{username.charAt(0).toUpperCase()}</div>
                    <div className="sidebar-info">
                      <h4>{username}</h4>
                      <span className="status">Connected</span>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Main Chat Area */}
              <div className="chat-glass-main">
                <div className="chat-glass-header">
                  <div className="header-user-info">
                    <div className="header-avatar">{username.charAt(0).toUpperCase()}</div>
                    <div className="header-text-block">
                      <h3>{username}</h3>
                      <p className="encryption-status">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0110 0v4" />
                        </svg>
                        End-to-End Encrypted
                      </p>
                    </div>
                  </div>
                  <button className="close-btn" onClick={() => navigate('/messages')}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="chat-glass-messages">
                  <AnimatePresence initial={false}>
                    {messages.map((msg, index) => {
                      const isMe = msg.sender_username !== username;
                      const isEditing = editingMsgId === msg.id;

                      return (
                        <motion.div 
                          key={msg.id || index} 
                          className={`message-row-glass ${isMe ? 'me' : 'them'}`}
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="message-avatar-glass">
                            {msg.sender_profile_picture ? (
                              <img src={msg.sender_profile_picture} alt={msg.sender_username} />
                            ) : (
                              msg.sender_username.charAt(0).toUpperCase()
                            )}
                          </div>

                          <div className={`message-wrapper-glass ${isMe ? 'me' : 'them'}`}>
                            {isEditing ? (
                              <div className="edit-message-area">
                                <input 
                                  value={editContent} 
                                  onChange={(e) => setEditContent(e.target.value)}
                                  onKeyDown={(e) => { if(e.key === 'Enter') submitEdit(msg.id); }}
                                  autoFocus
                                />
                                <button onClick={() => submitEdit(msg.id)}>Save</button>
                                <button onClick={() => setEditingMsgId(null)}>Cancel</button>
                              </div>
                            ) : (
                              <div className="message-bubble-glass">
                                {msg.content}
                                {msg.is_edited && <span className="edited-tag">(edited)</span>}

                                {isMe && (
                                  <div className="message-actions">
                                    <button onClick={() => { setEditingMsgId(msg.id); setEditContent(msg.content); }}>✏️</button>
                                    <button onClick={() => handleDelete(msg.id)}>🗑️</button>
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="message-time-glass">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>
                
                <form className="chat-glass-input-area" onSubmit={sendMessage}>
                  <div className="input-wrapper">
                    <input 
                      type="text" 
                      placeholder="Transmit message..." 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <div className="input-glow"></div>
                  </div>
                  <motion.button 
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </motion.button>
                </form>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </PageWrapper>
  );
};

export default Chat;
