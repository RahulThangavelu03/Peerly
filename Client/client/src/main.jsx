import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

createRoot(document.getElementById('root')).render(

    
    <App />

)
