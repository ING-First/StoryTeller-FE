import axios from 'axios'

const API_BASE = process.env.REACT_APP_API_BASE

export async function generate(name: string, age: number, genre: string) {
  const res = await axios.post(`${API_BASE}/generate`, {name, age, genre})
  return res.data
}
