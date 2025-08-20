import type {FC} from 'react'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../components/Header'
import Button from '../components/Button'
import FairyTaleList from '../components/FairyTaleList'
import FairyTaleCarousel from '../components/FairyTaleCarousel'

const Home: FC = () => {
  const location = useLocation()
  
  useEffect(() => {
    if (location.state?.alert) {
      alert(location.state.alert)
      window.history.replaceState({}, document.title) // state 초기화
    }
  }, [location])

  return (
    <div className="min-h-screen bg-pink-50">
      <Header />
      <div className="container p-4 mx-auto">
        <div className="flex flex-col items-center py-20 text-center">
          <div className="w-3/4 max-w-4xl mx-auto">
            <p className="text-4xl font-extrabold leading-tight text-left text-gray-800 font-pinkfong">
              내 아이만을 위한 동화책,
            </p>
            {/* 두 번째 줄: 왼쪽 마진을 최대로 주고 오른쪽 마진으로 여백 조절 */}
            <p className="mt-2 ml-auto mr-10 text-4xl font-extrabold leading-tight text-gray-800 font-pinkfong">
              엄마, 아빠의 목소리로 읽어주세요!
            </p>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex justify-center mt-5 space-x-20 font-pinkfong">
          <Button to="/voice_register">목소리 등록하러 가기 &gt;&gt;</Button>
          <Button to="/generate_form">동화 생성하러 가기 &gt;&gt;</Button>
        </div>
        <br />
        <FairyTaleCarousel />
      </div>
    </div>
  )
}

export default Home
