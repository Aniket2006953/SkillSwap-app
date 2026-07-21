import { useEffect, useState } from "react";
import "./SplashIntro.css";

const SplashIntro = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Check if intro has already been played in this session
    const hasPlayed = sessionStorage.getItem("introPlayed");
    
    if (hasPlayed) {
      setIsVisible(false);
      if (onComplete) onComplete();
      return;
    }

    // Start fading out after 6 seconds
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 6000);

    // Completely remove from DOM after 7.5 seconds
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem("introPlayed", "true");
      if (onComplete) onComplete();
    }, 7500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className={`splash-container ${isFadingOut ? "fade-out" : ""}`}>
      
      {/* AI Generated Cinematic Background */}
      <div className="splash-bg-image" style={{ backgroundImage: "url('/intro_bg.png')" }}></div>
      <div className="splash-bg-overlay"></div>
      
      {/* Background ambient glows */}
      <div className="splash-glow glow-1"></div>
      <div className="splash-glow glow-2"></div>
      
      {/* Main cinematic content */}
      <div className="splash-content">
        
        {/* Animated Logo / Title */}
        <div className="splash-logo-container">
          <h1 className="splash-title" data-text="SkillSwap">
            SkillSwap
          </h1>
        </div>

        {/* Subtitle fading in */}
        <p className="splash-subtitle">Master anything. Teach everything.</p>
        
        {/* Sleek loading progress bar */}
        <div className="splash-progress-container">
          <div className="splash-progress-bar"></div>
        </div>

      </div>

    </div>
  );
};

export default SplashIntro;
