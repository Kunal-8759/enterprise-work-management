import { useLocation } from "react-router-dom";
import { Bell, Sun, Moon, Menu } from "lucide-react";
import { useTheme } from "../../context/ThemeContext.jsx";
import useAuth from "../../hooks/useAuth.js";
import { useSelector } from "react-redux";
import "./Topbar.css";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/projects": "Projects",
  "/tasks": "Tasks",
  "/analytics": "Analytics",
  "/users": "User Management",
  "/settings": "Settings",
};

const Topbar = ({ setMobileOpen }) => {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const unreadCount = useSelector(
    (state) => state.notifications?.unreadCount || 0
  );

  const pageTitle = pageTitles[location.pathname] || "Enterprise WMS";

  return (
    <header className="topbar">
      {/* ── Left ─────────────────────────────────────────────────── */}
      <div className="topbar-left">
        {/* Hamburger — mobile only */}
        <button
          className="topbar-hamburger"
          onClick={() => setMobileOpen(true)}
          title="Open menu"
        >
          <Menu size={22} />
        </button>
        <h1 className="topbar-title">{pageTitle}</h1>
      </div>

      {/* ── Right ────────────────────────────────────────────────── */}
      <div className="topbar-right">
        {/* Theme Toggle */}
        <button
          className="topbar-icon-btn"
          onClick={toggleTheme}
          title={isDark ? "Switch to Light" : "Switch to Dark"}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notification Bell */}
        <button
          className="topbar-icon-btn topbar-notif-btn"
          title="Notifications"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="topbar-notif-badge">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        {/* User Info */}
        <div className="topbar-user">
          <div className="topbar-user-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="topbar-user-info">
            <span className="topbar-user-name">{user?.name}</span>
            <span className="topbar-user-role">{user?.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;