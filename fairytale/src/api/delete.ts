import axios from 'axios'

const API_BASE = process.env.REACT_APP_API_BASE

export async function delete_user(uid: number, passwd: string) {
  const res = await axios.post(`${API_BASE}/delete_user`, {uid, passwd})
  return res.data
}
