// src/components/VoiceRecorder.tsx
import React, {useState, useEffect, useRef} from 'react'
import Button from './Button' // 버튼 컴포넌트 재사용
import { voice_register } from "../api/voice_register";

const VoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [timer, setTimer] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

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

  const handleToggleRecording = async () => {
    if (!isRecording) {
      setTimer(0);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          const file = new File([audioBlob], "recording.webm", { type: "audio/webm" });

          try {
            const res = await voice_register({
              uid: 1,
              audio: file,
            });
            console.log(res);
            alert(res.message)
            window.location.href = "/"
          } catch (err) {
            console.error(err);
            alert("목소리 등록을 실패했습니다.")
            window.location.reload()
          }
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error("마이크 접근 실패:", err);
      }
    } else {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    }
  };

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
