import axios from 'axios'

const BE_API_BASE = process.env.REACT_APP_BE_API_BASE
const AI_API_BASE = process.env.REACT_APP_AI_API_BASE

// Backend API 인스턴스 (기존 api)
const api = axios.create({
  baseURL: BE_API_BASE,
  headers: {
    'ngrok-skip-browser-warning': '69420',
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// AI API 인스턴스 (새로 추가)
export const aiApi = axios.create({
  baseURL: AI_API_BASE,
  headers: {
    'ngrok-skip-browser-warning': '69420',
    'Content-Type': 'application/json'
  }
})

aiApi.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
