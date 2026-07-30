import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import API from "../api"
import { motion } from "framer-motion"
import PageWrapper from "../components/PageWrapper"
import "./OwnerRequests.css"

function OwnerRequests() {

  const [requests, setRequests] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const res = await API.get("skills/owner-requests/")
      setRequests(res.data.results)
    } catch (err) {
      console.log(err)
    }
  }

  const [scheduledTimes, setScheduledTimes] = useState({})

  const updateStatus = async (id, status) => {
    try {
      const payload = { status }
      if (status === "accepted" && scheduledTimes[id]) {
        payload.scheduled_time = scheduledTimes[id]
      }
      
      await API.patch(`skills/request/${id}/`, payload)
      alert("Updated Successfully")
      fetchRequests()
    } catch (err) {
      console.log(err)
      alert("Update Failed")
    }
  }

  const handleTimeChange = (id, value) => {
    setScheduledTimes(prev => ({...prev, [id]: value}))
  }

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
    <PageWrapper className="request-page">
      <h2 className="request-title">Incoming Requests</h2>

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
                  <p className="req-user">
                    <span className="label">Requested by:</span> 
                    <span className="value">{req.requester_username}</span>
                  </p>

                  {req.status === "accepted" && req.meeting && (
                    <div className="meeting-time">
                      🗓️ Scheduled: <span>{new Date(req.meeting.scheduled_time).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {req.status === "pending" && (
                  <div className="req-actions-pending">
                    <input 
                      type="datetime-local" 
                      value={scheduledTimes[req.id] || ''}
                      onChange={(e) => handleTimeChange(req.id, e.target.value)}
                      className="datetime-input"
                    />
                    <div className="action-row">
                      <button
                        className="btn-accept"
                        onClick={() => updateStatus(req.id, "accepted")}
                      >
                        Accept
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => updateStatus(req.id, "rejected")}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )}

                {req.status === "accepted" && (
                  <div className="card-actions">
                    <div className="action-row">
                      <button className="btn-profile" onClick={() => navigate(`/profile/${req.requester_username}`)}>
                        Profile
                      </button>
                      <button className="btn-chat" onClick={() => navigate(`/chat/${req.requester_username}`)}>
                        Chat
                      </button>
                      <button className="btn-workspace" onClick={() => navigate(`/workspace/${req.id}`)}>
                        Workspace
                      </button>
                    </div>
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

export default OwnerRequests