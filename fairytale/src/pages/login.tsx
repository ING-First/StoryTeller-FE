import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";

const LoginPage: React.FC = () => {
  const [id, setId] = useState("");
  const [passwd, setPasswd] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await login({ id, passwd });
      localStorage.setItem("uid", res.uid);
      localStorage.setItem("name", res.name)
      localStorage.setItem("token", res.access_token);

      navigate("/");
    } catch (err) {
      setError("아이디/비밀번호 확인하세요.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-pink-50 to-pink-100">
      <div className="w-full max-w-md px-8 py-10">
        <div className="text-2xl text-center cursor-pointer font-child">
          <a href="/">Story Teller</a>
        </div>
        <p className="mb-10 font-semibold text-center text-gray-700">LOG IN</p>

        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <label className="block mb-2 text-gray-700">ID</label>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="Enter your ID"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-gray-700">Password</label>
            <input
              type="password"
              value={passwd}
              onChange={(e) => setPasswd(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>

          {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            className="w-full py-2 mt-6 font-bold text-white transition-colors duration-200 bg-pink-400 rounded-lg hover:bg-pink-500"
          >
            LOG IN
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;