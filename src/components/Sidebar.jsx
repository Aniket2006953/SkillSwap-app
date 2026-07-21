
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Home, 
  Search, 
  Film, 
  LayoutDashboard, 
  MessageCircle, 
  Bell, 
  User,
  LogIn,
  UserPlus,
  LogOut
} from "lucide-react";
import "./Sidebar.css";
import logo from "../assets/logo.jpeg";

function Sidebar({ isExpanded, setIsExpanded }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const navItems = [
    { path: "/", label: "Home", icon: <Home size={24} strokeWidth={location.pathname === '/' ? 3 : 2} fill={location.pathname === '/' ? 'currentColor' : 'none'} /> },
    { path: "/all-skills", label: "Explore", icon: <Search size={24} strokeWidth={location.pathname === '/all-skills' ? 3 : 2} /> },
    { path: "/showcase", label: "Showcase", icon: <Film size={24} strokeWidth={location.pathname === '/showcase' ? 3 : 2} fill={location.pathname === '/showcase' ? 'currentColor' : 'none'} /> },
    { path: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={24} strokeWidth={location.pathname === '/dashboard' ? 3 : 2} fill={location.pathname === '/dashboard' ? 'currentColor' : 'none'} /> },
    { path: "/messages", label: "Messages", icon: <MessageCircle size={24} strokeWidth={location.pathname === '/messages' ? 3 : 2} fill={location.pathname === '/messages' ? 'currentColor' : 'none'} /> },
    { path: "/notifications", label: "Notifications", icon: <Bell size={24} strokeWidth={location.pathname === '/notifications' ? 3 : 2} fill={location.pathname === '/notifications' ? 'currentColor' : 'none'} /> },
  ];

  const token = localStorage.getItem("access");
  const isAuthenticated = token && token !== "undefined" && token !== "null";

  const bottomItems = isAuthenticated ? [
    { path: "/profile", label: "Profile", icon: <User size={24} strokeWidth={location.pathname === '/profile' ? 3 : 2} fill={location.pathname === '/profile' ? 'currentColor' : 'none'} /> },
  ] : [
    { path: "/login", label: "Login", icon: <LogIn size={24} strokeWidth={location.pathname === '/login' ? 3 : 2} /> },
    { path: "/register", label: "Register", icon: <UserPlus size={24} strokeWidth={location.pathname === '/register' ? 3 : 2} /> },
  ];

  return (
    <div 
      className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="sidebar-top">
        <div className="sidebar-logo-container">
          <img src={logo} alt="SkillSwap" className="sidebar-logo" />
          <h2 className="sidebar-brand">SkillSwap</h2>
        </div>
      </div>

      <div className="sidebar-middle">
        {navItems.map((item) => (
          <Link 
            key={item.path} 
            to={item.path} 
            className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
            title={!isExpanded ? item.label : ""}
          >
            <div className="sidebar-icon">{item.icon}</div>
            <span className="sidebar-label">{item.label}</span>
          </Link>
        ))}
      </div>

      <div className="sidebar-bottom">
        {bottomItems.map((item) => (
          <Link 
            key={item.path} 
            to={item.path} 
            className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
            title={!isExpanded ? item.label : ""}
          >
            <div className="sidebar-icon">{item.icon}</div>
            <span className="sidebar-label">{item.label}</span>
          </Link>
        ))}

        {isAuthenticated && (
          <button
            className="sidebar-item sidebar-logout-btn"
            onClick={handleLogout}
            title={!isExpanded ? "Logout" : ""}
          >
            <div className="sidebar-icon"><LogOut size={24} strokeWidth={2} /></div>
            <span className="sidebar-label">Logout</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
