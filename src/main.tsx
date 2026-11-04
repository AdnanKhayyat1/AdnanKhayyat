import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { Blog } from './Blog.tsx'
import '@fontsource-variable/inter'
import './index.css'

const Portfolio = lazy(() => import('./App.tsx'))
const isThoughtsPage = /^\/blog\/?$/.test(window.location.pathname)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isThoughtsPage ? <Blog /> : <Suspense fallback={null}><Portfolio /></Suspense>}
  </StrictMode>,
)
