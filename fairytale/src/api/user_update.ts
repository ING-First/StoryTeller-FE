import axios from 'axios'

const API_BASE = process.env.REACT_APP_API_BASE

// 회원정보 수정 API 연동
export async function updateUser(payload: {
  id: string
  passwd: string
  repasswd: string
  name: string
  address: string
}) {
  const token = localStorage.getItem('token')
  const tokenType = localStorage.getItem('token_type')

  try {
    const res = await axios.post(`${API_BASE}/update_user`, payload, {
      headers: {
        Authorization: `${tokenType} ${token}`
      }
    })
    return res.data
  } catch (error: any) {
    console.error('updateUser API 실패:', error.response?.data || error.message)
    throw error
  }
}
