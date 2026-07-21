import { useEffect, useState } from "react"
import API from "../api"
import "./Profile.css"

function Profile() {

  const [profile, setProfile] = useState({
    username: "",
    email: "",
    bio: "",
    city: "",
    profile_picture: null,
    skills_offered: "",
    skills_wanted: "",
    skill_coins: 0,
    experience_level: "beginner",
    availability: "weekends",
    phone: "",
    linkedin_url: "",
    portfolio_url: "",
    languages: "",
    hourly_rate: "",
    years_of_experience: ""
  })

  const [loading, setLoading] = useState(true)
  const [successMessage, setSuccessMessage] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await API.get("users/profile/")
      setProfile(res.data)
      setLoading(false)
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setProfile({
      ...profile,
      [name]: value
    })
  }

  const handleImageChange = (e) => {
    setProfile({
      ...profile,
      profile_picture: e.target.files[0]
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const formData = new FormData()

      formData.append("username", profile.username)
      formData.append("bio", profile.bio)
      formData.append("city", profile.city)
      formData.append("skills_offered", profile.skills_offered)
      formData.append("skills_wanted", profile.skills_wanted)
      formData.append("experience_level", profile.experience_level)
      formData.append("availability", profile.availability)
      formData.append("phone", profile.phone)
      formData.append("linkedin_url", profile.linkedin_url)
      formData.append("portfolio_url", profile.portfolio_url)
      formData.append("languages", profile.languages)
      formData.append("hourly_rate", profile.hourly_rate)
      formData.append("years_of_experience", profile.years_of_experience)

      if (profile.profile_picture instanceof File) {
        formData.append("profile_picture", profile.profile_picture)
      }

      const res = await API.put("users/profile/", formData)
      setProfile(res.data)

      // Show success message
      setSuccessMessage(true)
      setTimeout(() => setSuccessMessage(false), 3000)

    } catch (error) {
      console.log(error.response?.data)
      alert("Error updating profile. Please try again.")
    }
  }

  // Parse skills into array for display
  const getSkillsArray = (skillsString) => {
    if (!skillsString) return []
    return skillsString.split(',').map(skill => skill.trim()).filter(Boolean)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading Your Profile...</p>
      </div>
    )
  }

  return (
    <div className="profile-container">

      {/* Success Message Toast */}
      {successMessage && (
        <div className="success-toast">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z" fill="#1B4332" />
          </svg>
          Profile Updated Successfully!
        </div>
      )}

      {/* Header Section */}
      <div className="profile-header">
        <div className="header-content">
          <h1 className="profile-title">My SkillSwap Profile</h1>
          <p className="profile-subtitle">Build Your Reputation • Connect With Others</p>
        </div>
        <div className="trust-badge">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z" fill="#FB8500" />
            <path d="M10 17L6 13L7.41 11.59L10 14.17L16.59 7.58L18 9L10 17Z" fill="#1B263B" />
          </svg>
          <span>Verified Member</span>
        </div>
      </div>

      <div className="profile-layout">

        {/* Left Column - Profile Card */}
        <div className="profile-card">

          {/* Avatar Section */}
          <div className="profile-avatar">
            <div className="avatar-wrapper">
              <img
                src={
                  profile.profile_picture
                    ? profile.profile_picture
                    : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                alt={`${profile.username}'s profile`}
              />
              <div className="avatar-overlay"></div>
              <div className="avatar-badge">
                {profile.experience_level && (
                  <span className={`level-badge ${profile.experience_level}`}>
                    {profile.experience_level.charAt(0).toUpperCase() + profile.experience_level.slice(1)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="profile-basic-info">
            <h2 className="profile-username">{profile.username}</h2>
            <p className="profile-email">{profile.email}</p>
            {profile.city && (
              <p className="profile-city">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0C5.24 0 3 2.24 3 5C3 8.5 8 14 8 14C8 14 13 8.5 13 5C13 2.24 10.76 0 8 0ZM8 6.75C7.31 6.75 6.75 6.19 6.75 5.5C6.75 4.81 7.31 4.25 8 4.25C8.69 4.25 9.25 4.81 9.25 5.5C9.25 6.19 8.69 6.75 8 6.75Z" />
                </svg>
                {profile.city}
              </p>
            )}
          </div>

          {/* Stats Grid */}
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-value">{profile.years_of_experience || "0"}</span>
              <span className="stat-label">Years</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{getSkillsArray(profile.skills_offered).length || "0"}</span>
              <span className="stat-label">Skills</span>
            </div>
            <div className="stat-item" style={{background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.3)'}}>
              <span className="stat-value" style={{color: '#FFD700'}}>🪙 {profile.skill_coins ?? 0}</span>
              <span className="stat-label" style={{color: '#FFD700'}}>Skill Coins</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{profile.hourly_rate ? `$${profile.hourly_rate}` : "—"}</span>
              <span className="stat-label">Rate/Hr</span>
            </div>
          </div>

          {/* Skills Offered Pills */}
          {profile.skills_offered && (
            <div className="skills-display-section">
              <h3 className="skills-section-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 11.75C6.66 11.75 2 12.92 2 15.25V17H16V15.25C16 12.92 11.34 11.75 9 11.75ZM4.34 15C5.18 14.42 7.21 13.75 9 13.75C10.79 13.75 12.82 14.42 13.66 15H4.34ZM9 10C10.93 10 12.5 8.43 12.5 6.5C12.5 4.57 10.93 3 9 3C7.07 3 5.5 4.57 5.5 6.5C5.5 8.43 7.07 10 9 10ZM9 5C9.83 5 10.5 5.67 10.5 6.5C10.5 7.33 9.83 8 9 8C8.17 8 7.5 7.33 7.5 6.5C7.5 5.67 8.17 5 9 5ZM16.04 11.81C17.2 12.65 18 13.77 18 15.25V17H22V15.25C22 13.23 18.5 12.08 16.04 11.81ZM15 10C16.93 10 18.5 8.43 18.5 6.5C18.5 4.57 16.93 3 15 3C14.46 3 13.96 3.13 13.5 3.35C14.13 4.24 14.5 5.33 14.5 6.5C14.5 7.67 14.13 8.76 13.5 9.65C13.96 9.87 14.46 10 15 10Z" />
                </svg>
                Skills I Offer
              </h3>
              <div className="skills-pills">
                {getSkillsArray(profile.skills_offered).map((skill, index) => (
                  <span key={index} className="skill-pill offer">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Skills Wanted Pills */}
          {profile.skills_wanted && (
            <div className="skills-display-section">
              <h3 className="skills-section-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z" />
                </svg>
                Skills I Want to Learn
              </h3>
              <div className="skills-pills">
                {getSkillsArray(profile.skills_wanted).map((skill, index) => (
                  <span key={index} className="skill-pill wanted">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Bio Display */}
          {profile.bio && (
            <div className="profile-bio-display">
              <h3>About Me</h3>
              <p>{profile.bio}</p>
            </div>
          )}

          {/* Availability Badge */}
          {profile.availability && (
            <div className="availability-section">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM12.5 7H11V13L16.25 16.15L17 14.92L12.5 12.25V7Z" />
              </svg>
              <span>Available: <strong>{profile.availability.charAt(0).toUpperCase() + profile.availability.slice(1)}</strong></span>
            </div>
          )}

        </div>

        {/* Right Column - Edit Form */}
        <div className="profile-edit-card">

          <div className="section-header">
            <h3 className="section-title">Update Your Information</h3>
            <p className="section-description">Keep your profile current to attract better skill exchange opportunities</p>
          </div>

          <form onSubmit={handleSubmit} className="profile-form">

            {/* Basic Information Section */}
            <div className="form-section">
              <h4 className="form-section-title">
                <span className="section-icon">📋</span>
                Basic Information
              </h4>

              <div className="form-group">
                <label htmlFor="username">Username / Display Name</label>
                <input
                  id="username"
                  type="text"
                  name="username"
                  placeholder="Your unique username"
                  value={profile.username || ""}
                  onChange={handleChange}
                  required
                />
                <small>This name is visible to everyone on the platform.</small>
              </div>

              <div className="form-group">
                <label htmlFor="profile_picture">Profile Picture</label>
                <input
                  id="profile_picture"
                  type="file"
                  name="profile_picture"
                  onChange={handleImageChange}
                  accept="image/*"
                />
                <small>Recommended: Square image, at least 400x400px</small>
              </div>

              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  placeholder="Share your story, expertise, and what drives you..."
                  value={profile.bio || ""}
                  onChange={handleChange}
                  rows="4"
                />
                <small>A compelling bio helps others understand your background</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    type="text"
                    name="city"
                    placeholder="e.g., San Francisco"
                    value={profile.city || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="+1 (555) 123-4567"
                    value={profile.phone || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Skills & Experience Section */}
            <div className="form-section featured">
              <h4 className="form-section-title">
                <span className="section-icon">⭐</span>
                Skills & Experience
              </h4>

              <div className="form-group">
                <label htmlFor="skills_offered">Skills You Offer</label>
                <input
                  id="skills_offered"
                  type="text"
                  name="skills_offered"
                  placeholder="Web Development, Graphic Design, Photography, Content Writing"
                  value={profile.skills_offered || ""}
                  onChange={handleChange}
                />
                <small>💡 Separate skills with commas • Be specific to attract the right matches</small>
              </div>

              <div className="form-group">
                <label htmlFor="skills_wanted">Skills You Want to Learn</label>
                <input
                  id="skills_wanted"
                  type="text"
                  name="skills_wanted"
                  placeholder="Video Editing, Python Programming, Digital Marketing, Public Speaking"
                  value={profile.skills_wanted || ""}
                  onChange={handleChange}
                />
                <small>🎯 List skills you'd like to exchange for</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="experience_level">Experience Level</label>
                  <select
                    id="experience_level"
                    name="experience_level"
                    value={profile.experience_level || "beginner"}
                    onChange={handleChange}
                  >
                    <option value="beginner">🌱 Beginner</option>
                    <option value="intermediate">🌿 Intermediate</option>
                    <option value="advanced">🌳 Advanced</option>
                    <option value="expert">🏆 Expert</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="years_of_experience">Years of Experience</label>
                  <input
                    id="years_of_experience"
                    type="number"
                    name="years_of_experience"
                    placeholder="5"
                    value={profile.years_of_experience || ""}
                    onChange={handleChange}
                    min="0"
                    max="50"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="availability">Availability</label>
                  <select
                    id="availability"
                    name="availability"
                    value={profile.availability || "weekends"}
                    onChange={handleChange}
                  >
                    <option value="weekdays">⏰ Weekdays</option>
                    <option value="weekends">☀️ Weekends</option>
                    <option value="evenings">🌙 Evenings</option>
                    <option value="flexible">✨ Flexible</option>
                    <option value="full-time">🚀 Full Time</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="hourly_rate">Hourly Rate (INR)</label>
                  <input
                    id="hourly_rate"
                    type="number"
                    name="hourly_rate"
                    placeholder="25"
                    value={profile.hourly_rate || ""}
                    onChange={handleChange}
                    min="0"
                    max="999"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="languages">Languages Spoken</label>
                <input
                  id="languages"
                  type="text"
                  name="languages"
                  placeholder="English, Spanish, Mandarin, French"
                  value={profile.languages || ""}
                  onChange={handleChange}
                />
                <small>Being multilingual opens more opportunities</small>
              </div>
            </div>

            {/* Professional Links Section */}
            <div className="form-section">
              <h4 className="form-section-title">
                <span className="section-icon">🔗</span>
                Professional Links
              </h4>

              <div className="form-group">
                <label htmlFor="linkedin_url">LinkedIn Profile</label>
                <input
                  id="linkedin_url"
                  type="url"
                  name="linkedin_url"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={profile.linkedin_url || ""}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="portfolio_url">Portfolio / Website</label>
                <input
                  id="portfolio_url"
                  type="url"
                  name="portfolio_url"
                  placeholder="https://yourportfolio.com"
                  value={profile.portfolio_url || ""}
                  onChange={handleChange}
                />
                <small>Showcase your work to build trust</small>
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" className="submit-btn">
              <span className="btn-text">Save Profile Changes</span>
              <span className="btn-shimmer"></span>
              <svg className="btn-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
              </svg>
            </button>

          </form>

          {/* Trust Building Footer */}
          <div className="form-footer">
            <div className="trust-indicators">
              <div className="trust-item">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="#1B4332">
                  <path d="M10 0L2.5 4.17V9.33C2.5 14.46 5.7 19.11 10 20C14.3 19.11 17.5 14.46 17.5 9.33V4.17L10 0Z" />
                </svg>
                <span>Your data is secure</span>
              </div>
              <div className="trust-item">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="#1B4332">
                  <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z" />
                </svg>
                <span>Verified community</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}

export default Profile