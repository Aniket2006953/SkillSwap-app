import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { motion } from "framer-motion"
import PageWrapper from "../components/PageWrapper"
import "./MyRequests.css"

function MyRequests() {

  const [requests, setRequests] = useState([])
  const token = localStorage.getItem("access")
  const navigate = useNavigate()

  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/api/skills/my-requests/",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      setRequests(res.data.results || [])
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  return (
    <PageWrapper className="myreq-container">
      <h2 className="myreq-title">My Skill Requests</h2>

      {requests.length === 0 ? (
        <p className="no-req">No requests yet</p>
      ) : (
        <motion.div 
          className="request-grid"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {requests.map((req) => (
            <motion.div className="request-card deal-card" key={req.id} variants={itemVariants}>
              <div className="card-glass">
                <div className="card-header">
                  <h3>{req.skill_title}</h3>
                  <span className={`status-badge ${req.status}`}>
                    {req.status}
                  </span>
                </div>

                <div className="card-body">
                  <p className="owner-info">
                    <span className="label">Owner:</span> 
                    <span className="value">{req.skill_owner}</span>
                  </p>

                  {req.status === "accepted" && req.meeting && (
                    <div className="meeting-time">
                      🗓️ Scheduled: <span>{new Date(req.meeting.scheduled_time).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {req.status === "accepted" && (
                  <div className="card-actions">
                    <div className="action-row">
                      <button className="btn-profile" onClick={() => navigate(`/profile/${req.skill_owner}`)}>
                        Profile
                      </button>
                      <button className="btn-chat" onClick={() => navigate(`/chat/${req.skill_owner}`)}>
                        Chat
                      </button>
                      <button className="btn-workspace" onClick={() => navigate(`/workspace/${req.id}`)}>
                        Workspace
                      </button>
                    </div>
                    <button
                      className="btn-review"
                      onClick={() => navigate("/add-review", { state: { requestId: req.id } })}
                    >
                      Add Review
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </PageWrapper>
  )
}

export default MyRequests