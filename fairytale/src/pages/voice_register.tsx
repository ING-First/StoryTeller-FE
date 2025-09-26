import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import VoiceRecorder from '../components/VoiceRecorder'

interface ConsentItem {
  id: number
  title: string
  contents: string
  status: '(필수)' | '(선택)'
}

const VoiceRegister: React.FC = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [showConsentModal, setShowConsentModal] = useState<boolean>(true)
  const [checkItems, setCheckItems] = useState<number[]>([])
  const navigate = useNavigate()
  const hasCheckedLogin = useRef<boolean>(false)

  const data: ConsentItem[] = [
    {
      id: 0,
      title: '멤버십 이용약관 동의',
      contents: '멤버십 필수 약관에 동의합니다.',
      status: '(필수)',
    },
    {
      id: 1,
      title: '개인정보 수집 및 이용 동의',
      contents: '반갑습니다',
      status: '(필수)',
    },
    {
      id: 2,
      title: 'SMS 및 광고성 정보 수신 동의',
      contents: '선택입니다',
      status: '(선택)',
    }
  ]

  const requiredIds = data.filter(d => d.status === '(필수)').map(d => d.id)
  const isAllRequiredChecked = requiredIds.every(id => checkItems.includes(id))

  useEffect(() => {
    if (hasCheckedLogin.current) return
    hasCheckedLogin.current = true

    const uid = localStorage.getItem('uid')
    if (!uid) {
      alert("로그인이 필요합니다.")
      navigate('/')
    }
  }, [navigate])

  const handleCheck = (checked: boolean, id: number) => {
    if (checked) {
      setCheckItems(prev => [...prev, id])
    } else {
      setCheckItems(prev => prev.filter(item => item !== id))
    }
  }

  const handleAgree = () => {
    if (!isAllRequiredChecked) {
      alert("필수 약관에 모두 동의해주세요.")
      return
    }
    setShowConsentModal(false)
    setIsRecording(true)
  }

  return (
    <div className="relative min-h-screen bg-pink-50">
      <Header />
      <div className="container p-4 mx-auto">
        <div className="flex flex-col items-center py-20 text-center">
          <div className="w-3/4 max-w-4xl mx-auto">
            <p className="text-5xl font-extrabold leading-tight font-pinkfong">
              엄마, 아빠의 목소리로 읽어주어요!
            </p>
          </div>
        </div>
      </div>

      {/* 약관 동의 모달 */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="p-6 bg-white shadow-lg rounded-xl w-[90%] max-w-xl text-left">
            <h2 className="mb-4 text-xl font-bold text-center">약관 동의</h2>
            {data.map(item => (
              <div key={item.id} className="p-3 mb-4 border rounded">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={checkItems.includes(item.id)}
                    onChange={(e) => handleCheck(e.target.checked, item.id)}
                    className="mr-2"
                  />
                  <span className={`mr-2 ${item.status === '(필수)' ? 'text-red-500' : 'text-gray-500'}`}>
                    {item.status}
                  </span>
                  {item.title}
                </label>
                <p className="mt-2 text-sm text-gray-700">{item.contents}</p>
              </div>
            ))}
            <button
              className={`w-full py-2 mt-4 rounded text-white ${isAllRequiredChecked ? 'bg-pink-500 hover:bg-pink-600' : 'bg-gray-400 cursor-not-allowed'}`}
              onClick={handleAgree}
              disabled={!isAllRequiredChecked}
            >
              동의하고 시작하기
            </button>
          </div>
        </div>
      )}

      {/* 녹음 기능은 동의 후에만 보여짐 */}
      {!showConsentModal && (
        <section className="p-6 mt-10 bg-white border border-gray-200 shadow-xl rounded-2xl">
          <VoiceRecorder />
        </section>
      )}
    </div>
  )
}

export default VoiceRegister

// ========================= 이전 코드 (약관 동의 모달 없음) =========================


// import React, {useState, useEffect, useRef} from 'react'
// import { useNavigate } from 'react-router-dom'
// import Header from '../components/Header'
// import Button from '../components/Button'
// import VoiceRecorder from '../components/VoiceRecorder'

// const VoiceRegister = () => {
//   const [isRecording, setIsRecording] = useState(false)
//   const navigate = useNavigate()
//   const hasCheckedLogin = useRef(false)

//   useEffect(() => {
//       if (hasCheckedLogin.current) return
//       hasCheckedLogin.current = true
  
//       const uid = localStorage.getItem('uid')
//       if (!uid) {
//         alert("로그인이 필요합니다.")
//         navigate('/')
//       }
//     }, [navigate])
//   const handleStartRecording = () => {
//     setIsRecording(true) // 버튼 클릭 시 상태를 true로 변경
//   }

//   return (
//     <div className="min-h-screen bg-pink-50">
//       <Header />
//       <div className="container p-4 mx-auto">
//         <div className="flex flex-col items-center py-20 text-center">
//           <div className="w-3/4 max-w-4xl mx-auto">
//             <p className="text-5xl font-extrabold leading-tight font-pinkfong">
//               엄마, 아빠의 목소리로 읽어주어요!
//             </p>
//           </div>
//         </div>
//       </div>
//        <section className="p-6 mt-10 bg-white border border-gray-200 shadow-xl rounded-2xl">
//           <VoiceRecorder />
//         </section>
//     </div>
//   )
// }

// export default VoiceRegister
