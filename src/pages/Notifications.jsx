import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api";
import PageWrapper from "../components/PageWrapper";
import "./Notifications.css";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

function Notifications() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await API.get("users/follow-requests/");
      const data = res.data.results ? res.data.results : res.data;
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (reqId, action) => {
    try {
      await API.post(`users/follow-request/${reqId}/${action}/`);
      setRequests(requests.filter(req => req.id !== reqId));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <PageWrapper><div className="notif-loading"><div className="notif-spinner"></div></div></PageWrapper>;
  }

  return (
    <PageWrapper>
      <div className="notif-container">
        
        <motion.div className="notif-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1>Alerts & Notifications</h1>
          <p>Manage your incoming network connections.</p>
        </motion.div>

        <div className="notif-content">
          {requests.length === 0 ? (
            <motion.div className="notif-empty" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="empty-icon">🔔</div>
              <h3>You're all caught up!</h3>
              <p>No pending follow requests right now.</p>
            </motion.div>
          ) : (
            <motion.div className="notif-grid" variants={containerVariants} initial="hidden" animate="show">
              <AnimatePresence>
                {requests.map((req) => (
                  <motion.div key={req.id} variants={itemVariants} exit={{ opacity: 0, scale: 0.8 }} className="notif-card">
                    <div className="notif-body">
                      <div className="notif-avatar">
                        {req.sender_username.charAt(0).toUpperCase()}
                      </div>
                      <div className="notif-info">
                        <h3 onClick={() => navigate(`/profile/${req.sender_username}`)}>
                          @{req.sender_username}
                        </h3>
                        <p>Requested to follow your profile</p>
                      </div>
                    </div>
                    <div className="notif-actions">
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="notif-btn accept" onClick={() => handleAction(req.id, "accept")}>
                        Accept
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="notif-btn reject" onClick={() => handleAction(req.id, "reject")}>
                        Decline
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}

export default Notifications;
