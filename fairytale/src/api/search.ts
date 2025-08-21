import axios from 'axios'

const API_BASE = process.env.REACT_APP_API_BASE || 'https://a27ab4c71fbe.ngrok-free.app'

// 페이지 아이템 타입
export interface PageItem {
  text: string | null
  image: string | null
}

// 동화책 아이템 타입
export interface FairyTaleItem {
  uid: number
  fid: number
  type: number
  title: string
  summary: string
  create_date: string
  pages: PageItem[]
}

// 검색 응답 타입
export interface SearchResponse {
  results: FairyTaleItem[]
}

// 동화책 검색 (단일 fid 조회)
export async function getFairyTaleById(uid: number, fid: number): Promise<FairyTaleItem> {
  const token = localStorage.getItem('token')
  const tokenType = localStorage.getItem('token_type') || 'bearer'

  try {
    const res = await axios.get(`${API_BASE}/users/${uid}/search`, {
      params: {fid},
      headers: {
        Authorization: `${tokenType} ${token}`,
        'ngrok-skip-browser-warning': 'true'
      }
    })

    const searchResponse: SearchResponse = res.data
    if (!searchResponse.results || searchResponse.results.length === 0) {
      throw new Error('동화책을 찾을 수 없습니다.')
    }

    return searchResponse.results[0]
  } catch (error: any) {
    console.error('동화책 조회 실패:', error.response?.data || error.message)
    throw error
  }
}

// 동화책 페이지 읽기 (음성 스트리밍)
export async function readFairyTalePage(
  uid: number,
  fid: number,
  page: number,
  voice_id: string
): Promise<Blob> {
  const token = localStorage.getItem('token')
  const tokenType = localStorage.getItem('token_type') || 'bearer'

  try {
    const res = await axios.post(
      `${API_BASE}/users/${uid}/fairy_tales/${fid}/read`,
      {page, voice_id},
      {
        headers: {
          Authorization: `${tokenType} ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        responseType: 'blob' // 음성 스트림을 blob으로 받기
      }
    )
    return res.data
  } catch (error: any) {
    console.error('동화책 읽기 API 실패:', error.response?.data || error.message)
    throw error
  }
}
