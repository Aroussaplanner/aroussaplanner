import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'

// Globale stijlen
const stijl = document.createElement('style')
stijl.textContent = `
  *, *::before, *::after {
    box-sizing: border-box;
  }

  html, body {
    margin: 0;
    padding: 0;
    background: #F7F2EA;
    font-family: 'Montserrat', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2D2520;
  }

  input, select, textarea, button {
    font-family: 'Montserrat', sans-serif;
  }

  a {
    color: inherit;
  }

  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: #F7F2EA;
  }

  ::-webkit-scrollbar-thumb {
    background: #C4A882;
    border-radius: 3px;
  }
`
document.head.appendChild(stijl)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
