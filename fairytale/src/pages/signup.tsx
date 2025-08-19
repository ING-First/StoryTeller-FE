import React, { useState } from "react";
import { join } from "../api/join"; // join.ts 경로에 맞게 import

const SignUpPage: React.FC = () => {
  const [id, setId] = useState("");
  const [passwd, setPasswd] = useState("");
  const [repasswd, setRePasswd] = useState("");
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");

  const handleSignUp = async () => {
    if (!id) {
      alert("아이디를 입력해주세요.");
      return;
    }

    if (!passwd) {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    if (!repasswd) {
      alert("비밀번호 확인을 입력해주세요.");
      return;
    }

    if (!name) {
      alert("이름을 입력해주세요.");
      return;
    }

    if (!address) {
      alert("주소를 입력해주세요.");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()])[A-Za-z\d!@#$%^&*()]{8,15}$/;

    if (!passwordRegex.test(passwd)) {
      alert("비밀번호는 8~15자리이며, 대문자/소문자/숫자/특수문자를 모두 포함해야 합니다.");
      return;
    }

    if (passwd != repasswd) {
      alert("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    try {
      const res = await join({
        id,
        passwd,
        repasswd,
        name,
        address,
      });
      console.log(res);
      alert(res.message);
      window.location.href = "/login";
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-pink-50 to-pink-100">
      <div className="w-full max-w-md px-10 py-12 bg-white shadow-lg rounded-2xl">
        {/* Title */}
        <div className="text-2xl text-center cursor-pointer font-child">
          Story Teller
        </div>

        <p className="mb-8 font-semibold text-center text-gray-700">Sign Up</p>

        {/* ID */}
        <div className="mb-5">
          <label className="block mb-1 text-gray-600">ID*</label>
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>

        {/* Password */}
        <div className="mb-5">
          <label className="block mb-1 text-gray-600">Password*</label>
          <input
            type="password"
            value={passwd}
            onChange={(e) => setPasswd(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>

        {/* Password 확인 */}
        <div className="mb-5">
          <label className="block mb-1 text-gray-600">Password 확인*</label>
          <input
            type="password"
            value={repasswd}
            onChange={(e) => setRePasswd(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>

        {/* Address */}
        <div className="mb-5">
          <label className="block mb-1 text-gray-600">Address*</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>

        {/* Nickname */}
        <div className="mb-5">
          <label className="block mb-1 text-gray-600">Nickname*</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>

        {/* Sign Up Button */}
        <button
          onClick={handleSignUp}
          className="w-full py-2 text-white transition bg-pink-400 rounded-lg hover:bg-pink-500"
        >
          회원가입
        </button>

        {/* Links */}
        <div className="flex justify-center mt-5 text-sm text-gray-500">
          <a href="/login" className="hover:text-pink-500">
            로그인으로 돌아가기
          </a>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
