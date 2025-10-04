import React, {useEffect, useState} from 'react'
import {useParams, useNavigate} from 'react-router-dom'
import Header from '../components/Header'
import Button from '../components/Button'
import {getFairyTaleDetail} from '../api/detail'
import {getFairyTaleDetailCache, saveFairyTaleDetail} from '../utils/storyCache'

interface FairyTaleDetail {
  uid: number
  type: string
  title: string
  summary: string
  contents: string
  create_dates: string
  image_url: string | null
}

const StoryDetailPage: React.FC = () => {
  const {fid} = useParams<{fid: string}>()
  const navigate = useNavigate()

  const [storyData, setStoryData] = useState<FairyTaleDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStoryDetail = async () => {
      try {
        console.log('🔍 디버깅 시작')
        console.log('📋 URL 파라미터 fid:', fid)

        const token = localStorage.getItem('token')
        const uidStr = localStorage.getItem('uid')

        if (!token) {
          console.log('❌ 토큰이 없어서 로그인 페이지로 이동')
          navigate('/login')
          return
        }

        const uid = uidStr ? Number(uidStr) : null

        if (!uid || !fid) {
          console.log('❌ 필요한 정보 누락 - UID:', uid, 'FID:', fid)
          setError('필요한 정보가 없습니다.')
          return
        }

        // 1. 먼저 캐시 확인
        const cachedDetail = await getFairyTaleDetailCache(Number(fid))

        if (cachedDetail) {
          // 캐시가 있으면 바로 표시
          console.log('✅ 캐시에서 로드됨')
          setStoryData(cachedDetail)
          setLoading(false)
          return
        }

        console.log('🚀 API 호출 시작 - UID:', Number(uid), 'FID:', Number(fid))

        // 2. 캐시가 없으면 API 호출
        const data = await getFairyTaleDetail(Number(uid), Number(fid))
        console.log('✅ API 응답 성공:', data)

        setStoryData(data)

        // 3. 새로 받은 데이터 캐시에 저장
        await saveFairyTaleDetail(Number(fid), data)
      } catch (error: any) {
        console.error('❌ 동화 상세 정보 로딩 실패:', error)

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

  if (loading) {
    return (
      <div className="min-h-screen bg-pink-50">
        <Header />
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-center py-16">
            <div className="bg-white rounded-3xl shadow-lg max-w-2xl w-full p-8 md:p-12">
              <div className="flex flex-col items-center text-center space-y-8">
                <div className="flex justify-center">
                  <div
                    className="bg-gray-200 rounded-2xl animate-pulse"
                    style={{width: '280px', height: '350px'}}
                  />
                </div>
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

  const formatDate = (dateString: string) => {
    if (!dateString) return '날짜 정보 없음'

    try {
      const date = new Date(dateString)

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

  return (
    <div className="min-h-screen bg-pink-50">
      <Header />

      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center py-16">
          <div className="bg-white rounded-3xl shadow-lg max-w-2xl w-full p-8 md:p-12">
            <div className="flex flex-col items-center text-center space-y-8">
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
                    const target = e.target as HTMLImageElement
                    target.src =
                      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=300&h=400'
                  }}
                />
              </div>

              <div className="space-y-6">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight font-pinkfong">
                  {storyData.title}
                </h1>

                <p className="text-base text-gray-600 font-medium">
                  {formatDate(storyData.create_dates)}
                </p>

                <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line font-pinkfong max-w-lg mx-auto">
                  {storyData.summary}
                </p>

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
