import React from 'react'
import {BrowserRouter} from 'react-router-dom'
import RoutesSetup from './routes/RoutesSetup'

export default function App() {
  return (
    <BrowserRouter>
      <RoutesSetup />
    </BrowserRouter>
  )
}

// import React, {useState} from 'react'
// import axios from 'axios'

// const App: React.FC = () => {
//   const [message, setMessage] = useState('')
//   const [loading, setLoading] = useState(false)

//   const fetchMessage = async () => {
//     setLoading(true)
//     try {
//       const response = await axios.get('https://75defe309941.ngrok-free.app/', {
//         headers: {
//           'ngrok-skip-browser-warning': '69420'
//         }
//       })
//       console.log('서버 응답:', response.data)
//       setMessage(response.data)
//     } catch (error) {
//       console.error('에러 발생:', error)
//       setMessage('서버 연결 실패 😢')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div style={{padding: '2rem', fontFamily: 'sans-serif', textAlign: 'center'}}>
//       <h1>Flask 연결 테스트 🔌</h1>
//       <button onClick={fetchMessage} disabled={loading}>
//         {loading ? '불러오는 중...' : '서버에서 메시지 받기'}
//       </button>
//       <div style={{marginTop: '2rem', fontSize: '1.2rem'}}>
//         <strong>응답:</strong> {message}
//       </div>
//     </div>
//   )
// }

// export default App
