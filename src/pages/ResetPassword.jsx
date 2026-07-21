import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import "./Login.css";
import PageWrapper from "../components/PageWrapper";
import { motion } from "framer-motion";

function ResetPassword() {
  const { uidb64, token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    try {
      await API.post("users/password-reset-confirm/", {
        uidb64,
        token,
        password,
      });
      setMessage("Password reset successfully! You can now log in.");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password. The link might be invalid or expired.");
    }
  };

  return (
    <PageWrapper>
      <div className="login-page">
        <motion.div 
          className="login-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2>Set New Password</h2>
          
          <form onSubmit={handleReset}>
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            
            {error && <p style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '1rem' }}>{error}</p>}
            {message && <p style={{ color: '#22c55e', fontSize: '0.9rem', marginBottom: '1rem' }}>{message}</p>}

            <button type="submit" className="login-btn">Reset Password</button>
          </form>
        </motion.div>
      </div>
    </PageWrapper>
  );
}

export default ResetPassword;
