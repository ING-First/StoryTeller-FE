import axios from 'axios'

const API_BASE = process.env.REACT_APP_API_BASE

export async function login(id: string, passwd: string) {
  const res = await axios.post(`${API_BASE}/login`, {id, passwd})
  return res.data
}
