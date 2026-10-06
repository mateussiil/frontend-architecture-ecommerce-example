import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import { composeApp } from './app/composition'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App app={composeApp()} />
  </StrictMode>,
)
