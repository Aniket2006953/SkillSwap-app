import { Link } from "react-router-dom"
import "./Navbar.css"
import logo from "../assets/logo.jpeg"

function Navbar() {

  return (

    <nav className="navbar">

      <div className="logo-container">
        <img src={logo} alt="SkillSwap Logo" className="logo"/>
      </div>
      <h2 className="app-name">SkillSwap</h2>

      <div className="nav-links">

        <Link to="/">Home</Link>

        <Link to="/all-skills">Explore</Link>

        <Link to="/leaderboard">Leaderboard</Link>

        <Link to="/showcase">Showcase</Link>

        <Link to="/dashboard">Dashboard</Link>

        <Link to="/profile">Profile</Link>

        <Link to="/login">Login</Link>

        <Link to="/register">Register</Link>

      </div>

    </nav>

  )
}

export default Navbar