import axios from 'axios'

const API_BASE = process.env.REACT_APP_API_BASE

// 동화책 상세정보 조회
export async function getFairyTaleDetail(uid: number, fid: number) {
  const token = localStorage.getItem('token')
  const tokenType = localStorage.getItem('token_type') || 'bearer'

  try {
    // 로그인된 경우에만 동화책 상세 조회 가능
    const res = await axios.get(`${API_BASE}/users/${uid}/detail`, {
      params: {fid},
      headers: {
        Authorization: `${tokenType} ${token}`
      }
    })
    return res.data
  } catch (error: any) {
    console.error('getFairyTaleDetail API 실패:', error.response?.data || error.message)
    throw error
  }
}
