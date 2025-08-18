import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App' // 컴포넌트
import reportWebVitals from './reportWebVitals'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  // React.StrictMode 코드가 잘못되었는지 판단
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals() // 앱의 성능 측정
