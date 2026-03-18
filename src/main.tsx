// CashPilot 앱 엔트리 포인트
// StrictMode로 개발 시 잠재적 문제 감지
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
