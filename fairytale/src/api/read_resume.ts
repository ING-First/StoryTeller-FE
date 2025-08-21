import axios from 'axios'

// 환경변수 기반 엔드포인트 호스팅 주소 반영
const API_BASE = process.env.REACT_APP_API_BASE

// 이어 읽기
export async function resumeReading(uid: number, fid: number) {
  // JWT 토큰 확인
  const token = localStorage.getItem('token')
  const tokenType = localStorage.getItem('token_type') || 'bearer'

  try {
    const res = await axios.get(`${API_BASE}/users/${uid}/fairy_tales/${fid}/resume`, {
      headers: {
        Authorization: `${tokenType} ${token}`
      }
    })
    return res.data
  } catch (error: any) {
    console.error('이어 읽기 API 실패:', error.response?.data || error.message)
    throw error
  }
}
