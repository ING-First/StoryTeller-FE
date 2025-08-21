import React, {useState} from 'react'
import Header from '../components/Header'
import {data, useNavigate} from 'react-router-dom'
import {delete_user} from '../api/delete'
import {update_user} from '../api/user_update'
import {user_update_search} from '../api/update_info'

const ProfileEditPage = () => {
  // 실제로는 로그인한 사용자의 정보를 상태로 가져옵니다.
  const [userId, setUserId] = useState('')
  const [userName, setUserName] = useState('KKURI')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const navigate = useNavigate()

  const userInfo = async () => {
    try {
      const data = await user_update_search({uid: Number(localStorage.getItem("uid"))})
      setUserId(data.id)
      setUserName(data.name)
    } catch (err) {
      alert('유저 정보를 불러오는데 실패했습니다.')
      console.error(err)
    }
  }

  userInfo()

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await update_user({
        uid: Number(localStorage.getItem("uid")),
        id: userId,
        currentPasswd: currentPassword,
        passwd: newPassword,
        repasswd: confirmPassword,

      });
      console.log(res);
      alert('프로필 정보가 성공적으로 업데이트되었습니다.')
      navigate('/mypage') // 마이페이지로 이동
    } catch (err: any) {
      console.error(err);
      alert("프로필 정보 업데이트를 실패했습니다.");
    }
  }

  const handleWithdrawal = async() => {
    // 경고창을 띄워 사용자에게 재확인 받습니다.
    if (window.confirm('정말 회원 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
     try {
        const res = await delete_user({
          uid: Number(localStorage.getItem("uid"))
        });
        console.log(res);
        localStorage.removeItem("token");
        localStorage.removeItem("uid");
        localStorage.removeItem("name");

        alert('회원 탈퇴가 완료되었습니다.')
        navigate('/') // 메인 페이지로 이동
        window.location.reload();
        
      } catch (err: any) {
        console.error(err);
        alert("회원 탈퇴를 실패했습니다.");
      }
    }
  }

  return (
    <div className="min-h-screen bg-pink-50">
      <Header />
      <div className="container max-w-2xl p-4 mx-auto">
        <h1 className="mt-10 text-2xl font-bold text-center text-gray-800">
          회원 정보 수정
        </h1>
        <p className="mt-2 text-center text-gray-600">
          안전한 정보 보호를 위해 정기적으로 비밀번호를 변경해주세요.
        </p>

        <form
          onSubmit={handleUpdateProfile}
          className="p-6 mt-8 bg-white shadow-xl rounded-2xl">
          {/* 사용자 이름 수정 */}
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700">닉네임</label>
            <input
              type="text"
              value={userName}
              onChange={e => setUserName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>

          {/* 비밀번호 변경 섹션 */}
          <h2 className="mt-8 mb-4 text-xl font-bold text-gray-800">비밀번호 변경</h2>
          <div className="mb-4">
            <label className="block mb-2 font-semibold text-gray-700">
              현재 비밀번호
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="현재 비밀번호를 입력하세요"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-semibold text-gray-700">새 비밀번호</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="새 비밀번호를 입력하세요"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700">
              새 비밀번호 확인
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="새 비밀번호를 다시 입력하세요"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-4 font-bold text-white transition-colors bg-pink-400 rounded-lg hover:bg-pink-500">
            정보 수정
          </button>
        </form>

        <div className="p-6 mt-8 bg-white shadow-xl rounded-2xl">
          <h2 className="mb-4 text-xl font-bold text-red-500">회원 탈퇴</h2>
          <p className="mb-4 text-gray-600">
            회원 탈퇴를 진행하시면 모든 정보가 삭제되며 되돌릴 수 없습니다.
          </p>
          <button
            onClick={handleWithdrawal}
            className="w-full py-3 font-bold text-white transition-colors bg-red-400 rounded-lg hover:bg-red-500">
            회원 탈퇴하기
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProfileEditPage
