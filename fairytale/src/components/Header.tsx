import React, {useState} from 'react'
import {Link, useNavigate} from 'react-router-dom' // Link 컴포넌트 사용

const Header = () => {
  // 로그인 상태를 관리하는 상태 변수, 실제 앱에서는 인증 로직으로 이 값을 설정
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const navigate = useNavigate()

  // 로그인/로그아웃 상태를 전환하는 임시 함수
  const handleLoginToggle = () => {
    setIsLoggedIn(!isLoggedIn)
  }
  const goToSignup = () => {
    navigate('/signup')
  }

  return (
    <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
      {/* 로고 */}
      <Link to="/">
        <div className="text-2xl cursor-pointer font-child">Story Teller</div>
      </Link>

      {/* 로그인 상태에 따라 다른 UI 렌더링 */}
      <div className="flex items-center space-x-4">
        {isLoggedIn ? (
          // 로그인 후
          <nav className="flex items-center space-x-4 font-medium text-gray-600">
            <a href="#" className="hover:text-gray-900">
              Mypage
            </a>
            <a href="#" className="hover:text-gray-900">
              kkuri
            </a>{' '}
            {/* 로그인한 사용자 이름 */}
            <button
              onClick={handleLoginToggle}
              className="px-4 py-2 font-semibold text-gray-800 transition-colors border border-gray-300 rounded-lg hover:bg-gray-100">
              Logout
            </button>
          </nav>
        ) : (
          // 로그아웃 상태
          <nav className="flex items-center space-x-4 font-medium text-gray-600">
            <a href="#" className="hover:text-gray-900">
              Mypage
            </a>
            <a href="/login" className="hover:text-gray-900">
              Login
            </a>
            <button
              onClick={goToSignup}
              className="px-4 py-2 font-semibold text-gray-800 transition-colors border border-gray-300 rounded-lg hover:bg-gray-100">
              Sign Up
            </button>
          </nav>
        )}
      </div>
    </header>
  )
}

export default Header
