import axios from 'axios'

const API_BASE = process.env.REACT_APP_API_BASE

// 페이지 TTS 스트리밍
export async function ttsStreamPage(
  pages: string[],
  page: number,
  voice_id: string
): Promise<string> {
  // JWT 토큰 확인
  const token = localStorage.getItem('token')
  const tokenType = localStorage.getItem('token_type') || 'bearer'

  try {
    const res = await axios.post(
      `${API_BASE}/tts/stream_page`,
      {pages, page, voice_id},
      {
        headers: {
          Authorization: `${tokenType} ${token}`,
          'Content-Type': 'application/json'
        },
        responseType: 'blob'
      }
    )

    // Blob → Object URL 변환
    const audioBlob = new Blob([res.data], {type: 'audio/mpeg'})
    const audioUrl = URL.createObjectURL(audioBlob)
    return audioUrl
  } catch (error: any) {
    console.error('TTS Stream Page API 실패:', error.response?.data || error.message)
    throw error
  }
}
