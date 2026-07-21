import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api";
import PageWrapper from "../components/PageWrapper";
import "./PublicProfile.css";

function PublicProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [activeTab, setActiveTab] = useState("posts");
  const [followStatus, setFollowStatus] = useState("follow");
  const [isOwner, setIsOwner] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [userShowcases, setUserShowcases] = useState([]);
  const [userPosts, setUserPosts] = useState([]);

  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, [username]);

  const fetchProfileData = async () => {
    setLoading(true);
    setError(null);
    try {
      let currentUsername = username;
      if (username) {
        const res = await API.get(`users/public-profile/${username}/`);
        setProfile(res.data);
        if (res.data.is_following) setFollowStatus("following");
        else if (res.data.is_follow_requested) setFollowStatus("pending");
        else setFollowStatus("follow");
        setIsOwner(false);
      } else {
        const res = await API.get("users/profile/");
        const ownerData = res.data;
        currentUsername = ownerData.username;
        setIsOwner(true);
        try {
          const publicRes = await API.get(`users/public-profile/${ownerData.username}/`);
          setProfile({ ...ownerData, ...publicRes.data });
        } catch (e) {
          setProfile(ownerData);
        }
        
        setFormData({
          username: ownerData.username || "", bio: ownerData.bio || "", city: ownerData.city || "",
          profile_picture: ownerData.profile_picture || null, skills_offered: ownerData.skills_offered || "",
          skills_wanted: ownerData.skills_wanted || "", experience_level: ownerData.experience_level || "beginner",
          availability: ownerData.availability || "weekends", phone: ownerData.phone || "",
          linkedin_url: ownerData.linkedin_url || "", portfolio_url: ownerData.portfolio_url || "",
          languages: ownerData.languages || "", hourly_rate: ownerData.hourly_rate || "",
          years_of_experience: ownerData.years_of_experience || ""
        });
      }
      
      // Fetch user showcases and posts
      try {
        let allSkills = [];
        let nextUrl = 'skills/all/';
        while (nextUrl) {
          const skillsRes = await API.get(nextUrl);
          const skillsData = skillsRes.data.results !== undefined ? skillsRes.data.results : skillsRes.data;
          allSkills = [...allSkills, ...(Array.isArray(skillsData) ? skillsData : [])];
          if (skillsRes.data.next) {
            const urlObj = new URL(skillsRes.data.next);
            nextUrl = urlObj.pathname.replace('/api/', '') + urlObj.search;
          } else {
            nextUrl = null;
          }
        }
        
        const userVideoSkills = allSkills.filter(s => typeof s.video === 'string' && s.video && (s.owner_username === currentUsername || s.owner === currentUsername));
        const userImageSkills = allSkills.filter(s => typeof s.image === 'string' && s.image && (s.owner_username === currentUsername || s.owner === currentUsername));
        setUserShowcases(userVideoSkills);
        setUserPosts(userImageSkills);
        
        setProfile(prev => ({ ...prev, posts_count: allSkills.filter(s => s.owner_username === currentUsername || s.owner === currentUsername).length }));
      } catch (err) {
        console.error("Error fetching user content", err);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("User profile not found");
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      const res = await API.post(`users/follow/${username}/`);
      if (res.status === 201 || res.status === 200) setFollowStatus("pending");
    } catch (err) {
      if (err.response?.data?.error === "Already following") setFollowStatus("following");
      else if (err.response?.data?.message === "Request already sent") setFollowStatus("pending");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'profile_picture' && formData[key] !== null) submitData.append(key, formData[key]);
      });
      if (formData.profile_picture instanceof File) submitData.append("profile_picture", formData.profile_picture);
      
      const res = await API.put("users/profile/", submitData);
      setProfile({ ...profile, ...res.data });
      setIsEditing(false);
    } catch (error) {
      alert("Error updating profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <PageWrapper><div className="prof-loading"><div className="prof-spinner"></div></div></PageWrapper>;
  if (error) return <PageWrapper><div className="prof-error"><h2>{error}</h2><button onClick={() => navigate("/all-skills")}>Go Back</button></div></PageWrapper>;

  const skillsOffered = profile.skills_offered ? profile.skills_offered.split(',').map(s=>s.trim()).filter(Boolean) : [];
  
  // Animation variants
  const staggerContainer = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariant = { hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } };

  return (
    <PageWrapper className="prof-page-wrapper">
      <div className="prof-cover-image">
        <div className="prof-cover-gradient"></div>
      </div>

      <div className="prof-container">
        
        {/* Profile Header */}
        <motion.div className="prof-header-card" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", damping: 20 }}>
          <div className="prof-avatar-wrapper">
            <img src={profile.profile_picture || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} alt="avatar" />
          </div>
          
          <div className="prof-info-block">
            <div className="prof-title-row">
              <h1>{profile.username}</h1>
              <div className="prof-actions">
                {isOwner ? (
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="prof-btn primary" onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? "Cancel Editing" : "Edit Profile"}
                  </motion.button>
                ) : (
                  <>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`prof-btn ${followStatus === 'follow' ? 'primary' : 'outline'}`} onClick={followStatus === 'follow' ? handleFollow : undefined}>
                      {followStatus === 'follow' ? 'Follow' : followStatus === 'pending' ? 'Requested' : 'Following'}
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="prof-btn outline" onClick={() => navigate(`/chat/${username}`)}>Message</motion.button>
                  </>
                )}
                <motion.button 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }} 
                  className="prof-btn outline" 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Profile link copied to clipboard!");
                  }}
                  style={{ marginLeft: '8px' }}
                >
                  🔗 Share
                </motion.button>
              </div>
            </div>
            
            <div className="prof-stats-row">
              <div className="prof-stat"><strong>{profile.posts_count || 0}</strong> <span>Contributions</span></div>
              <div className="prof-stat"><strong>{profile.followers_count || 0}</strong> <span>Followers</span></div>
              <div className="prof-stat"><strong>{profile.following_count || 0}</strong> <span>Following</span></div>
            </div>
            
            <p className="prof-bio">{profile.bio || "No bio provided yet."}</p>
            
            <div className="prof-tags">
              {skillsOffered.map((s, i) => <span key={i} className="prof-tag">{s}</span>)}
            </div>
          </div>
        </motion.div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div key="editor" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="prof-edit-section">
              <h3>Profile Configuration</h3>
              <form onSubmit={handleSubmit} className="prof-form">
                <div className="prof-form-grid">
                  <div className="form-group">
                    <label>Profile Picture</label>
                    <input type="file" onChange={(e) => setFormData({...formData, profile_picture: e.target.files[0]})} />
                  </div>
                  <div className="form-group">
                    <label>Bio</label>
                    <textarea value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} rows={1}></textarea>
                  </div>
                  <div className="form-group">
                    <label>Skills Offered (Comma separated)</label>
                    <input type="text" value={formData.skills_offered} onChange={(e) => setFormData({...formData, skills_offered: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>City</label>
                    <input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
                  </div>
                </div>
                <div className="prof-form-footer">
                  <button type="submit" className="prof-btn primary" disabled={isSaving}>{isSaving ? "Saving..." : "Save Changes"}</button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div key="portfolio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              
              <div className="prof-tabs">
                {['posts', 'showcase'].map(tab => (
                  <button key={tab} className={`prof-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                    {tab.toUpperCase()}
                    {activeTab === tab && <motion.div layoutId="tab-indicator" className="prof-tab-indicator" />}
                  </button>
                ))}
              </div>

              <motion.div className="prof-content-grid" variants={staggerContainer} initial="hidden" animate="show">
                {activeTab === 'posts' && userPosts.map(skill => (
                  <motion.div key={skill.id} variants={itemVariant} className="prof-grid-item" onClick={() => navigate(`/skills/${skill.id}`)}>
                    <img src={skill.image.startsWith('http') ? skill.image : `http://localhost:8000${skill.image}`} alt={skill.title} />
                    <div className="prof-item-overlay"><span>{skill.title}</span></div>
                  </motion.div>
                ))}

                {activeTab === 'showcase' && userShowcases.map(skill => (
                  <motion.div key={skill.id} variants={itemVariant} className="prof-grid-item" onClick={() => navigate(`/skills/${skill.id}`)}>
                    <video src={skill.video.startsWith('http') ? skill.video : `http://localhost:8000${skill.video}`} muted onMouseEnter={e => e.target.play()} onMouseLeave={e => {e.target.pause(); e.target.currentTime = 0;}} />
                    <div className="prof-item-overlay"><span>{skill.title}</span></div>
                  </motion.div>
                ))}

                {(activeTab === 'posts' && userPosts.length === 0) || (activeTab === 'showcase' && userShowcases.length === 0) ? (
                  <div className="prof-empty-state">No content to display in this section.</div>
                ) : null}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </PageWrapper>
  );
}

export default PublicProfile;
