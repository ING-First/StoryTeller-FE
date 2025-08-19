import axios from 'axios'

// 환경변수 기반 엔드포인트 호스팅 주소 반영
const API_BASE = process.env.REACT_APP_API_BASE

// 동화책 페이지 읽기
export async function readFairyTalePage(
  uid: number,
  fid: number,
  page: number,
  voice_id: string
) {
  const token = localStorage.getItem('token')
  const tokenType = localStorage.getItem('token_type') || 'bearer'

  try {
    // 로그인된 경우에만 동화책 읽기 가능
    const res = await axios.post(
      `${API_BASE}/users/${uid}/fairy_tales/${fid}/read`,
      {page, voice_id},
      {
        headers: {
          Authorization: `${tokenType} ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )
    return res.data
  } catch (error: any) {
    console.error('동화책 읽기 API 실패:', error.response?.data || error.message)
    throw error
  }
}
