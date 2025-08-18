import React, {useState} from 'react'
import {Link} from 'react-router-dom' // Link 컴포넌트 사용

const Header = () => {
  // 로그인 상태를 관리하는 상태 변수, 실제 앱에서는 인증 로직으로 이 값을 설정
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // 로그인/로그아웃 상태를 전환하는 임시 함수
  const handleLoginToggle = () => {
    setIsLoggedIn(!isLoggedIn)
  }

  return (
    <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
      {/* 로고 */}
      <Link to="/">
        <div className="font-child text-2xl cursor-pointer">Story Teller</div>
      </Link>

      {/* <Link to="/">
        <img
          src="/assets/logo.png"
          alt="Story Teller Logo"
          className="h-20 cursor-pointer"
        />
      </Link> */}

      {/* 로그인 상태에 따라 다른 UI 렌더링 */}
      <div className="flex items-center space-x-4">
        {isLoggedIn ? (
          // 로그인 후
          <nav className="flex items-center space-x-4 text-gray-600 font-medium">
            <a href="#" className="hover:text-gray-900">
              Mypage
            </a>
            <a href="#" className="hover:text-gray-900">
              kkuri
            </a>{' '}
            {/* 로그인한 사용자 이름 */}
            <button
              onClick={handleLoginToggle}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-800 font-semibold hover:bg-gray-100 transition-colors">
              Logout
            </button>
          </nav>
        ) : (
          // 로그아웃 상태
          <nav className="flex items-center space-x-4 text-gray-600 font-medium">
            <a href="#" className="hover:text-gray-900">
              Mypage
            </a>
            <a href="#" className="hover:text-gray-900">
              Login
            </a>
            <button
              onClick={handleLoginToggle}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-800 font-semibold hover:bg-gray-100 transition-colors">
              Sign Up
            </button>
          </nav>
        )}
      </div>
    </header>
  )
}

export default Header
