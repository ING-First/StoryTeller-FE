// src/api/progress.ts
import axios from 'axios'

// 환경변수 기반 엔드포인트 호스팅 주소 반영
const API_BASE = process.env.REACT_APP_BE_API_BASE

export interface UpdateProgressRequest {
  page: number
}

export interface UpdateProgressResponse {
  message: string
  page: number
}

/**
 * 사용자의 독서 진행 상황을 업데이트합니다
 * @param uid 사용자 ID
 * @param fid 동화책 ID
 * @param page 현재 읽은 페이지 (1부터 시작)
 */
export async function updateReadingProgress(
  uid: number,
  fid: number,
  page: number
): Promise<UpdateProgressResponse> {
  // JWT 토큰 확인
  const token = localStorage.getItem('token')
  const tokenType = localStorage.getItem('token_type') || 'bearer'

  try {
    const res = await axios.post<UpdateProgressResponse>(
      `${API_BASE}/users/${uid}/fairy_tales/${fid}/progress`,
      {page},
      {
        headers: {
          Authorization: `${tokenType} ${token}`
        }
      }
    )
    return res.data
  } catch (error: any) {
    console.error('독서 진행 상황 저장 실패:', error.response?.data || error.message)
    throw error
  }
}
