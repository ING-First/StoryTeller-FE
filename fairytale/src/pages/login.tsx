import React from 'react'
// 컴포넌트 정의, 변수 타입을 react functional component로 지정
const LoginPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-pink-50 to-pink-100">
      <div className="bg-white shadow-lg rounded-2xl px-10 py-12 w-full max-w-md">
        {/* Title */}
        <h1
          className="text-4xl font=bold text-center mb-2"
          style={{fontFamily: "'Pacifico', cursive"}}>
          Stroy Teller
        </h1>
        <p className="text-center text-gray-700 font-semibold mb-8">LOG IN</p>

        {/* ID Input */}
        <div className="mb-5">
          <label className="block text-gray-600 mb-1">ID</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>

        {/* Password Input */}
        <div className="mb-5">
          <label className="block text-gray-600 mb-1">Password</label>
          <input
            type="password"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>

        {/* Login Button */}
        <button className="w-full bg-pink-400 text-white py-2 rounded-lg hover:bg-pink-500 transition">
          로그인
        </button>

        {/* Links */}
        <div className="flex justify-center mt-5 space-x-4 text-sm text-gray-500">
          <a href="#" className="hover:text-pink-500">
            아이디 찾기
          </a>
          <a href="#" className="hover:text-pink-500">
            비밀번호 찾기
          </a>
          <a href="#" className="hover:text-pink-500">
            회원가입
          </a>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
