import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";


const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("name");

    if (token && name) {
      try {
        const decoded = jwtDecode(token);
        const now = Date.now() / 1000; // 초 단위

        if (decoded.exp && decoded.exp < now) {
          // 토큰 만료됨
          alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.')
          handleLogout();
        } else {
          setIsLoggedIn(true);
          setUsername(name);

          // 만료되기 직전에 자동 로그아웃 예약
          const timeout = decoded.exp
            ? (decoded.exp - now) * 1000
            : 0;
          const timer = setTimeout(() => {
            handleLogout();
          }, timeout);

          return () => clearTimeout(timer);
        }
      } catch (error) {
        console.error("토큰 파싱 실패:", error);
        handleLogout();
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("uid");
    localStorage.removeItem("name");
    setIsLoggedIn(false);
    navigate("/");
  };

  const goToSignup = () => {
    navigate("/signup");
  };

  return (
    <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
      <Link to="/">
        <div className="text-2xl cursor-pointer font-child">Story Teller</div>
      </Link>

      <div className="flex items-center space-x-4">
        {isLoggedIn ? (
          <nav className="flex items-center space-x-4 font-medium text-gray-600">
            <a href="/mypage" className="hover:text-gray-900">
              Mypage
            </a>
            <span className="text-gray-700">{username}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 font-semibold text-gray-800 transition-colors border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Logout
            </button>
          </nav>
        ) : (
          <nav className="flex items-center space-x-4 font-medium text-gray-600">
            <a href="/login" className="hover:text-gray-900">
              Login
            </a>
            <button
              onClick={goToSignup}
              className="px-4 py-2 font-semibold text-gray-800 transition-colors border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Sign Up
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
