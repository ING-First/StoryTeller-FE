import React from 'react'

const SignUpPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-pink-50 to-pink-100">
      <div className="w-full max-w-md px-10 py-12 bg-white shadow-lg rounded-2xl">
        {/* Title */}
        <div className="text-2xl text-center cursor-pointer font-child">Story Teller</div>

        <p className="mb-8 font-semibold text-center text-gray-700">Sign Up</p>

        {/* ID */}
        <div className="mb-5">
          <label className="block mb-1 text-gray-600">ID*</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>

        {/* Password */}
        <div className="mb-5">
          <label className="block mb-1 text-gray-600">Password*</label>
          <input
            type="password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>

        {/* Password 확인 */}
        <div className="mb-5">
          <label className="block mb-1 text-gray-600">Password 확인*</label>
          <input
            type="password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>

        {/* Address */}
        <div className="mb-5">
          <label className="block mb-1 text-gray-600">Address*</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>

        {/* Nickname */}
        <div className="mb-5">
          <label className="block mb-1 text-gray-600">Nickname*</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>

        {/* Sign Up Button */}
        <button className="w-full py-2 text-white transition bg-pink-400 rounded-lg hover:bg-pink-500">
          회원가입
        </button>

        {/* Links */}
        <div className="flex justify-center mt-5 text-sm text-gray-500">
          <a href="#" className="hover:text-pink-500">
            로그인으로 돌아가기
          </a>
        </div>
      </div>
    </div>
  )
}

export default SignUpPage
