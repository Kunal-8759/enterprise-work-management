import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import HealthCheck from './HealthCheck'
import Login from './pages/Login'
import Signup from './pages/Signup'

const router = createBrowserRouter([
  {
    path : "/health",
    element : <HealthCheck />
  },
  {
    path : "/" ,
    element : <Login/>
  },
  {
    path : "/login",
    element : <Login/>
  },
  {
    path : "/signup",
    element : <Signup/>
  },
  {
    path : "/logout",
    element : <h2 style={{ textAlign: "center", marginTop: "2rem" , color : 'white'}}>Logout Page</h2>
  },
  {
    path : "/dashboard",
    element : <h2 style={{ textAlign: "center", marginTop: "2rem" , color : 'white'}}>Dashboard Page</h2>
  }
])

function App() {
  
  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
