// src/components/VoiceRecorder.tsx
import React, {useState, useEffect} from 'react'
import Button from './Button' // 버튼 컴포넌트 재사용

const VoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [timer, setTimer] = useState(0)

  // 타이머 로직
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isRecording) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1)
      }, 1000)
    } else if (!isRecording && timer !== 0) {
      if (interval) {
        clearInterval(interval)
      }
    }
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isRecording, timer])

  const handleToggleRecording = () => {
    setIsRecording(prev => !prev)
    if (!isRecording) {
      setTimer(0)
      // TODO: 여기서 실제 녹음 시작 API 호출
    } else {
      // TODO: 여기서 녹음 중지 및 데이터 처리
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
      .toString()
      .padStart(2, '0')
    const seconds = (time % 60).toString().padStart(2, '0')
    return `${minutes}:${seconds}`
  }

  return (
    <section className="mt-10 p-6 bg-white rounded-2xl shadow-xl border border-gray-200">
      <div className="text-center py-10 flex flex-col items-center">
        {/* 녹음 안내 텍스트 */}
        <p className="font-pinkfong text-4xl font-extrabold text-gray-800 leading-tight">
          10초 이상 말씀해주세요.
        </p>
        <p className="font-pinkfong text-4xl font-extrabold text-gray-800 leading-tight">
          ex. "안녕하세요, 저는 OOO입니다."
        </p>

        {/* 녹음 파형 (임시 이미지) */}
        <div className="my-10">
          <img src="/assets/frequency.png" alt="Voice Waveform" className="w-48 h-24" />
        </div>

        {/* 타이머 및 녹음 상태 */}
        <div className="flex items-center space-x-4">
          <div
            className={`w-4 h-4 rounded-full ${
              isRecording ? 'bg-red-500' : 'bg-gray-400'
            }`}></div>
          <span className="text-red-500 text-3xl font-bold">{formatTime(timer)}</span>
        </div>

        {/* 녹음 시작/종료 버튼 */}
        <div className="font-pinkfong mt-10 flex justify-center space-x-20">
          <Button onClick={handleToggleRecording}>
            {isRecording ? '녹음 중지' : '녹음 시작'}
          </Button>
        </div>
      </div>
    </section>
  )
}

export default VoiceRecorder
