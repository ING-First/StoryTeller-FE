import React, {useState, useEffect, useRef} from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Button from '../components/Button'
import VoiceRecorder from '../components/VoiceRecorder'

const VoiceRegister = () => {
  const [isRecording, setIsRecording] = useState(false)
  const navigate = useNavigate()
  const hasCheckedLogin = useRef(false)

  useEffect(() => {
      if (hasCheckedLogin.current) return
      hasCheckedLogin.current = true
  
      const uid = localStorage.getItem('uid')
      if (!uid) {
        alert("로그인이 필요합니다.")
        navigate('/')
      }
    }, [navigate])
  const handleStartRecording = () => {
    setIsRecording(true) // 버튼 클릭 시 상태를 true로 변경
  }

  return (
    <div className="min-h-screen bg-pink-50">
      <Header />
      <div className="container mx-auto p-4">
        <div className="text-center py-20 flex flex-col items-center">
          <div className="w-3/4 max-w-4xl mx-auto">
            <p className="font-pinkfong text-5xl font-extrabold leading-tight">
              엄마, 아빠의 목소리로 읽어주어요!
            </p>
          </div>
        </div>
      </div>
       <section className="mt-10 p-6 bg-white rounded-2xl shadow-xl border border-gray-200">
          <VoiceRecorder />
        </section>
    </div>
  )
}

export default VoiceRegister
