import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import Store from './store/Store.js'
import { ToastContainer } from 'react-toastify'
import { ThemeProvider } from './context/ThemeContext.jsx'

createRoot(document.getElementById('root')).render(
    <Provider store={Store}>
      <ThemeProvider>
        <App />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          theme="colored"
        />
      </ThemeProvider>
    </Provider>
)
