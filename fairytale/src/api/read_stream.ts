import axios from 'axios'

const API_BASE = process.env.REACT_APP_API_BASE

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
      {pages, page, voice_id},
      {
        headers: {
          Authorization: `${tokenType} ${token}`,
          'Content-Type': 'application/json'
        },
        responseType: 'blob'
      }
    )

    const audioUrl = URL.createObjectURL(res.data)
    return audioUrl
  } catch (error: any) {
    console.error('TTS Stream Page API 실패:', error.response?.data || error.message)
    throw error
  }
}
