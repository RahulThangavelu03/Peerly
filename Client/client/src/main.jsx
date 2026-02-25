import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { io } from "socket.io-client";
 import { ErrorBoundary } from "react-error-boundary";
import ErrorFallbackComponent from './Components/ErrorFallbackComponent.jsx';



const socket = io("http://localhost:5000");

createRoot(document.getElementById('root')).render(

   <ErrorBoundary FallbackComponent={ErrorFallbackComponent}>
    <App />
    </ErrorBoundary> 

)
