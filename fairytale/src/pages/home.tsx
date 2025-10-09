// src/pages/home.tsx
import type {FC} from 'react'
import {useEffect, useState} from 'react'
import {useLocation} from 'react-router-dom'
import Header from '../components/Header'
import Button from '../components/Button'
import FairyTaleCarousel from '../components/FairyTaleCarousel'

const Home: FC = () => {
  const location = useLocation()
  const [refreshKey, setRefreshKey] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // 로그인 상태 변경 감지
  useEffect(() => {
    const token = localStorage.getItem('token')
    const uid = localStorage.getItem('uid')
    const currentLoginStatus = !!(token && uid)

    // 이전 로그인 상태와 다를 때만 갱신
    setIsLoggedIn(prevStatus => {
      if (prevStatus !== currentLoginStatus) {
        console.log('로그인 상태 변경:', prevStatus, '→', currentLoginStatus)
        setRefreshKey(prev => prev + 1)
        return currentLoginStatus
      }
      return prevStatus
    })
  }, [location])

  useEffect(() => {
    if (location.state?.alert) {
      alert(location.state.alert)
      window.history.replaceState({}, document.title)
    }
  }, [location])

  return (
    <div className="min-h-screen bg-pink-50">
      <Header />
      <div className="container p-4 mx-auto">
        <div className="flex flex-col items-center py-20 text-center">
          <div className="w-3/4 max-w-4xl mx-auto">
            <p className="text-6xl font-extrabold leading-tight text-left text-gray-800 font-pinkfong">
              내 아이만을 위한 동화책,
            </p>
            <p className="mt-2 ml-auto mr-10 text-6xl font-extrabold leading-tight text-gray-800 font-pinkfong">
              엄마, 아빠의 목소리로 읽어주세요!
            </p>
          </div>
        </div>

        <div className="flex justify-center mt-5 space-x-20 font-pinkfong">
          <Button to="/voice_register">목소리 등록하러 가기 &gt;&gt;</Button>
          <Button to="/generate_form">동화 생성하러 가기 &gt;&gt;</Button>
        </div>
        <br />

        {/* key만 넘겨서 강제 리마운트 */}
        <FairyTaleCarousel key={refreshKey} />
      </div>
    </div>
  )
}

export default Home
