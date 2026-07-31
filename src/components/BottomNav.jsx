import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Search, 
  Film, 
  LayoutDashboard, 
  User
} from "lucide-react";
import "./BottomNav.css";

function BottomNav() {
  const location = useLocation();
  const token = localStorage.getItem("access");
  const isAuthenticated = token && token !== "undefined" && token !== "null";
  const username = localStorage.getItem("username");

  const navItems = [
    { path: "/", label: "Home", icon: <Home size={24} strokeWidth={location.pathname === '/' ? 3 : 2} fill={location.pathname === '/' ? 'currentColor' : 'none'} /> },
    { path: "/all-skills", label: "Explore", icon: <Search size={24} strokeWidth={location.pathname === '/all-skills' ? 3 : 2} /> },
    { path: "/showcase", label: "Showcase", icon: <Film size={24} strokeWidth={location.pathname === '/showcase' ? 3 : 2} fill={location.pathname === '/showcase' ? 'currentColor' : 'none'} /> },
    { path: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={24} strokeWidth={location.pathname === '/dashboard' ? 3 : 2} fill={location.pathname === '/dashboard' ? 'currentColor' : 'none'} /> },
    { path: isAuthenticated ? `/profile/${username}` : "/login", label: "Profile", icon: <User size={24} strokeWidth={location.pathname.startsWith('/profile') ? 3 : 2} fill={location.pathname.startsWith('/profile') ? 'currentColor' : 'none'} /> },
  ];

  return (
    <div className="bottom-nav">
      {navItems.map((item) => (
        <Link 
          key={item.label} 
          to={item.path} 
          className={`bottom-nav-item ${location.pathname === item.path || (item.label === 'Profile' && location.pathname.startsWith('/profile')) ? 'active' : ''}`}
        >
          <div className="bottom-nav-icon">{item.icon}</div>
          <span className="bottom-nav-label">{item.label}</span>
        </Link>
      ))}
    </div>
  );
}

export default BottomNav;
