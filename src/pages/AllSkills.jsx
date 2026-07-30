import { useEffect, useState } from "react"
import StarRating from "../components/StarRating"
import API from "../api"
import { useNavigate, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import PageWrapper from "../components/PageWrapper"
import "./AllSkills.css"
function AllSkills() {

  const [skills, setSkills] = useState([])
  const [level, setLevel] = useState("")
  const navigate = useNavigate()
  const location = useLocation()

  // Get username (optional)
  const currentUser = localStorage.getItem("username")

  // Extract query params
  const queryParams = new URLSearchParams(location.search)
  const searchQuery = queryParams.get("search") || ""
  const categoryQuery = queryParams.get("category") || ""

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  useEffect(() => {
    fetchSkills()
  }, [location.search, level])

  // ✅ Fetch all skills
  const fetchSkills = async () => {
    try {
      let url = "skills/all/"
      const params = new URLSearchParams()

      if (searchQuery) params.append("search", searchQuery)
      if (categoryQuery) params.append("category", categoryQuery)
      if (level) params.append("level", level)

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const res = await API.get(url)
      const data = res.data.results || res.data;
      setSkills(Array.isArray(data) ? data : [])

    } catch (err) {
      console.log(err)
    }
  }

  const [requestingId, setRequestingId] = useState(null)

  // Get User ID from localStorage
  const currentUserId = localStorage.getItem("userId")

  // ✅ Request Skill (As per Gemini instruction)
  const requestSkill = async (skillId) => {
    const token = localStorage.getItem("access")
    if (!token) {
      alert("Please login to request a skill! ⚠️")
      navigate("/login")
      return
    }

    setRequestingId(skillId)
    try {
      await API.post("requests/", {
        skillId: skillId,
        requesterId: currentUserId
      })
      alert("Request Sent Successfully! ✅")
      fetchSkills() // 🔄 Update the UI status
    } catch (error) {
      console.error("Request Error:", error.response?.data)
      const errorMsg = error.response?.data?.detail || 
                       (error.response?.data?.non_field_errors && error.response.data.non_field_errors[0]) ||
                       "Request Failed ❌"
      alert(errorMsg)
    } finally {
      setRequestingId(null)
    }
  }

  return (
    <PageWrapper>
      <div className="skills-page">
        {/* Hero Section */}
        <section className="skills-hero">
          <div className="container">
            <h1 className="hero-title">
              {searchQuery
                ? `Search Results for "${searchQuery}"`
                : categoryQuery
                  ? `${categoryQuery} Skills`
                  : "Explore All Skills"}
            </h1>
            <p className="hero-subtitle">
              Discover new passions and connect with experts across the globe.
            </p>
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
               <select value={level} onChange={(e) => setLevel(e.target.value)} style={{ padding: '10px 20px', borderRadius: '12px', background: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid rgba(0, 240, 255, 0.3)', outline: 'none', fontFamily: 'var(--font-future)' }}>
                  <option value="" style={{background: '#1a1b3c'}}>All Levels</option>
                  <option value="beginner" style={{background: '#1a1b3c'}}>Beginner</option>
                  <option value="intermediate" style={{background: '#1a1b3c'}}>Intermediate</option>
                  <option value="advanced" style={{background: '#1a1b3c'}}>Advanced</option>
                  <option value="expert" style={{background: '#1a1b3c'}}>Expert</option>
               </select>
            </div>
          </div>
        </section>

        {/* Skills Container */}
        <div className="container">
          <motion.div 
            className="skills-container"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {skills.length > 0 ? (
              skills.map((skill) => (
                <motion.div 
                  key={skill.id || skill._id} 
                  className="skill-card"
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                
                {/* Image Section */}
                <div className="skill-image-container">
                  {skill.image ? (
                    <img 
                      src={skill.image.startsWith('http') ? skill.image : `https://skillswap-app-wj2a.onrender.com${skill.image}`} 
                      alt={skill.title} 
                      className="skill-image" 
                    />
                  ) : (
                    <div className="skill-image-placeholder">No Image Available</div>
                  )}
                  <div className="skill-category-badge">{skill.category} • {skill.level 
                    ? skill.level.charAt(0).toUpperCase() + skill.level.slice(1) 
                    : 'Beginner'}</div>
                </div>

                {/* Content Section */}
                <div className="skill-card-content">
                  <h3 className="skill-card-title" onClick={() => navigate(`/skills/${skill.id || skill._id}`)}>
                    {skill.title}
                  </h3>
                  <p className="skill-desc">{skill.description?.slice(0, 100)}...</p>

                  <div className="skill-meta">
                    <div className="meta-item">📍 {skill.city}</div>
                    <div className="meta-item owner-link-premium" 
                         onClick={(e) => {
                           e.stopPropagation();
                           navigate(`/profile/${skill.owner_username || skill.owner}`);
                         }} 
                         style={{ cursor: "pointer", color: "#38bdf8", fontWeight: "bold" }}>
                      👤 @{skill.owner_username || skill.owner}
                    </div>
                  </div>

                  <div className="rating-row">
                    <StarRating rating={skill.average_rating} />
                    <span className="rating-text">({skill.average_rating || 0})</span>
                  </div>

                  {skill.owner !== currentUser && String(skill.owner_id || skill.ownerId) !== String(currentUserId) && (
                    <div className="request-action-wrapper">
                      <button 
                        className={`request-skill-btn ${skill.request_status ? 'status-' + skill.request_status : ''}`}
                        onClick={() => !skill.request_status && requestSkill(skill.id || skill._id)}
                        disabled={requestingId === (skill.id || skill._id) || !!skill.request_status}
                      >
                        {requestingId === (skill.id || skill._id) 
                          ? "Requesting..." 
                          : skill.request_status 
                            ? skill.request_status.charAt(0).toUpperCase() + skill.request_status.slice(1)
                            : "Request Skill"}
                      </button>
                      {!skill.request_status && <span style={{fontSize: '12px', color: '#FFD700', marginTop: '4px', display: 'block', textAlign: 'center'}}>🪙 Costs 1 Skill Coin</span>}
                    </div>
                  )}
                </div>
                </motion.div>
              ))
            ) : (
              <div className="no-skills">
                <h3>No skills found</h3>
                <button className="browse-all-btn" onClick={() => navigate("/all-skills")}>Clear Filters</button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default AllSkills