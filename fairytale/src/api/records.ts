import axios from 'axios'

// 환경변수 기반 엔드포인트 호스팅 주소 반영
const API_BASE = process.env.REACT_APP_API_BASE

export async function checkRecord(uid: number, fid: number) {
  // JWT 토큰 확인
  const token = localStorage.getItem('token')
  const tokenType = localStorage.getItem('token_type') || 'bearer'

  try {
    // 로그인된 경우에만 나의 독서 기록 조회 가능
    const res = await axios.get(`${API_BASE}/users/${uid}/check_records`, {
      params: {fid},
      headers: {
        Authorization: `${tokenType} ${token}`
      }
    })
    return res.data
  } catch (error: any) {
    console.error('checkRecord API 실패:', error.response?.data || error.message)
    throw error
  }
}
