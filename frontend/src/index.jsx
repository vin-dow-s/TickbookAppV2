//Modules
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

//Styles
import GlobalStyle from './styles/global-styles'
import 'normalize.css'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'

//Component
import App from './App'
import { BrowserRouter } from 'react-router-dom'

/**
 * @file Entry point of the application.
 * GlobalStyle: global styles for consistent theming
 * App: main component of the application
 * ToastContainer: container for toast notifications
 */
ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <GlobalStyle />
            <App />
            <ToastContainer />
        </BrowserRouter>
    </React.StrictMode>
)
