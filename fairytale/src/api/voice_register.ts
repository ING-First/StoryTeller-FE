import axios from 'axios'

const API_BASE = process.env.REACT_APP_API_BASE

export async function voice_register(uid: number, audio: File) {
  const res = await axios.post(`${API_BASE}/voices/register`, {uid, audio})
  return res.data
}
