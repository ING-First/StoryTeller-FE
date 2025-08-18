import type {FC} from 'react'
import Header from '../components/Header'
import Button from '../components/Button'
import FairyTaleList from '../components/FairyTaleList'

const Home: FC = () => {
  return (
    <div className="min-h-screen bg-pink-50">
      <Header />
      <div className="container mx-auto p-4">
        <div className="text-center py-20 flex flex-col items-center">
          <div className="w-3/4 max-w-4xl mx-auto">
            <p className="font-pinkfong text-left text-4xl font-extrabold text-gray-800 leading-tight">
              내 아이만을 위한 동화책,
            </p>
            {/* 두 번째 줄: 왼쪽 마진을 최대로 주고 오른쪽 마진으로 여백 조절 */}
            <p className="font-pinkfong ml-auto mr-10 text-4xl font-extrabold text-gray-800 leading-tight mt-2">
              엄마, 아빠의 목소리로 읽어주세요!
            </p>
          </div>
        </div>

        {/* 버튼 */}
        <div className="font-pinkfong mt-5 flex justify-center space-x-20">
          <Button to="/voice_register">목소리 등록하러 가기 &gt;&gt;</Button>
          <Button to="/generate_form">동화 생성하러 가기 &gt;&gt;</Button>
        </div>
        <br />
        <FairyTaleList />
      </div>
    </div>
  )
}

export default Home
