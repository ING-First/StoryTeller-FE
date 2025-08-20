import React, {useEffect, useState} from 'react'
import {useParams, useNavigate} from 'react-router-dom'
import Header from '../components/Header'
import Button from '../components/Button'
import {getFairyTaleDetail} from '../api/detail'

// API 응답 타입 정의
interface FairyTaleDetail {
  uid: number
  type: string
  title: string
  summary: string
  contents: string
  create_dates: string
  image_url: string | null // API 함수에서 clips를 image_url로 변환해서 반환
}

// JWT 파싱 유틸 (현재 사용하지 않지만 추후 사용 가능)
// interface JWTPayload {
//   sub?: string | number
//   uid?: string | number
//   exp?: number
// }

// function parseJwt(token: string): JWTPayload | null {
//   try {
//     const base64Url = token.split('.')[1]
//     if (!base64Url) return null
//     const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
//     const jsonPayload = decodeURIComponent(
//       atob(base64)
//         .split('')
//         .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
//         .join('')
//     )
//     return JSON.parse(jsonPayload)
//   } catch {
//     return null
//   }
// }

const StoryDetailPage: React.FC = () => {
  // 라우팅이 /detail/:fid 이므로 fid로 직접 가져옵니다
  const {fid} = useParams<{fid: string}>()
  const navigate = useNavigate()

  const [storyData, setStoryData] = useState<FairyTaleDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 이미지 URL 조합 함수 (사용 안 함 - 삭제)
  // const getImageUrl = (imagePath: string | null) => { ... }

  useEffect(() => {
    const fetchStoryDetail = async () => {
      try {
        console.log('🔍 디버깅 시작')
        console.log('📋 URL 파라미터 fid:', fid)

        // JWT에서 uid 추출
        const token = localStorage.getItem('token')
        const uidStr = localStorage.getItem('uid')
        console.log('🔑 토큰 존재 여부:', token ? '있음' : '없음')
        console.log('👤 UID from localStorage:', uidStr)

        if (!token) {
          console.log('❌ 토큰이 없어서 로그인 페이지로 이동')
          navigate('/login')
          return
        }

        const uid = uidStr ? Number(uidStr) : null
        console.log('🔢 변환된 UID:', uid, 'FID:', fid)
        console.log('🔢 UID 타입:', typeof uid, 'FID 타입:', typeof fid)

        if (!uid || !fid) {
          console.log('❌ 필요한 정보 누락 - UID:', uid, 'FID:', fid)
          setError('필요한 정보가 없습니다.')
          return
        }

        console.log('🚀 API 호출 시작 - UID:', Number(uid), 'FID:', Number(fid))

        // API 호출
        const data = await getFairyTaleDetail(Number(uid), Number(fid))
        console.log('✅ API 응답 성공:', data)
        console.log('📅 create_dates 값:', data.create_dates)
        console.log('📅 create_dates 타입:', typeof data.create_dates)
        console.log('🖼️ 원본 image_url:', data.image_url)

        setStoryData(data)
      } catch (error: any) {
        console.error('❌ 동화 상세 정보 로딩 실패:', error)
        console.error('📊 에러 상세 정보:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        })

        if (error.response?.status === 404) {
          setError('해당 동화를 찾을 수 없습니다.')
        } else if (error.response?.status === 401) {
          console.log('🔐 인증 실패로 로그인 페이지로 이동')
          navigate('/login')
          return
        } else {
          setError('동화 정보를 불러오는데 실패했습니다.')
        }
      } finally {
        setLoading(false)
        console.log('🏁 로딩 완료')
      }
    }

    fetchStoryDetail()
  }, [fid, navigate])

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen bg-pink-50">
        <Header />
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-center py-16">
            <div className="bg-white rounded-3xl shadow-lg max-w-2xl w-full p-8 md:p-12">
              <div className="flex flex-col items-center text-center space-y-8">
                {/* 이미지 스켈레톤 */}
                <div className="flex justify-center">
                  <div
                    className="bg-gray-200 rounded-2xl animate-pulse"
                    style={{
                      width: '280px',
                      height: '350px'
                    }}
                  />
                </div>

                {/* 텍스트 스켈레톤 */}
                <div className="space-y-6 w-full">
                  <div className="h-8 bg-gray-200 rounded animate-pulse mx-auto w-3/4" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-24" />
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-5/6" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-4/5" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-3/5" />
                  </div>
                  <div className="h-12 bg-gray-200 rounded animate-pulse mx-auto w-48" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen bg-pink-50">
        <Header />
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-center py-24">
            <div className="bg-white rounded-3xl shadow-lg max-w-2xl w-full p-8 md:p-12 text-center">
              <div className="text-6xl mb-6">😅</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 font-pinkfong">
                앗, 문제가 발생했어요!
              </h2>
              <p className="text-gray-600 mb-8 font-pinkfong">{error}</p>
              <Button to="/mypage" className="text-lg">
                내 동화책으로 돌아가기
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 데이터가 없는 경우
  if (!storyData) {
    return (
      <div className="min-h-screen bg-pink-50">
        <Header />
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-center py-24">
            <div className="bg-white rounded-3xl shadow-lg max-w-2xl w-full p-8 md:p-12 text-center">
              <div className="text-6xl mb-6">📚</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 font-pinkfong">
                동화를 찾을 수 없어요
              </h2>
              <p className="text-gray-600 mb-8 font-pinkfong">
                요청하신 동화를 찾을 수 없습니다.
              </p>
              <Button to="/mypage" className="text-lg">
                내 동화책으로 돌아가기
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    if (!dateString) return '날짜 정보 없음'

    try {
      const date = new Date(dateString)

      // Invalid Date 체크
      if (isNaN(date.getTime())) {
        console.warn('잘못된 날짜 형식:', dateString)
        return dateString
      }

      return date
        .toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
        .replace(/\./g, '/')
        .replace(/ /g, '')
    } catch (error) {
      console.error('날짜 포맷팅 에러:', error)
      return dateString
    }
  }

  // 정상 렌더링
  return (
    <div className="min-h-screen bg-pink-50">
      <Header />

      {/* Main Content */}
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center py-16">
          <div className="bg-white rounded-3xl shadow-lg max-w-2xl w-full p-8 md:p-12">
            <div className="flex flex-col items-center text-center space-y-8">
              {/* Book Cover */}
              <div className="flex justify-center">
                <img
                  src={
                    storyData.image_url ||
                    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=300&h=400'
                  }
                  alt={storyData.title}
                  className="rounded-2xl shadow-lg"
                  style={{
                    width: '280px',
                    height: '350px',
                    objectFit: 'cover'
                  }}
                  onError={e => {
                    // 이미지 로드 실패 시 기본 이미지로 대체
                    const target = e.target as HTMLImageElement
                    target.src =
                      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=300&h=400'
                  }}
                />
              </div>

              {/* Story Details */}
              <div className="space-y-6">
                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight font-pinkfong">
                  {storyData.title}
                </h1>

                {/* Date */}
                <p className="text-base text-gray-600 font-medium">
                  {formatDate(storyData.create_dates)}
                </p>

                {/* Summary */}
                <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line font-pinkfong max-w-lg mx-auto">
                  {storyData.summary}
                </p>

                {/* Action Button */}
                <div className="pt-4">
                  <Button to={`/generate_story/${fid}`} className="text-lg px-8 py-3">
                    동화책 읽으러 가기 &gt;&gt;
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StoryDetailPage
