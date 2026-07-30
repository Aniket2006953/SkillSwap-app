import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import API from "../api"
import StarRating from "../components/StarRating"
import PageWrapper from "../components/PageWrapper"
import "./SkillDetail.css"

function SkillDetail() {

  const { id } = useParams()
  const navigate = useNavigate()

  const [skill, setSkill] = useState(null)
  const [reviews, setReviews] = useState([])
  const [sortOrder, setSortOrder] = useState("-created_at")

  const [rating,setRating] = useState(5)
  const [comment,setComment] = useState("")
  
  const currentUser = localStorage.getItem("username")

  useEffect(()=>{
    fetchSkill()
  },[id])

  useEffect(() => {
    fetchReviews()
  }, [id, sortOrder])

  const fetchSkill = async()=>{
    try{
      const res = await API.get(`skills/${id}/`)
      setSkill(res.data.results || res.data)
    }
    catch(error){
      console.log(error)
    }
  }

  const fetchReviews = async()=>{
    try{
      const res = await API.get(`skills/reviews/${id}/?ordering=${sortOrder}`)
      setReviews(res.data.results || res.data)
    }
    catch(error){
      console.log("review not found yet")
    }
  }

  // ⭐ Submit Review
  const submitReview = async (e) => {
    e.preventDefault()
    try {
      await API.post(`skills/review/`, {
        skill: id,
        rating: rating,
        comment: comment
      })
      alert("Review Submitted ✅")
      setRating(5)
      setComment("")
      fetchReviews()
    } catch (error) {
      console.log(error.response?.data)
      alert("Review Failed ❌")
    }
  }
  
  const deleteReview = async (reviewId) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await API.delete(`skills/review-detail/${reviewId}/`);
      fetchReviews();
    } catch (err) {
      console.log(err);
      alert("Failed to delete review");
    }
  }

  const handleReport = async () => {
    const reason = prompt("Please provide a reason for reporting this skill:");
    if (!reason) return;
    try {
      await API.post('skills/report/', {
        skill: id,
        reason: reason
      });
      alert("Report submitted successfully.");
    } catch (err) {
      console.log(err);
      alert("Failed to submit report.");
    }
  }

  if(!skill) return (
      <PageWrapper>
          <div className="skill-detail-container loading-container">
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                className="loading-text"
              >
                  Loading...
              </motion.p>
          </div>
      </PageWrapper>
  )

  return (
    <PageWrapper>
      <div className="skill-detail-container">

        {/* Skill Card */}
        <motion.div 
          className="skill-detail-card glass-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >

          {skill.image && (
            <motion.img
              src={skill.image.startsWith('http') ? skill.image : `https://skillswap-app-wj2a.onrender.com${skill.image}`}
              alt={skill.title}
              className="skill-detail-img"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            />
          )}

          <div className="skill-content-header">
            <h2>{skill.title}</h2>
            {/* ⭐ Average Rating */}
            <div className="avg-rating-badge">
              <span className="star-icon">⭐</span>
              <span className="rating-value">{skill.average_rating || "New"}</span>
            </div>
          </div>

          <p className="desc">{skill.description}</p>

          <div className="meta">
            <motion.span 
              className="owner-badge" 
              onClick={() => navigate(`/profile/${skill.owner}`)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              @{skill.owner_username || skill.owner}
            </motion.span>
            <span className="meta-tag">{skill.category}</span>
            <span className="meta-tag">{skill.city}</span>
            {skill.level && <span className="meta-tag" style={{color: '#00F0FF'}}>{skill.level}</span>}
          </div>
          
          <div className="skill-actions-row" style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
             <button onClick={handleReport} style={{ background: 'rgba(255,50,50,0.1)', color: '#ff4444', border: '1px solid rgba(255,50,50,0.3)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit' }}>
                🚩 Report Skill
             </button>
          </div>

        </motion.div>

        <div className="bottom-section">
            {/* Review Form */}
            <motion.div 
              className="review-form-card glass-panel"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3>Share Your Experience</h3>
              <form onSubmit={submitReview} className="sleek-form">
                
                <div className="input-group">
                    <label>Rating</label>
                    <div className="select-wrapper">
                        <select
                          value={rating}
                          onChange={(e)=>setRating(e.target.value)}
                        >
                          <option value="5">⭐⭐⭐⭐⭐ Excellent (5)</option>
                          <option value="4">⭐⭐⭐⭐ Good (4)</option>
                          <option value="3">⭐⭐⭐ Average (3)</option>
                          <option value="2">⭐⭐ Poor (2)</option>
                          <option value="1">⭐ Terrible (1)</option>
                        </select>
                    </div>
                </div>

                <div className="input-group">
                    <label>Comment</label>
                    <textarea
                      placeholder="What was it like working with them?..."
                      value={comment}
                      onChange={(e)=>setComment(e.target.value)}
                      required
                    />
                </div>

                <motion.button 
                  type="submit"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Submit Review
                </motion.button>
              </form>
            </motion.div>

            {/* Reviews */}
            <motion.div 
              className="reviews-section glass-panel"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0 }}>Recent Reviews</h3>
                <select 
                  value={sortOrder} 
                  onChange={(e) => setSortOrder(e.target.value)}
                  style={{ background: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid rgba(0, 240, 255, 0.3)', padding: '5px 10px', borderRadius: '8px', outline: 'none' }}
                >
                  <option value="-created_at">Newest First</option>
                  <option value="-rating">Highest Rated</option>
                  <option value="rating">Lowest Rated</option>
                </select>
              </div>
              <div className="reviews-list">
                  {reviews.length === 0 ? (
                    <motion.p 
                      className="no-review"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                        No reviews yet. Be the first!
                    </motion.p>
                  ) : (
                    reviews.map((review, index)=>(
                      <motion.div 
                        className="review-card" 
                        key={review.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)" }}
                        style={{ position: 'relative' }}
                      >
                        <div className="review-top" style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <StarRating rating={review.rating}/>
                          {currentUser === review.reviewer && (
                            <button 
                              onClick={() => deleteReview(review.id)}
                              style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer' }}
                              title="Delete Review"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                        <p className="review-comment">"{review.comment}"</p>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '10px' }}>
                          By @{review.reviewer}
                        </div>
                      </motion.div>
                    ))
                  )}
              </div>
            </motion.div>
        </div>

      </div>
    </PageWrapper>
  )
}

export default SkillDetail