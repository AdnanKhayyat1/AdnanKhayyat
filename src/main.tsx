import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Thoughts } from './Thoughts.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Thoughts />
    <App />
  </StrictMode>,
)
