import axios from 'axios'

const API_BASE = process.env.REACT_APP_BE_API_BASE

export async function ttsStreamPage(
  pages: string[],
  page: number,
  voice_id: string
): Promise<string> {
  const token = localStorage.getItem('token')
  const tokenType = localStorage.getItem('token_type') || 'bearer'

  try {
    const res = await axios.post(
      `${API_BASE}/tts/stream_page`,
      { pages, page, voice_id },
      {
        headers: {
          Authorization: `${tokenType} ${token}`,
          'Content-Type': 'application/json'
        },
        responseType: 'blob' // blob으로 오디오 데이터 수신
      }
    )

    // response 헤더에서 Content-Type 검증 (audio/wav만 허용)
    const contentType = res.headers['content-type']
    if (!contentType?.includes('audio')) {
      console.error('서버에서 오디오 응답을 받지 못했습니다:', contentType)
      throw new Error('Invalid audio response type')
    }

    //  blob URL 생성 후 유효성 검사
    const audioUrl = URL.createObjectURL(res.data)
    if (!audioUrl.startsWith('blob:')) {
      console.error('blob URL 생성 실패:', audioUrl)
      throw new Error('Failed to create audio blob URL')
    }

    console.log('[DEBUG] 생성된 오디오 URL:', audioUrl) 
    return audioUrl
  } catch (error: any) {
    console.error('TTS Stream Page API 실패:', error.response?.data || error.message)
    throw error
  }
}