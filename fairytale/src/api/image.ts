// api/image.ts
import axios from 'axios'

const API_BASE = process.env.REACT_APP_API_BASE

interface ImageData {
  index: number
  filename: string
  image: string // base64
}

interface ImagesResponse {
  folder_path: string
  total_count: number
  images: ImageData[]
}

// 단일 이미지 파일 조회 (가장 기본적인 기능)
export async function getImageFile(imagePath: string): Promise<string | null> {
  const token = localStorage.getItem('token')
  const tokenType = localStorage.getItem('token_type') || 'bearer'

  try {
    const response = await axios.get(`${API_BASE}/images`, {
      params: {image_path: imagePath},
      headers: {
        Authorization: `${tokenType} ${token}`,
        'ngrok-skip-browser-warning': 'true'
      },
      responseType: 'blob'
    })

    const imageBlob = response.data
    return URL.createObjectURL(imageBlob)
  } catch (error) {
    console.error('이미지 가져오기 실패:', error)
    return null
  }
}

// 폴더 내 첫 번째 이미지만 가져오기
export async function getFirstImage(folderPath: string): Promise<string | null> {
  const token = localStorage.getItem('token')
  const tokenType = localStorage.getItem('token_type') || 'bearer'

  try {
    const response = await axios.get(`${API_BASE}/images/first`, {
      params: {folder_path: folderPath},
      headers: {
        Authorization: `${tokenType} ${token}`,
        'ngrok-skip-browser-warning': 'true'
      },
      responseType: 'blob'
    })

    const imageBlob = response.data
    return URL.createObjectURL(imageBlob)
  } catch (error) {
    console.error('첫 번째 이미지 가져오기 실패:', error)
    return null
  }
}

// 폴더 내 모든 이미지 정렬해서 가져오기
export async function getAllImages(folderPath: string): Promise<ImagesResponse | null> {
  const token = localStorage.getItem('token')
  const tokenType = localStorage.getItem('token_type') || 'bearer'

  try {
    const response = await axios.get(`${API_BASE}/images/all`, {
      params: {folder_path: folderPath},
      headers: {
        Authorization: `${tokenType} ${token}`,
        'ngrok-skip-browser-warning': 'true'
      }
    })

    return response.data
  } catch (error) {
    console.error('이미지 목록 가져오기 실패:', error)
    return null
  }
}

// Base64를 이미지 URL로 변환
export function base64ToImageUrl(base64Data: string): string {
  return `data:image/png;base64,${base64Data}`
}
