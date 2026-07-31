import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api";
import PageWrapper from "../components/PageWrapper";
import "./Dashboard.css";

// Stagger animation variants for children
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

function Dashboard() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [skills, setSkills] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    title: "", description: "", category: "", level: "beginner", city: "", image: null, video: null
  });

  const fetchDashboard = async () => {
    try {
      const res = await API.get("skills/dashboard/");
      setData(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchSkills = async () => {
    try {
      const res = await API.get("skills/");
      setSkills(res.data.results || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      navigate("/login");
    } else {
      fetchDashboard();
      fetchSkills();
    }
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    const submitData = new FormData();
    submitData.append("title", formData.title);
    submitData.append("description", formData.description);
    submitData.append("category", formData.category);
    submitData.append("level", formData.level);
    submitData.append("city", formData.city);

    if (formData.image) submitData.append("image", formData.image);
    if (formData.video) submitData.append("video", formData.video);

    try {
      if (editingId) {
        await API.patch(`skills/${editingId}/`, submitData, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        await API.post("skills/", submitData, { headers: { "Content-Type": "multipart/form-data" } });
      }

      fetchSkills();
      fetchDashboard();
      
      setEditingId(null);
      setShowForm(false);
      setFormData({ title: "", description: "", category: "", level: "beginner", city: "", image: null, video: null });
    } catch (err) {
      console.log("Error details:", err.response?.data || err.message);
      alert(err.response?.data?.detail || "Operation Failed. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  const deleteSkill = async (id) => {
    try {
      await API.delete(`skills/${id}/`);
      fetchSkills();
      fetchDashboard();
    } catch (err) {
      console.log(err);
    }
  };

  const editSkill = (skill) => {
    setEditingId(skill.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setFormData({
      title: skill.title, description: skill.description, category: skill.category, level: skill.level || 'beginner',
      city: skill.city, image: null, video: null
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowForm(false);
    setFormData({ title: "", description: "", category: "", level: "beginner", city: "", image: null, video: null });
  };

  if (!data) return (
    <PageWrapper>
      <div className="dash-loading"><div className="dash-spinner"></div><p>Syncing Data...</p></div>
    </PageWrapper>
  );

  return (
    <PageWrapper>
      <div className="dash-container">
        {/* Header */}
        <motion.div className="dash-header" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <div>
            <h1 className="dash-title">Command Center</h1>
            <p className="dash-subtitle">Overview of your skill exchange empire.</p>
          </div>
          <div className="dash-header-actions">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate("/owner-requests")} className="dash-btn outline">Received Requests</motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate("/my-requests")} className="dash-btn outline">Sent Requests</motion.button>
            <motion.button whileHover={{ scale: 1.05, boxShadow: "0px 0px 15px rgba(56, 189, 248, 0.6)" }} whileTap={{ scale: 0.95 }} onClick={() => {setShowForm(!showForm); setEditingId(null);}} className="dash-btn primary">
              {showForm ? "Close Form" : "+ Create Skill"}
            </motion.button>
          </div>
        </motion.div>

        {/* Form Modal / Dropdown */}
        <AnimatePresence>
          {showForm && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: "auto" }} 
              exit={{ opacity: 0, height: 0 }}
              className="dash-form-wrapper"
            >
              <div className="dash-form-card">
                <h3>{editingId ? "✨ Edit Your Skill" : "✨ Forge a New Skill"}</h3>
                <p style={{textAlign: "center", color: "#94a3b8", marginBottom: "30px", marginTop: "-20px"}}>
                  {editingId ? "Update your offering to the network." : "Share your expertise with the network."}
                </p>
                <form onSubmit={handleSubmit} className="dash-form">
                  <div className="dash-input-group">
                    <div className="dash-field">
                      <label>Skill Title</label>
                      <input type="text" name="title" placeholder="e.g. Advanced React Architecture" value={formData.title} onChange={handleChange} required />
                    </div>
                    <div className="dash-field">
                      <label>Category</label>
                      <input type="text" name="category" placeholder="e.g. Programming" value={formData.category} onChange={handleChange} required />
                    </div>
                  </div>
                  
                  <div className="dash-input-group">
                    <div className="dash-field">
                      <label>Proficiency Level</label>
                      <select name="level" value={formData.level} onChange={handleChange} className="dash-select" required>
                        <option value="beginner">🌱 Beginner</option>
                        <option value="intermediate">🚀 Intermediate</option>
                        <option value="advanced">🔥 Advanced</option>
                        <option value="expert">💎 Expert</option>
                      </select>
                    </div>
                    <div className="dash-field">
                      <label>Location</label>
                      <input type="text" name="city" placeholder="e.g. Remote / New York" value={formData.city} onChange={handleChange} required />
                    </div>
                  </div>

                  <div className="dash-field">
                    <label>Skill Description</label>
                    <textarea name="description" placeholder="Describe what you will teach, do, or build for others in detail..." value={formData.description} onChange={handleChange} required rows="4"></textarea>
                  </div>
                  
                  <div className="dash-input-group" style={{marginTop: "10px"}}>
                    <label className="dash-file-upload">
                      <span>🖼️ Cover Image</span>
                      <small>{formData.image ? formData.image.name : "Click to browse or drag and drop"}</small>
                      <input type="file" name="image" onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })} />
                    </label>
                    <label className="dash-file-upload">
                      <span>🎥 Showcase Video</span>
                      <small>{formData.video ? formData.video.name : "Upload a 15-60s highlight reel (Max 1 min, 30MB)"}</small>
                      <input type="file" name="video" accept="video/*" onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          if (file.size > 30 * 1024 * 1024) {
                            alert("Video file size must be less than 30MB.");
                            e.target.value = "";
                            setFormData({ ...formData, video: null });
                            return;
                          }
                          // Fallback timer for mobile browsers where onloadedmetadata might not fire
                          let metadataLoaded = false;
                          const video = document.createElement('video');
                          video.preload = 'metadata';
                          
                          const handleSuccess = () => {
                            if (metadataLoaded) return;
                            metadataLoaded = true;
                            window.URL.revokeObjectURL(video.src);
                            if (video.duration > 60) {
                              alert("Video duration must be 1 minute or less.");
                              e.target.value = "";
                              setFormData({ ...formData, video: null });
                            } else {
                              setFormData({ ...formData, video: file });
                            }
                          };

                          video.onloadedmetadata = handleSuccess;
                          video.src = URL.createObjectURL(file);
                          
                          // Force load for iOS
                          video.load();

                          // If metadata doesn't load within 1.5 seconds (e.g. mobile Safari blocking it), 
                          // safely accept the file anyway rather than silently dropping it.
                          setTimeout(() => {
                            if (!metadataLoaded) {
                              metadataLoaded = true;
                              window.URL.revokeObjectURL(video.src);
                              setFormData({ ...formData, video: file });
                              console.warn("Video metadata load timed out, accepting file bypass.");
                            }
                          }, 1500);

                        } else {
                          setFormData({ ...formData, video: null });
                        }
                      }} />
                    </label>
                  </div>

                  <div className="dash-form-actions">
                    {editingId && <button type="button" className="dash-btn cancel" onClick={cancelEdit}>Cancel</button>}
                    <button type="submit" className="dash-btn primary submit-btn" disabled={loading}>
                      {loading ? "Processing..." : (editingId ? "Update Skill ➔" : "Publish Skill ➔")}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Grid */}
        <motion.div className="dash-stats-grid" variants={containerVariants} initial="hidden" animate="show">
          {[
            { label: "Active Skills", value: data.total_skills, icon: "⚡" },
            { label: "Requests Received", value: data.total_requests, icon: "📥" },
            { label: "Requests Sent", value: data.total_requests_sent, icon: "📤" },
            { label: "Accepted Deals", value: data.accepted_requests, icon: "🤝" },
            { label: "Rejected Deals", value: data.rejected_requests, icon: "🚫" },
            { label: "Global Rating", value: `${data.average_rating} ⭐`, icon: "🏆" }
          ].map((stat, i) => (
            <motion.div key={i} variants={itemVariants} whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }} className="dash-stat-card">
              <div className="dash-stat-icon">{stat.icon}</div>
              <div className="dash-stat-info">
                <h4>{stat.label}</h4>
                <p>{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Visualizations */}
        <motion.div className="dash-viz-row" variants={containerVariants} initial="hidden" animate="show">
          <motion.div variants={itemVariants} className="dash-viz-card">
            <h3>Conversion Rate</h3>
            <div className="dash-ring-container">
              <div className="dash-ring" style={{ '--progress': `${(data.accepted_requests / (data.total_requests || 1)) * 100}%` }}>
                <div className="dash-ring-inner">
                  <h2>{Math.round((data.accepted_requests / (data.total_requests || 1)) * 100)}%</h2>
                  <span>Accepted</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="dash-viz-card">
            <h3>Performance Metrics</h3>
            <div className="dash-bar-container">
              <div className="dash-bar-item">
                <div className="dash-bar-label"><span>Rating</span><span>{data.average_rating}/5</span></div>
                <div className="dash-bar-track"><motion.div initial={{width:0}} animate={{width: `${(data.average_rating / 5) * 100}%`}} transition={{duration:1, delay:0.5}} className="dash-bar-fill blue"></motion.div></div>
              </div>
              <div className="dash-bar-item">
                <div className="dash-bar-label"><span>Success Rate</span><span>{Math.round((data.accepted_requests / (data.total_requests_sent || 1)) * 100)}%</span></div>
                <div className="dash-bar-track"><motion.div initial={{width:0}} animate={{width: `${(data.accepted_requests / (data.total_requests_sent || 1)) * 100}%`}} transition={{duration:1, delay:0.7}} className="dash-bar-fill purple"></motion.div></div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Skills List */}
        <motion.div className="dash-skills-section" initial={{opacity:0}} animate={{opacity:1}} transition={{delay: 0.5}}>
          <div className="dash-skills-header">
            <h3>Your Arsenal ({skills.length})</h3>
            <button className="dash-btn text-only" onClick={() => navigate("/all-skills")}>Browse All Skills ➔</button>
          </div>
          
          <div className="dash-skills-grid">
            {skills.length === 0 ? (
              <div className="dash-empty-state">No skills forged yet. Click "+ Create Skill" to begin.</div>
            ) : (
              skills.map((skill) => (
                <motion.div key={skill.id} whileHover={{ y: -8, scale: 1.02 }} className="dash-skill-card">
                  <div className="dash-skill-media">
                    {skill.image ? <img src={skill.image.startsWith('http') ? skill.image : `https://skillswap-app-wj2a.onrender.com${skill.image}`} alt={skill.title} /> : <div className="dash-media-placeholder">No Image</div>}
                    <div className="dash-skill-category">{skill.category} • {skill.level}</div>
                  </div>
                  <div className="dash-skill-content">
                    <h4>{skill.title}</h4>
                    <p className="dash-skill-desc">{skill.description.substring(0, 80)}...</p>
                    <div className="dash-skill-footer">
                      <span className="dash-skill-city">📍 {skill.city}</span>
                      <div className="dash-skill-actions">
                        <button onClick={() => editSkill(skill)}>Edit</button>
                        <button className="delete" onClick={() => deleteSkill(skill.id)}>Delete</button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

      </div>
    </PageWrapper>
  );
}

export default Dashboard;