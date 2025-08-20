import axios from 'axios'

const API_BASE = process.env.REACT_APP_API_BASE

export async function readFairyTalePage(
  uid: number,
  fid: number,
  page: number,
  voice_id: string
) {
  const token = localStorage.getItem('token')
  const tokenType = localStorage.getItem('token_type') || 'bearer'

  try {
    const res = await axios.post(
      `${API_BASE}/users/${uid}/fairy_tales/${fid}/read`,
      {page, voice_id},
      {
        headers: {
          Authorization: `${tokenType} ${token}`,
          'Content-Type': 'application/json'
        },
        responseType: 'blob'
      }
    )
    return res.data
  } catch (error: any) {
    console.error('동화책 읽기 API 실패:', error.response?.data || error.message)
    throw error
  }
}
