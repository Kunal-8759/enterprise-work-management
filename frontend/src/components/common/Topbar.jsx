import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Bell, Sun, Moon, Menu } from "lucide-react";
import { useTheme } from "../../context/ThemeContext.jsx";
import useAuth from "../../hooks/useAuth.js";
import { useSelector } from "react-redux";
import NotificationDropdown from "../../features/notifications/NotificationDropdown.jsx";
import "./Topbar.css";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/projects": "Projects",
  "/tasks": "Tasks",
  "/analytics": "Analytics",
  "/users": "Users",
  "/settings": "Settings",
};

const Topbar = ({ setMobileOpen }) => {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const unreadCount = useSelector(
    (state) => state.notifications?.unreadCount || 0
  );

  const [notifOpen, setNotifOpen] = useState(false);
  const bellRef = useRef(null);

  const pageTitle = pageTitles[location.pathname] || "Enterprise WMS";

  return (
    <header className="topbar">
      {/*  Left  */}
      <div className="topbar-left">
        <button
          className="topbar-hamburger"
          onClick={() => setMobileOpen(true)}
          title="Open menu"
        >
          <Menu size={22} />
        </button>
        <h1 className="topbar-title">{pageTitle}</h1>
      </div>

      {/*  Right  */}
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
        <div className="topbar-notif-wrapper" ref={bellRef}>
          <button
            className="topbar-icon-btn topbar-notif-btn"
            onClick={() => setNotifOpen((prev) => !prev)}
            title="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && !notifOpen && (
              <span className="topbar-notif-badge">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <NotificationDropdown bellRef={bellRef} onClose={() => setNotifOpen(false)} />
          )}
        </div>

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