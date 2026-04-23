import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import HealthCheck from './HealthCheck'

const router = createBrowserRouter([
  {
    path : "/",
    element : <HealthCheck />
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
