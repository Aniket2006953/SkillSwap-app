import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api';
import PageWrapper from '../components/PageWrapper';
import './Messages.css';

const Messages = () => {
  const [rooms, setRooms] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([fetchRooms(), fetchAllUsers()]).finally(() => setLoading(false));
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await API.get('chat/rooms/');
      setRooms(res.data);
    } catch (err) {
      console.error('Error fetching chat rooms', err);
      setRooms([]);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await API.get('users/all/');
      const data = res.data.results ?? res.data;
      setAllUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching users', err);
      setAllUsers([]);
    }
  };

  const handleMessage = (username) => {
    navigate(`/chat/${username}`);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (days < 7) return date.toLocaleDateString([], { weekday: 'short' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const filteredUsers = allUsers.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageWrapper>
      <div className="messages-glass-container">
        {loading ? (
          <div className="messages-loading">
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="glass-loader"
            />
            <p>Decrypting Comms...</p>
          </div>
        ) : (
          <motion.div 
            className="messages-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="messages-header-glass">
              <h1>Nexus Communications</h1>
              <div className="glass-search">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Scan directory..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="people-section-glass">
              <h2 className="glass-section-title">Active Operatives</h2>
              <div className="people-scroll-glass">
                {filteredUsers.length === 0 ? (
                  <p className="no-people-glass">No operatives found.</p>
                ) : (
                  filteredUsers.map((user, idx) => (
                    <motion.div 
                      key={user.username} 
                      className="person-card-glass"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                    >
                      <div className="person-avatar-wrap-glass">
                        {user.profile_picture ? (
                          <img src={user.profile_picture} alt={user.username} className="person-avatar-glass" />
                        ) : (
                          <div className="person-avatar-placeholder-glass">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="online-indicator-pulse"></span>
                      </div>
                      <span className="person-name-glass">{user.username}</span>
                      {user.city && <span className="person-city-glass">{user.city}</span>}
                      <motion.button
                        className="msg-btn-glass"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleMessage(user.username)}
                      >
                        Initiate Link
                      </motion.button>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            <div className="inbox-section-glass">
              <h2 className="glass-section-title">Secure Channels</h2>
              <div className="inbox-container-glass">
                {rooms.length === 0 ? (
                  <div className="empty-inbox-glass">
                    <div className="empty-icon-glass">📡</div>
                    <h3>No Active Channels</h3>
                    <p>Select an operative to establish a secure link.</p>
                  </div>
                ) : (
                  <div className="conversations-list-glass">
                    <AnimatePresence>
                      {rooms.map((room, idx) => (
                        <motion.div
                          key={room.id}
                          className="conversation-item-glass"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
                          onClick={() => navigate(`/chat/${room.other_user?.username}`)}
                        >
                          <div className="conversation-avatar-glass">
                            {room.other_user?.profile_picture ? (
                              <img src={room.other_user.profile_picture} alt={room.other_user.username} />
                            ) : (
                              <div className="avatar-placeholder-glass">
                                {room.other_user?.username?.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="conversation-info-glass">
                            <div className="info-top-glass">
                              <span className="user-name-glass">{room.other_user?.username}</span>
                              <span className="last-time-glass">
                                {formatTime(room.last_message?.timestamp || room.created_at)}
                              </span>
                            </div>
                            <div className="info-bottom-glass">
                              <p className="last-message-glass">
                                {room.last_message ? room.last_message.content : 'Channel established. Ready for transmission.'}
                              </p>
                            </div>
                          </div>
                          <div className="item-arrow-glass">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M9 18l6-6-6-6" />
                            </svg>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </PageWrapper>
  );
};

export default Messages;