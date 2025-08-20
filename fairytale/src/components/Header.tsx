import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("name");
    if (token && name) {
      setIsLoggedIn(true);
      setUsername(name);
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
            <a href="/profile" className="hover:text-gray-900">
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
