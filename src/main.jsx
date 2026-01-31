import React from 'react'
import ReactDOM from 'react-dom/client'
// import TestApp from './TestApp.jsx'
import FreshKeepApp from './App.jsx'
import './index.css'

console.log('main.jsx loaded');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <FreshKeepApp />
  </React.StrictMode>,
)