import api, {aiApi} from './index'

export async function generate(
  story: {
    name: string
    age: number
    genre: string
    uid: number
    type: 2
  },
  streaming = false
) {
  if (!streaming) {
    // 기존 방식
    const res = await aiApi.post('/generate_story', story)
    return res.data
  } else {
    // 스트리밍 방식
    return null // 스트리밍은 별도 함수에서 처리
  }
}

export async function generateStoryStream(
  story: {
    name: string
    age: number
    genre: string
    uid: number
    type: 2
  },
  onPageReceived: (pageData: any) => void
) {
  const response = await fetch(
    `${process.env.REACT_APP_AI_API_BASE}/generate_story?stream=true`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': '69420'
      },
      body: JSON.stringify(story)
    }
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  if (!response.body) {
    throw new Error('스트림 응답이 없습니다')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  try {
    let buffer = ''

    while (true) {
      const {done, value} = await reader.read()
      if (done) break

      buffer += decoder.decode(value, {stream: true})

      const parts = buffer.split('\n\n')
      buffer = parts.pop() || '' // 마지막 조각은 다음 chunk에서 이어 붙임

      for (const part of parts) {
        if (part.startsWith('data: ')) {
          try {
            const data = JSON.parse(part.slice(6))
            onPageReceived(data)
          } catch (e) {
            console.error('JSON 파싱 실패:', e, 'Part:', part)
          }
        }
      }
    }
  } catch (error) {
    console.error('스트리밍 읽기 에러:', error)
    throw error
  } finally {
    reader.releaseLock()
  }
}
