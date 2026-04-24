import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import HealthCheck from './HealthCheck'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ProtectedRoute from './routes/ProtectedRoute'
import NotFound from './pages/NotFound'
import RoleRoute from './routes/RoleRoute'
import Unauthorized from './pages/Unauthorized'
import { useDispatch } from 'react-redux'
import useAuth from './hooks/useAuth'
import { useEffect } from 'react'
import { fetchCurrentUser } from './store/slices/authSlice'
import AppLayout from './layouts/AppLayout'
import Dashboard from './pages/Dashboard'


// placeholder pages — will be replaced in upcoming phases
const Projects = () => <div style={{ padding: "2rem", color: "#111" }}>Projects</div>;
const Tasks = () => <div style={{ padding: "2rem", color: "#111" }}>Tasks</div>;
const Analytics = () => <div style={{ padding: "2rem", color: "#111" }}>Analytics</div>;
const Settings = () => <div style={{ padding: "2rem", color: "#111" }}>Settings</div>;
const Users = () => <div style={{ padding: "2rem", color: "#111" }}>User Management</div>;


const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  { path: "/unauthorized", element: <Unauthorized /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/dashboard", element: <Dashboard /> },
          { path: "/projects", element: <Projects /> },
          { path: "/tasks", element: <Tasks /> },
          { path: "/analytics", element: <Analytics /> },
          { path: "/settings", element: <Settings /> },
          {
            element: <RoleRoute allowedRoles={["Admin"]} />,
            children: [
              { path: "/users", element: <Users /> },
            ],
          },
        ],
      },
    ],
  },
  { path: "/", element: <Login /> },
  { path: "*", element: <NotFound /> },
]);


const AppInitializer = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, userLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCurrentUser());
    }
  }, []);

  // wait for user to be fetched before rendering routes
  if (isAuthenticated && userLoading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f3f4f6"
      }}>
        <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>Loading...</p>
      </div>
    );
  }

  return <RouterProvider router={router} />;
};

function App() {
  
  return (
    <>
      <AppInitializer />
    </>
  )
}

export default App
