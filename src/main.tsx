import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import PoseLab from './pose-lab/PoseLab'
import { setupAvatarBridge } from './bridge/avatarBridge'

const root = createRoot(document.getElementById('root')!)

const render = () => {
  const params = new URLSearchParams(window.location.search)
  const mode = params.get('mode')

  root.render(
  <StrictMode>
      {mode === 'pose-lab' ? <PoseLab /> : <App />}
  </StrictMode>,
)
}

setupAvatarBridge()
render()
