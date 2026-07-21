import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../api";
import PageWrapper from "../components/PageWrapper";
import StarRating from "../components/StarRating";
import "./Leaderboard.css";

function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await API.get("skills/leaderboard/");
      setLeaders(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <PageWrapper>
      <div className="leaderboard-container">
        <div className="leaderboard-header">
          <h1>Nexus Leaderboard</h1>
          <p>The highest-rated operatives and most legendary skills across the network.</p>
        </div>

        {loading ? (
          <div className="leaderboard-loading">
            <div className="spinner"></div>
          </div>
        ) : (
          <motion.div 
            className="leaderboard-list"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {leaders.length === 0 ? (
              <div className="no-leaders">No rated skills found yet. Be the first!</div>
            ) : (
              leaders.map((skill, index) => (
                <motion.div 
                  key={skill.id} 
                  className={`leaderboard-card rank-${index + 1}`}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, x: 10 }}
                  onClick={() => navigate(`/skills/${skill.id}`)}
                >
                  <div className="rank-badge">
                    {index === 0 ? "🏆" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                  </div>
                  
                  <div className="leaderboard-skill-info">
                    <h3>{skill.title}</h3>
                    <div className="leaderboard-meta">
                      <span className="leaderboard-category">{skill.category}</span>
                      <span className="leaderboard-owner" onClick={(e) => { e.stopPropagation(); navigate(`/profile/${skill.owner}`); }}>
                        @{skill.owner_username}
                      </span>
                    </div>
                  </div>

                  <div className="leaderboard-rating">
                    <div className="rating-score">{skill.average_rating} ⭐</div>
                    <div className="review-count">{skill.reviews_count} Reviews</div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </div>
    </PageWrapper>
  );
}

export default Leaderboard;
