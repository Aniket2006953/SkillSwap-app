import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api";
import PageWrapper from "../components/PageWrapper";
import "./Workspace.css";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

function Workspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [requestData, setRequestData] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");

  useEffect(() => {
    fetchWorkspaceData();
  }, [id]);

  const fetchWorkspaceData = async () => {
    try {
      const res = await API.get(`skills/request/${id}/`);
      setRequestData(res.data);
      setMilestones(res.data.milestones || []);
    } catch (err) {
      console.log(err);
      alert("Error loading workspace.");
      navigate("/dashboard");
    }
  };

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;
    try {
      const res = await API.post(`skills/requests/${id}/milestones/`, { title: newMilestoneTitle });
      setMilestones([...milestones, res.data]);
      setNewMilestoneTitle("");
    } catch (err) {
      console.log(err);
      alert("Error adding milestone");
    }
  };

  const toggleMilestone = async (milestoneId, currentStatus) => {
    try {
      const res = await API.patch(`skills/milestones/${milestoneId}/`, { is_completed: !currentStatus });
      setMilestones(milestones.map(m => m.id === milestoneId ? res.data : m));
    } catch (err) {
      console.log(err);
    }
  };

  if (!requestData) return <PageWrapper><div className="workspace-loading"><div className="workspace-spinner"></div></div></PageWrapper>;

  const jitsiUrl = requestData.meeting?.meeting_url;
  const roomName = jitsiUrl ? jitsiUrl.split('meet.jit.si/')[1] : null;

  return (
    <PageWrapper>
      <div className="workspace-container">
        
        <motion.div className="workspace-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="header-info">
            <h2>Command Center: <span>{requestData.skill_title}</span></h2>
            <div className="participants-badge">
              <span className="p-icon">👥</span>
              <strong>@{requestData.skill_owner}</strong> & <strong>@{requestData.requester_username}</strong>
            </div>
          </div>
        </motion.div>

        <div className="workspace-layout">
          
          {/* Left Side: Video Call */}
          <motion.div className="workspace-video-section" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <div className="video-header">
              <h3><span className="live-dot"></span> Live Virtual Classroom</h3>
              {requestData.meeting && (
                <span className="meeting-time">
                  📅 {new Date(requestData.meeting.scheduled_time).toLocaleString()}
                </span>
              )}
            </div>

            <div className="video-frame-container">
              {roomName ? (
                <iframe
                  allow="camera; microphone; display-capture; fullscreen"
                  src={`https://meet.jit.si/${roomName}#userInfo.displayName="${localStorage.getItem('username')}"`}
                  style={{ height: '100%', width: '100%', border: '0px' }}
                ></iframe>
              ) : (
                <div className="no-video">
                  <div className="no-vid-icon">🎥</div>
                  <p>No meeting link generated yet. Please ensure the request is fully accepted by the owner.</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right Side: Milestones */}
          <motion.div className="workspace-sidebar" variants={containerVariants} initial="hidden" animate="show">
            <h3><span className="sidebar-icon">📋</span> Progress Syllabus</h3>
            
            <div className="milestones-list">
              <AnimatePresence>
                {milestones.length === 0 ? (
                  <motion.p className="no-milestones" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>No milestones forged yet. Add your first goal below!</motion.p>
                ) : (
                  milestones.map(m => (
                    <motion.div key={m.id} variants={itemVariants} className={`milestone-item ${m.is_completed ? 'completed' : ''}`}>
                      <label className="checkbox-container">
                        <input type="checkbox" checked={m.is_completed} onChange={() => toggleMilestone(m.id, m.is_completed)} />
                        <span className="checkmark"></span>
                      </label>
                      <span className="milestone-title">{m.title}</span>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            <form className="add-milestone-form" onSubmit={handleAddMilestone}>
              <input 
                type="text" 
                placeholder="e.g. Learn Basic Guitar Chords..." 
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
              />
              <button type="submit" disabled={!newMilestoneTitle.trim()}>+</button>
            </form>

          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default Workspace;
