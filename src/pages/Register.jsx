import { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import "./Auth.css";
import PageWrapper from "../components/PageWrapper";
import { motion } from "framer-motion";

function Register() {
  const [username,setUsername]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const navigate = useNavigate();

  const handleRegister=async(e)=>{
    e.preventDefault();

    try{
      await API.post("users/register/",{
        username,
        email,
        password
      });

      alert("Registration successful");
    }catch(err){
      alert("Registration failed");
    }
  }

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

  return (
    <PageWrapper>
      <div className="auth-container">

        <motion.div 
          className="auth-left"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1>WELCOME BACK!</h1>
          <p>Exchange skills and learn something new every day.</p>
        </motion.div>

        <motion.div 
          className="auth-right"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2>Sign Up</h2>

          <form onSubmit={handleRegister}>

            <input
              type="text"
              placeholder="Username"
              onChange={(e)=>setUsername(e.target.value)}
            />

            <input
              type="email"
              placeholder="Email"
              onChange={(e)=>setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              onChange={(e)=>setPassword(e.target.value)}
            />

            <button type="submit">Sign Up</button>

          </form>

          <div className="divider">OR</div>
          <button className="google-btn" onClick={handleGoogleSignIn}>
            Sign in with Google
          </button>

          <p className="auth-switch">
            Already have an account? <a href="/login">Login</a>
          </p>

        </motion.div>

      </div>
    </PageWrapper>
  )
}

export default Register;