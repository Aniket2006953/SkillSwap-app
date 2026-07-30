import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import './Showcase.css';

const Showcase = () => {
  const [showcases, setShowcases] = useState([]);
  const [currentShowcaseIndex, setCurrentShowcaseIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const videoRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchShowcases();
  }, []);

  const fetchShowcases = async () => {
    try {
      let allSkills = [];
      let nextUrl = 'skills/all/';
      
      while (nextUrl) {
        const res = await API.get(nextUrl);
        const data = res.data.results !== undefined ? res.data.results : res.data;
        allSkills = [...allSkills, ...(Array.isArray(data) ? data : [])];
        
        if (res.data.next) {
          // Extract just the path part after /api/ for the axios instance
          const urlObj = new URL(res.data.next);
          nextUrl = urlObj.pathname.replace('/api/', '') + urlObj.search;
        } else {
          nextUrl = null;
        }
      }

      // Filter skills that have a video
      const skillsWithVideo = allSkills.filter(skill => typeof skill.video === 'string' && skill.video);
      setShowcases(skillsWithVideo);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, clientHeight } = e.target;
    const index = Math.round(scrollTop / clientHeight);
    
    if (index !== currentShowcaseIndex) {
      if (videoRefs.current[currentShowcaseIndex]) {
        videoRefs.current[currentShowcaseIndex].pause();
      }
      if (videoRefs.current[index]) {
        videoRefs.current[index].play();
      }
      setCurrentShowcaseIndex(index);
    }
  };

  if (loading) return <div className="reels-loading">Loading Showcase...</div>;

  return (
    <div className="reels-page">
      <div className="reels-container" onScroll={handleScroll}>
        {showcases.length === 0 && <div className="no-reels">No showcases found. Add a skill with a video to see it here!</div>}
        
        {showcases.map((skill, index) => {
          // ensure absolute URL for the video
          const videoSrc = skill.video.startsWith('http') ? skill.video : `https://skillswap-app-wj2a.onrender.com${skill.video}`;

          return (
            <div className="reel-item" key={skill.id || skill._id}>
              <video 
                ref={el => videoRefs.current[index] = el}
                src={videoSrc} 
                className="reel-video"
                loop
                autoPlay={index === 0}
                muted={index !== currentShowcaseIndex}
                onClick={(e) => {
                  if (e.target.paused) e.target.play();
                  else e.target.pause();
                }}
              />
              <div className="reel-overlay">
                <div className="reel-info">
                  <h3 className="reel-username" onClick={() => navigate(`/profile/${skill.owner_username || skill.owner}`)} style={{ cursor: 'pointer' }}>
                    @{skill.owner_username || skill.owner}
                  </h3>
                  <p className="reel-caption" style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '4px' }}>{skill.title}</p>
                  <p className="reel-caption" style={{ fontSize: '0.9rem', opacity: 0.9 }}>{skill.description?.slice(0, 80)}{skill.description?.length > 80 ? '...' : ''}</p>
                </div>
                <div className="reel-actions">
                  <button className="action-btn" onClick={() => navigate(`/skills/${skill.id || skill._id}`)}>
                    🚀
                    <span>View Skill</span>
                  </button>
                  <button className="action-btn" onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/skills/${skill.id || skill._id}`);
                    alert("Skill link copied!");
                  }}>
                    🔗
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Showcase;
