import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import { signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import "./Login.css";
import PageWrapper from "../components/PageWrapper";
import { motion } from "framer-motion";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [emailForReset, setEmailForReset] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("token/", {
        username,
        password,
      });

      // Store tokens
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      localStorage.setItem("username", username);
      
      // Fetch profile to get user ID
      try {
        const profileRes = await API.get("users/profile/");
        localStorage.setItem("userId", profileRes.data.id || profileRes.data._id);
      } catch (profileErr) {
        console.error("Could not fetch profile during login", profileErr);
      }

      alert("Login successful!");
      navigate("/dashboard");

    } catch (err) {
      alert("Invalid credentials");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      
      // Send token to backend
      const res = await API.post("users/firebase-login/", { token });
      
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("userId", res.data.id || res.data._id);
      
      alert("Google Login successful!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Google Sign-In failed");
    }
  };

  const handleResetPassword = async () => {
    if (!emailForReset) {
      alert("Please enter your email to reset password.");
      return;
    }
    try {
      // Send reset request to Django backend
      const res = await API.post("users/password-reset/", { email: emailForReset });
      alert(res.data.message || "Password reset email sent! Check your inbox.");
      setEmailForReset("");
    } catch (err) {
      // In case it's a Google user or Django email fails
      alert("Failed to send reset email. Make sure the email is correct.");
      console.error(err);
    }
  };

  return (
    <PageWrapper>
      <div className="login-page">

        {/* <video autoPlay loop muted className="video-bg">
          <source src={bgVideo} type="video/mp4" />
        </video> */}

        <motion.div 
          className="login-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >

          <h2>Login</h2>

          <form onSubmit={handleLogin}>

            <input
              type="text"
              placeholder="Username"
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit" className="login-btn">Login</button>

          </form>

          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
             <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Forgot your password?</p>
             <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                <input 
                  type="email" 
                  placeholder="Enter email to reset" 
                  value={emailForReset}
                  onChange={(e) => setEmailForReset(e.target.value)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff' }}
                />
                <button onClick={handleResetPassword} style={{ padding: '10px 15px', background: 'transparent', border: '1px solid #38bdf8', color: '#38bdf8', borderRadius: '8px', cursor: 'pointer' }}>Reset</button>
             </div>
          </div>

          <div className="divider">OR</div>
          <button className="google-btn" onClick={handleGoogleSignIn}>
            Sign in with Google
          </button>

        </motion.div>

      </div>
    </PageWrapper>
  );
}

export default Login;