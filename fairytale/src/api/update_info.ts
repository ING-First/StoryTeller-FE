import axios from 'axios'

// 환경변수 기반 엔드포인트 호스팅 주소 반영
const API_BASE = process.env.REACT_APP_API_BASE

// 사용자 정보 조회
export async function userUpdateSearch(uid: number) {
  // JWT 토큰 확인
  const token = localStorage.getItem('token')
  const tokenType = localStorage.getItem('token_type') || 'bearer'

  try {
    const res = await axios.post(
      `${API_BASE}/user_update_search`,
      {uid},
      {
        headers: {
          Authorization: `${tokenType} ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )
    return res.data
  } catch (error: any) {
    console.error(
      '회원정보 수정 시 사용자 정보 조회 API 실패:',
      error.response?.data || error.message
    )
    throw error
  }
}
