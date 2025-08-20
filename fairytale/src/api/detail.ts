import axios from 'axios'
import {getAllImages} from './image'

const API_BASE = process.env.REACT_APP_API_BASE

// 동화책 상세정보 조회 (백엔드 엔드포인트에 맞게 수정)
export async function getFairyTaleDetail(uid: number, fid: number) {
  const token = localStorage.getItem('token')
  const tokenType = localStorage.getItem('token_type') || 'bearer'

  try {
    console.log('API 호출 URL:', `${API_BASE}/users/${uid}/detail/${fid}`)

    // ngrok 사용 시 필요한 헤더들 추가
    const headers = {
      Authorization: `${tokenType} ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'ngrok-skip-browser-warning': 'true' // ngrok 브라우저 경고 스킵
    }

    console.log('헤더:', headers)

    // 백엔드 엔드포인트: /users/{uid}/detail/{fid} (경로 파라미터)
    const res = await axios.get(`${API_BASE}/users/${uid}/detail/${fid}`, {
      headers: headers
    })

    console.log('HTTP 상태:', res.status)
    console.log('응답 헤더:', res.headers)

    // HTML 응답 체크
    if (res.headers['content-type']?.includes('text/html')) {
      console.error('HTML 응답을 받았습니다. API 엔드포인트가 올바르지 않을 수 있습니다.')
      console.log('HTML 응답 내용 (처음 1000자):', res.data.substring(0, 1000))
      throw new Error('API 엔드포인트를 찾을 수 없습니다. 백엔드 서버를 확인해주세요.')
    }

    console.log('JSON 응답:', res.data)
    console.log('응답 데이터 타입:', typeof res.data)

    const data = res.data

    // 필드별로 확인
    console.log('각 필드 확인:')
    console.log('- uid:', data.uid)
    console.log('- type:', data.type)
    console.log('- title:', data.title)
    console.log('- summary:', data.summary)
    console.log('- contents:', data.contents)
    console.log('- create_dates:', data.create_dates)
    console.log('- image_url:', data.image_url)

    // 이미지 URL 처리 - 동화책 제목으로 폴더 경로 생성해서 첫 번째 이미지 가져오기
    let finalImageUrl = null

    if (data.title) {
      const imageFolderPath = `/content/gdrive/MyDrive/Colab Notebooks/fairyTale_images/${data.title}`
      try {
        const imagesData = await getAllImages(imageFolderPath)
        if (imagesData && imagesData.images.length > 0) {
          // 첫 번째 이미지를 base64에서 URL로 변환
          const firstImage = imagesData.images[0]
          finalImageUrl = `data:image/png;base64,${firstImage.image}`
        }
      } catch (error) {
        console.error('이미지 로딩 실패:', error)
      }
    }

    return {
      uid: data.uid,
      type: data.type,
      title: data.title,
      summary: data.summary,
      contents: data.contents,
      create_dates: data.create_dates,
      image_url: finalImageUrl
    }
  } catch (error: any) {
    console.error('getFairyTaleDetail API 실패:', error.response?.data || error.message)
    console.error('에러 상태:', error.response?.status)
    console.error('에러 헤더:', error.response?.headers)
    throw error
  }
}
