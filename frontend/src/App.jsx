import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import HealthCheck from './HealthCheck'
import Login from './features/auth/Login.jsx';
import Signup from './features/auth/Signup.jsx';
import ProtectedRoute from './routes/ProtectedRoute';
import NotFound from './components/pages/NotFound.jsx';
import RoleRoute from './routes/RoleRoute'
import Unauthorized from './components/pages/Unauthorized.jsx';
import { useDispatch } from 'react-redux'
import useAuth from './hooks/useAuth'
import { useEffect } from 'react'
import { fetchCurrentUser } from './store/slices/authSlice'
import AppLayout from './components/layouts/AppLayout.jsx';
import Dashboard from './features/dashboard/Dashboard.jsx';
import Projects from './features/projects/Projects.jsx';
import ProjectDetail from './features/projects/ProjectDetail.jsx';
import Tasks from './features/tasks/Tasks.jsx';
import Users from './features/users/Users.jsx';
import Settings from './features/settings/Setting.jsx';
import Analytics from './features/analytics/Analytics.jsx';
import useSocket from './socket/useSocket.js';


// placeholder pages — will be replaced in upcoming phases


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
          { path: "/projects/:id", element: <ProjectDetail /> },
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

  useSocket();

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
