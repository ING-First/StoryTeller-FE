import axios from 'axios'

const API_BASE = process.env.REACT_APP_API_BASE

export async function searchFairyTales(uid: number, type?: number, title?: string) {
  // JWT 토큰 확인
  const token = localStorage.getItem('token')
  const tokenType = localStorage.getItem('token_type') || 'bearer'

  try {
    // 로그인된 경우에만 동화책 검색 가능
    const res = await axios.get(`${API_BASE}/users/${uid}/search`, {
      params: {type, title},
      headers: {
        Authorization: `${tokenType} ${token}`
      }
    })
    return res.data
  } catch (error: any) {
    console.error('동화책 검색 API 실패:', error.response?.data || error.message)
    throw error
  }
}
