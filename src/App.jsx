import { useState } from "react"
import { Routes, Route, useLocation } from "react-router-dom"
import { AnimatePresence } from "framer-motion"

import Sidebar from "./components/Sidebar"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import ResetPassword from "./pages/ResetPassword"
import Dashboard from "./pages/Dashboard"
import CreateSkill from "./pages/CreateSkill"
import SkillDetails from "./pages/SkillDetail"
import Messages from "./pages/Messages"
import AllSkills from "./pages/AllSkills"
import ProtectedRoute from "./components/ProtectedRoute"
import MyRequests from "./pages/MyRequests"
import SkillDetail from "./pages/SkillDetail"
import OwnerRequests from "./pages/OwnerRequests"
import Leaderboard from "./pages/Leaderboard"
import AddSkills from "./pages/AddSkills"
import PublicProfile from "./pages/PublicProfile"
import Showcase from "./pages/Showcase"
import Chat from "./pages/Chat"
import Notifications from "./pages/Notifications"
import Workspace from "./pages/Workspace"
import SplashIntro from "./components/SplashIntro"

import BottomNav from "./components/BottomNav"

const isAuthenticated =localStorage.getItem("access") ;
function App() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const location = useLocation();

  return (
    <>
      {showSplash && <SplashIntro onComplete={() => setShowSplash(false)} />}
      <div className="app-container">
      <Sidebar isExpanded={isSidebarExpanded} setIsExpanded={setIsSidebarExpanded} />
      <BottomNav />
      <div className={`main-content ${isSidebarExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
        <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password/:uidb64/:token" element={<ResetPassword />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><PublicProfile /></ProtectedRoute>} />
          <Route path="/create-skill" element={<ProtectedRoute><CreateSkill /></ProtectedRoute>} />
          <Route path="/skill/:id" element={<SkillDetails />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/all-skills" element={<AllSkills />} />
          <Route path="/my-requests" element={<ProtectedRoute><MyRequests /></ProtectedRoute>} />
          <Route path="/skills/:id" element={<SkillDetail />} />
          <Route path="/owner-requests" element={<ProtectedRoute><OwnerRequests /></ProtectedRoute>} />
          <Route path="/add-skill" element={<ProtectedRoute><AddSkills /></ProtectedRoute>} />
          <Route path="/profile/:username" element={<ProtectedRoute><PublicProfile /></ProtectedRoute>} />
          <Route path="/showcase" element={<Showcase />} />
          <Route path="/chat/:username" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/workspace/:id" element={<ProtectedRoute><Workspace /></ProtectedRoute>} />
        </Routes>
        </AnimatePresence>
      </div>
    </div>
    </>
  )
}

export default App