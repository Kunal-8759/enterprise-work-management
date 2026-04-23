import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";

const RoleRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  console.log("RoleRoute - user:", user);
  console.log("RoleRoute - isAuthenticated:", isAuthenticated);
  console.log("RoleRoute - allowedRoles:", allowedRoles);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return null;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;  