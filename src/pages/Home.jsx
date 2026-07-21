import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PageWrapper from "../components/PageWrapper";
import "./Home.css";

function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/all-skills?search=${searchTerm}`);
    } else {
      navigate("/all-skills");
    }
  };

  const handleCategoryClick = (category) => {
    navigate(`/all-skills?category=${category}`);
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <PageWrapper>
      <div className="cinematic-home">
        {/* Animated Ambient Background */}
        <div className="ambient-background">
          <div className="glow-orb orb-primary"></div>
          <div className="glow-orb orb-secondary"></div>
          <div className="glow-orb orb-accent"></div>
          <div className="grid-overlay"></div>
        </div>

        {/* Hero Section */}
        <section className="cinematic-hero">
          <motion.div 
            className="hero-content"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <div className="hero-text-block">
              <motion.div variants={fadeInUp} className="hud-badge">
                <span className="hud-pulse"></span>
                <span>SYSTEM ONLINE: 50,000+ USERS</span>
              </motion.div>

              <motion.h1 variants={fadeInUp} className="glitch-title" data-text="EXCHANGE SKILLS">
                EXCHANGE SKILLS<br/>
                <span className="gradient-text">BUILD FUTURES</span>
              </motion.h1>

              <motion.p variants={fadeInUp} className="hero-description">
                Enter the next generation of skill swapping. Connect your neural network with thousands of mentors and learners globally. No currency required—just knowledge.
              </motion.p>

              <motion.form variants={fadeInUp} className="hud-search-form" onSubmit={handleSearch}>
                <div className="search-input-wrapper">
                  <svg className="search-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                  <input
                    type="text"
                    className="hud-input"
                    placeholder="INITIATE SEARCH (React, Yoga, Hindi...)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="input-corners"></div>
                </div>
                <button className="hud-button primary" type="submit">
                  <span className="button-text">FIND MATCHES</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </motion.form>

              <motion.div variants={fadeInUp} className="hero-actions">
                <button type="button" className="hud-button secondary" onClick={() => navigate("/add-skill")}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L3 7V12C3 17.55 6.84 22.74 12 24C17.16 22.74 21 17.55 21 12V7L12 2Z" />
                  </svg>
                  <span>OFFER SKILLS</span>
                </button>
                <div className="system-status">
                  <div className="status-item"><span className="dot safe"></span> 100% Free</div>
                  <div className="status-item"><span className="dot safe"></span> Secure</div>
                  <div className="status-item"><span className="dot safe"></span> Global</div>
                </div>
              </motion.div>
            </div>

            {/* Right Side Glass Illustration */}
            <motion.div variants={slideInRight} className="hero-visual">
              <div className="glass-panel main-panel">
                <div className="panel-header">
                  <div className="header-dots">
                    <span></span><span></span><span></span>
                  </div>
                  <div className="header-title">DATA.UPLINK</div>
                </div>
                <div className="panel-body">
                  <div className="holo-graphic">
                    {/* Simulated hologram projection */}
                    <div className="holo-ring outer"></div>
                    <div className="holo-ring inner"></div>
                    <div className="holo-core">
                      <svg viewBox="0 0 24 24" fill="none" stroke="url(#gradient)" strokeWidth="1.5">
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#00f2fe" />
                            <stop offset="100%" stopColor="#4facfe" />
                          </linearGradient>
                        </defs>
                        <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
                        <line x1="12" y1="22" x2="12" y2="12" />
                        <line x1="22" y1="8.5" x2="12" y2="12" />
                        <line x1="2" y1="8.5" x2="12" y2="12" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="glass-panel float-card top-right">
                <div className="stat-value">1,234</div>
                <div className="stat-label">ACTIVE NODES</div>
              </div>
              
              <div className="glass-panel float-card bottom-left">
                <div className="stat-value text-accent">98%</div>
                <div className="stat-label">SYNC RATE</div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Featured Skills Grid */}
        <section className="cinematic-section categories-section">
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="section-container"
          >
            <motion.div variants={fadeInUp} className="section-header">
              <h2><span className="highlight">[</span> FEATURED PROTOCOLS <span className="highlight">]</span></h2>
              <p>ACCESS TRENDING SKILL DATABASES IN THE NETWORK</p>
            </motion.div>

            <div className="glass-grid">
              {[
                { id: "coding", icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4", title: "CODING", desc: "Web Dev, Python, AI", count: "1,245" },
                { id: "design", icon: "M12 2L2 22h20L12 2z", title: "DESIGN", desc: "UI/UX, Graphics", count: "892" },
                { id: "languages", icon: "M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 15h4.498m-4.749 0L15 11l2.251 4", title: "LANGUAGES", desc: "Hindi, Spanish, French", count: "654" },
                { id: "photography", icon: "M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z", title: "PHOTOGRAPHY", desc: "Portrait, Landscape", count: "567" }
              ].map((skill, index) => (
                <motion.div 
                  key={index} 
                  variants={fadeInUp} 
                  className="glass-card skill-card"
                  onClick={() => handleCategoryClick(skill.id)}
                >
                  <div className="card-glare"></div>
                  <div className="card-content">
                    <div className="skill-icon-container">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d={skill.icon} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <h3>{skill.title}</h3>
                    <p>{skill.desc}</p>
                    <div className="skill-meta">
                      <span className="count-badge">{skill.count} NODES</span>
                    </div>
                  </div>
                  <div className="card-border"></div>
                </motion.div>
              ))}
            </div>

            <motion.div variants={fadeInUp} className="center-action">
              <button type="button" className="hud-button outline" onClick={() => navigate("/all-skills")}>
                <span className="button-text">BROWSE ALL DIRECTORIES</span>
              </button>
            </motion.div>
          </motion.div>
        </section>

        {/* How it Works */}
        <section className="cinematic-section process-section">
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="section-container"
          >
            <motion.div variants={fadeInUp} className="section-header">
              <h2><span className="highlight">[</span> INITIALIZATION SEQUENCE <span className="highlight">]</span></h2>
              <p>THREE PHASES TO COMMENCE SKILL EXCHANGE</p>
            </motion.div>

            <div className="process-path">
              {[
                { step: "01", title: "CREATE PROFILE", desc: "Establish your identity. Declare your proficiencies and target knowledge areas in the mainframe." },
                { step: "02", title: "SYNC & MATCH", desc: "Our algorithm identifies compatible nodes. Send secure handshake requests to initiate connection." },
                { step: "03", title: "EXCHANGE DATA", desc: "Commence peer-to-peer knowledge transfer via direct communication channels." }
              ].map((phase, idx) => (
                <motion.div key={idx} variants={fadeInUp} className="process-node">
                  <div className="node-marker">
                    <div className="marker-core"></div>
                    <div className="marker-ring"></div>
                  </div>
                  <div className="node-content glass-panel">
                    <div className="phase-number">PHASE // {phase.step}</div>
                    <h3>{phase.title}</h3>
                    <p>{phase.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* CTA Section */}
        <section className="cinematic-section final-cta">
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="glass-panel cta-panel"
          >
            <div className="cta-glitch-bg"></div>
            <motion.div variants={fadeInUp} className="cta-content">
              <h2>SYSTEM AWAITING YOUR INPUT</h2>
              <p>Join 50,000+ active nodes expanding their capabilities today.</p>
              <div className="cta-actions">
                <button type="button" className="hud-button primary large" onClick={() => navigate("/register")}>
                  <span className="button-text">INITIALIZE CONNECTION</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Contact & Socials Section */}
        <section className="cinematic-section contact-section" id="contact">
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }}
            variants={staggerContainer}
            className="glass-panel contact-panel"
          >
            <motion.div variants={fadeInUp} className="section-header">
              <h2><span className="highlight">[</span> TRANSMIT SIGNAL <span className="highlight">]</span></h2>
              <p>INITIATE DIRECT COMM LINK WITH SYSTEM ADMINS</p>
            </motion.div>

            <div className="contact-grid">
              <motion.form variants={fadeInUp} className="contact-form">
                <div className="form-group">
                  <input type="text" className="hud-input" placeholder="NODE DESIGNATION (Name)" required />
                </div>
                <div className="form-group">
                  <input type="email" className="hud-input" placeholder="RETURN SIGNAL (Email)" required />
                </div>
                <div className="form-group">
                  <textarea className="hud-input" placeholder="TRANSMISSION DATA (Message)" rows="4" required></textarea>
                </div>
                <button type="button" className="hud-button primary" onClick={(e) => { e.preventDefault(); alert("Transmission Sent!"); }}>
                  <span className="button-text">SEND TRANSMISSION</span>
                </button>
              </motion.form>

              <motion.div variants={fadeInUp} className="social-links-container">
                <h3>NETWORK RELAYS (SOCIALS)</h3>
                <p>Connect with us on external network grids or send a direct email transmission.</p>
                <div className="social-grid">
                  <a href="https://twitter.com/aniket_bhukte4" target="_blank" rel="noopener noreferrer" className="social-btn">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                    <span>Twitter / X</span>
                  </a>
                  <a href="https://instagram.com/aniket_bhukte" target="_blank" rel="noopener noreferrer" className="social-btn">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                    <span>Instagram</span>
                  </a>
                  <a href="mailto:aniketbhukte5@gmail.com" className="social-btn">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    <span>Email Us</span>
                  </a>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

      </div>
    </PageWrapper>
  );
}

export default Home;