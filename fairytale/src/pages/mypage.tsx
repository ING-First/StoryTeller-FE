// src/pages/Mypage.tsx
import type {FC} from 'react'
import React, {useState, useEffect} from 'react'
import Header from '../components/Header'
import Button from '../components/Button'
import FairyTaleList from '../components/FairyTaleList'
import {Link} from 'react-router-dom' // Import Link

// Mock user data for demonstration
const mockUser = {
  name: 'KKURI',
  isLoggedIn: true
}

type MypageProps = {
  title?: string
}

const Mypage: FC<MypageProps> = ({title}) => {
  const [user, setUser] = useState<{name: string; isLoggedIn: boolean} | null>(null)

  useEffect(() => {
    // Simulate fetching user data from an API after login
    // In a real application, you would fetch data from your backend
    const fetchUserData = () => {
      // Simulate API call delay
      setTimeout(() => {
        setUser(mockUser)
      }, 500)
    }

    fetchUserData()
  }, [])

  if (!user || !user.isLoggedIn) {
    // Show a loading state or redirect if not logged in
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-pink-50">
      <Header />

      {/* User Profile Section */}
      <section className="flex flex-col items-center justify-center w-full max-w-2xl p-6 mx-auto mt-10 bg-white border border-gray-200 shadow-xl rounded-2xl">
        <div className="flex items-center justify-between w-full">
          {/* User Name and Profile Edit Link */}
          <div className="flex-1 text-left">
            <h1 className="text-4xl font-bold text-gray-800">{user.name}</h1>
            <Link
              to="/profile"
              className="mt-2 font-semibold text-pink-500 transition-colors cursor-pointer hover:text-pink-600">
              &gt; 회원 정보 수정하기
            </Link>
          </div>
          {/* Profile Image Placeholder */}
          <div className="flex-shrink-0 w-24 h-24 ml-auto bg-gray-200 border-2 border-pink-300 rounded-full"></div>
        </div>
      </section>

      {/* Buttons Section */}
      <div className="flex justify-center mt-5 space-x-20 font-pinkfong">
        <Button to="/voice_register">목소리 등록하러 가기 &gt;&gt;</Button>
        <Button to="/generate_form">동화 생성하러 가기 &gt;&gt;</Button>
      </div>

      {/* Fairy Tale List */}
      <br />
      <FairyTaleList />
    </div>
  )
}

export default Mypage
