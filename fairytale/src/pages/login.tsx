import React from 'react'

const LoginPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-pink-50 to-pink-100">
      <div className="w-full max-w-md px-8 py-10">
        {/* Title */}
        <div className="text-2xl text-center cursor-pointer font-child">Story Teller</div>
        <p className="mb-10 font-semibold text-center text-gray-700">LOG IN</p>

        {/* ID Input */}
        <div className="mb-6">
          <label className="block mb-2 text-gray-700">ID</label>
          <input
            type="text"
            placeholder="Enter your ID"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>

        {/* Password Input */}
        <div className="mb-6">
          <label className="block mb-2 text-gray-700">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>

        {/* Links */}
        <div className="flex justify-center mt-6 space-x-6 text-sm text-gray-600">
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
