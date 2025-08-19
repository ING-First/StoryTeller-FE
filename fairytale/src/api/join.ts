import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE

export async function join(id: string, passwd: string, repasswd: string, name: string, address: string) {
  const res = await axios.post(`${API_BASE}/join`, {id, passwd, repasswd, name, address})
  return res.data
}