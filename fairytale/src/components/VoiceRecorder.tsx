// src/components/VoiceRecorder.tsx
import React, { useState, useEffect, useRef } from 'react'
import Button from './Button'
import { voice_register } from '../api/voice_register'

// 🎯 브라우저별 지원 MIME 타입 자동 선택
const pickSupportedMime = (): string => {
  const userAgent = navigator.userAgent.toLowerCase()

  // Safari 전용 분기 (WebM 미지원)
  if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
    return 'audio/mp4;codecs=mp4a.40.2'
  }

  const candidates = [
    'audio/webm;codecs=opus',   // Chrome / Edge
    'audio/webm',               // 구형 브라우저
    'audio/mp4;codecs=mp4a.40.2' // Safari fallback
  ]
  const isSupported = (t: string) =>
    (window as any).MediaRecorder?.isTypeSupported?.(t)
  return candidates.find(isSupported) || ''
}

const VoiceRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [timer, setTimer] = useState(0)
  const [loading, setLoading] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  // ⏱ 타이머 동작
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isRecording) {
      interval = setInterval(() => setTimer((prev) => prev + 1), 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRecording])

  // 🎙️ 녹음 시작 / 종료
  const handleToggleRecording = async () => {
    if (!isRecording) {
      setTimer(0)
      try {
        // 마이크 접근
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        console.log('🎤 Tracks:', stream.getAudioTracks())
        const track = stream.getAudioTracks()[0]
        console.log('🎤 enabled:', track.enabled, 'muted:', (track as any).muted)

        streamRef.current = stream

        const mimeType = pickSupportedMime()
        const mediaRecorder = mimeType
          ? new MediaRecorder(stream, { mimeType })
          : new MediaRecorder(stream)

        console.log('[REC] 🎤 chosen mimeType:', mimeType || mediaRecorder.mimeType)
        console.log('[REC] 🎤 stream tracks:', stream.getAudioTracks())

        mediaRecorderRef.current = mediaRecorder
        audioChunksRef.current = []

        // 오디오 조각 수집
        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data)
            console.log('[REC] chunk received:', event.data.size)
          }
        }

        // 녹음 종료 후 처리
        mediaRecorder.onstop = async () => {
          const finalType =
            mimeType || mediaRecorderRef.current?.mimeType || 'application/octet-stream'
          const audioBlob = new Blob(audioChunksRef.current, { type: finalType })
          const ext = audioBlob.type.includes('mp4') ? 'm4a' : 'webm'
          const fileName = `recording.${ext}`
          const file = new File([audioBlob], fileName, { type: finalType })

          console.log('[REC] ✅ blob.type:', audioBlob.type)
          console.log('[REC] ✅ blob.size:', audioBlob.size)
          console.log('[REC] ✅ blob.length:', audioChunksRef.current.length)

          if (audioBlob.size === 0) {
            alert('⚠️ 녹음된 오디오가 없습니다. 마이크 설정을 확인해주세요.')
            return
          }

          // (선택) 재생 테스트
          const audioURL = URL.createObjectURL(audioBlob)
          const preview = new Audio(audioURL)
          preview.play().catch(() => console.warn('자동 재생 차단됨'))

          try {
            setLoading(true)
            const uid = Number(localStorage.getItem('uid') || 0)
            const res = await voice_register({ uid, audio: file })
            console.log('API 응답:', res)
            alert(res.message || '사용자 음성 등록 성공 🎉')
            window.location.href = '/'
          } catch (err: any) {
            console.error('❌ 목소리 등록 에러:', err)
            const errorMessage =
              err?.response?.data?.detail || '목소리 등록을 실패했습니다.'
            alert(errorMessage)
          } finally {
            setLoading(false)
            stream.getTracks().forEach((t) => t.stop())
          }
        }

        // 💡 1초마다 chunk 저장 (무음 방지 핵심)
        mediaRecorder.start(1000)
        setIsRecording(true)
      } catch (err) {
        console.error('❌ 마이크 접근 실패:', err)
        alert('마이크 접근에 실패했습니다. 브라우저 설정에서 마이크 권한을 허용해주세요.')
      }
    } else {
      mediaRecorderRef.current?.stop()
      setIsRecording(false)
    }
  }

  // ⏱ 시간 포맷팅
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
        {/* 안내 텍스트 */}
        <p className="font-pinkfong text-4xl font-extrabold text-gray-800 leading-tight">
          10초 이상 말씀해주세요.
        </p>
        <p className="font-pinkfong text-4xl font-extrabold text-gray-800 leading-tight">
          ex. "안녕하세요, 저는 OOO입니다."
        </p>

        {/* 녹음 파형 */}
        <div className="my-10">
          <img
            src="/assets/frequency.png"
            alt="Voice Waveform"
            className="w-48 h-24"
          />
        </div>

        {/* 타이머 & 상태 표시 */}
        <div className="flex items-center space-x-4">
          <div
            className={`w-4 h-4 rounded-full ${
              isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'
            }`}
          ></div>
          <span className="text-red-500 text-3xl font-bold">
            {formatTime(timer)}
          </span>
        </div>

        {/* 버튼 */}
        <div className="font-pinkfong mt-10 flex justify-center space-x-20">
          <Button onClick={handleToggleRecording}>
            {isRecording ? '녹음 완료' : '녹음 시작'}
          </Button>
        </div>
      </div>

      {/* 로딩 오버레이 */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50">
          <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
          <p className="mt-6 text-white text-xl font-bold">목소리 등록중이에요...</p>
        </div>
      )}
    </section>
  )
}

export default VoiceRecorder