import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  BarChart2,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
} from "lucide-react";
import useAuth from "../../hooks/useAuth.js";
import { ROLES } from "../../utils/constants.js";
import { toast } from "react-toastify";
import "./Sidebar.css";

const navLinks = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE],
  },
  {
    label: "Projects",
    path: "/projects",
    icon: FolderKanban,
    roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE],
  },
  {
    label: "Tasks",
    path: "/tasks",
    icon: CheckSquare,
    roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE],
  },
  {
    label: "Analytics",
    path: "/analytics",
    icon: BarChart2,
    roles: [ROLES.ADMIN, ROLES.MANAGER],
  },
  {
    label: "Users",
    path: "/users",
    icon: Users,
    roles: [ROLES.ADMIN],
  },
  {
    label: "Settings",
    path: "/settings",
    icon: Settings,
    roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE],
  },
];

const Sidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const filteredLinks = navLinks.filter((link) =>
    link.roles.includes(user?.role)
  );

  const handleNavClick = () => {
    // close mobile sidebar on nav click
    if (mobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/*  Mobile Overlay  */}
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`sidebar
          ${collapsed ? "sidebar-collapsed" : ""}
          ${mobileOpen ? "sidebar-mobile-open" : ""}
        `}
      >
        {/*  Brand  */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">EW</div>
          {!collapsed && (
            <span className="sidebar-brand-name">Enterprise WMS</span>
          )}

          {/* Close button — mobile only */}
          <button
            className="sidebar-mobile-close"
            onClick={() => setMobileOpen(false)}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/*  Nav Links  */}
        <nav className="sidebar-nav">
          {filteredLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
                }
              >
                <Icon className="sidebar-link-icon" size={20} />
                {!collapsed && (
                  <span className="sidebar-link-label">{link.label}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/*  Footer  */}
        <div className="sidebar-footer">
          {!collapsed && (
            <div className="sidebar-user">
              <div className="sidebar-user-avatar">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">{user?.name}</span>
                <span className="sidebar-user-role">{user?.role}</span>
              </div>
            </div>
          )}
          <button
            className="sidebar-logout"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>

        {/*  Desktop Collapse Toggle  */}
        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed((prev) => !prev)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>
    </>
  );
};

export default Sidebar;