import axios from 'axios'

const API_BASE = process.env.REACT_APP_BE_API_BASE

export async function readFairyTalePage(
  uid: number,
  fid: number,
  page: number,
  voice_id?: string
) {
  const token = localStorage.getItem('token')
  const tokenType = localStorage.getItem('token_type') || 'bearer'

  try {
    const payload: any = { page }
    if (voice_id) payload.voice_id = voice_id

    const res = await axios.post(
      `${API_BASE}/users/${uid}/fairy_tales/${fid}/read`,
      payload,
      {
        headers: {
          Authorization: `${tokenType} ${token}`,
          'Content-Type': 'application/json'
        },
        responseType: 'blob'
      }
    )
    const blob = new Blob([res.data], { type: 'audio/wav' })
    return blob
  } catch (error: any) {
    console.error('readFairyTalePage 실패:', error.response?.data || error.message)
    throw error
  }
}