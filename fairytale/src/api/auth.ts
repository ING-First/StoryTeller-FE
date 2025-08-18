import axios from 'axios'

// 환경 변수 기반으로 ngrok 유동적인 호스팅 주소 대비
const API_BASE = process.env.REACT_APP_API_BASE

export async function login(id: string, passwd: string) {
  const res = await axios.post(`${API_BASE}/login`, {id, passwd})
  return res.data
}
