// src/pages/generate_story.tsx
import React, {useState, useEffect, useRef} from 'react'
import {useParams} from 'react-router-dom'
import Header from '../components/Header'
import {getFairyTaleById, FairyTaleItem, readFairyTalePage} from '../api/search'
import {resumeReading} from '../api/read_resume'
import {getAllImages} from '../api/image' // 다시 getAllImages 사용
import PageFlip from '../components/PageFlip'

const PAGE_W = 530 // 각 페이지 너비
const PAGE_H = 680 // 각 페이지 높이

// --- JWT(JWS) payload 파서 (base64url -> JSON) ---
interface JWTPayload {
  sub?: string | number
  uid?: string | number
  exp?: number // seconds since epoch
}
function parseJwt(token: string): JWTPayload | null {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return null
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

const GenerateStory = () => {
  // URL에서는 fid만 받음
  const {fid} = useParams<{fid: string}>()

  // uid는 JWT에서 복원
  const [uid, setUid] = useState<number | null>(null)

  const [fairyTale, setFairyTale] = useState<FairyTaleItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // react-pageflip의 페이지 인덱스(0-based, 단일 페이지 기준)
  const [currentPage, setCurrentPage] = useState(0)

  // 오디오
  const [isPlaying, setIsPlaying] = useState(false)
  const [playingPage, setPlayingPage] = useState<number | null>(null)
  const [imageLoadStates, setImageLoadStates] = useState<{[key: number]: boolean}>({})
  const [pageImages, setPageImages] = useState<{[key: number]: string}>({}) // 이미지 URL 저장
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // 책 컨테이너(클릭 감지용)
  const bookContainerRef = useRef<HTMLDivElement | null>(null)
  // PageFlip ref 추가
  const pageFlipRef = useRef<any>(null)

  // 1) localStorage에서 uid 복원
  useEffect(() => {
    const token = localStorage.getItem('token')
    const uidStr = localStorage.getItem('uid')

    if (!token || !uidStr) {
      setError('로그인이 필요합니다.')
      setLoading(false)
      return
    }

    const uidNum = parseInt(uidStr, 10)
    if (isNaN(uidNum)) {
      setError('유효하지 않은 사용자 정보입니다.')
      setLoading(false)
      return
    }

    // JWT 만료 시간 체크 (옵션)
    const payload = parseJwt(token)
    if (payload?.exp && payload.exp * 1000 < Date.now()) {
      setError('로그인 세션이 만료되었습니다. 다시 로그인해주세요.')
      setLoading(false)
      return
    }

    setUid(uidNum)
  }, [])

  // 이미지 로드 실패
  const handleImageError = (pageIndex: number) => {
    setImageLoadStates(prev => ({...prev, [pageIndex]: false}))
  }

  // 2) 동화 & 이어읽기 & 이미지 로딩 (uid 복원되고 fid 있을 때 실행)
  useEffect(() => {
    const loadFairyTale = async () => {
      const fidNum = fid ? parseInt(fid, 10) : NaN

      if (!uid || !fid || Number.isNaN(fidNum)) {
        setError('잘못된 인증 정보 또는 URL 파라미터입니다.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const data = await getFairyTaleById(uid, fidNum)
        setFairyTale(data)

        // 동화책 제목을 기반으로 이미지 폴더에서 모든 이미지 가져오기
        const imageFolderPath = `/content/gdrive/MyDrive/Colab Notebooks/fairyTale_images/${data.title}`

        try {
          const imagesData = await getAllImages(imageFolderPath)
          if (imagesData && imagesData.images.length > 0) {
            const imageMap: {[key: number]: string} = {}

            // 백엔드에서 받은 이미지들을 페이지 순서대로 매핑
            imagesData.images.forEach((img, index) => {
              imageMap[index] = `data:image/png;base64,${img.image}`
              setImageLoadStates(prev => ({...prev, [index]: true}))
            })

            setPageImages(imageMap)
          }
        } catch (error) {
          console.error('이미지 로딩 실패:', error)
          // 이미지 로딩 실패해도 동화책은 정상 표시
        }

        try {
          const resumeData = await resumeReading(uid, fidNum)
          const startIdx = Math.max((resumeData?.next_page ?? 1) - 1, 0)
          setCurrentPage(startIdx)

          // PageFlip 초기 페이지 설정
          setTimeout(() => {
            if (pageFlipRef.current && startIdx > 0) {
              pageFlipRef.current.flip(startIdx)
            }
          }, 100)
        } catch {
          /* 이어읽기 실패 무시 */
        }
      } catch (err: any) {
        setError(err.message || '동화책을 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }
    // uid가 복원되고 fid가 유효할 때만 호출
    if (uid) loadFairyTale()
  }, [uid, fid])

  // 오디오 재생(왼쪽 페이지 기준)
  const playPageAudio = async (pageIndex: number) => {
    if (!fairyTale || !fairyTale.pages[pageIndex]?.text || !uid || !fid) return
    try {
      setIsPlaying(true)
      setPlayingPage(pageIndex)

      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }

      const response = await readFairyTalePage(
        uid,
        parseInt(fid, 10),
        pageIndex + 1,
        '' // 1-based
      )

      if (!(response instanceof Blob)) {
        console.warn('Unexpected response type:', typeof response)
        return
      }

      const audioUrl = URL.createObjectURL(response)
      const audio = new Audio(audioUrl)
      audioRef.current = audio

      audio.onended = () => {
        setIsPlaying(false)
        setPlayingPage(null)
        URL.revokeObjectURL(audioUrl)
      }
      audio.onerror = () => {
        setIsPlaying(false)
        setPlayingPage(null)
        URL.revokeObjectURL(audioUrl)
        alert('음성 재생에 실패했습니다.')
      }

      await audio.play()
    } catch (e) {
      console.error('음성 재생 실패:', e)
      setIsPlaying(false)
      setPlayingPage(null)
      alert('음성 재생에 실패했습니다.')
    }
  }

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setIsPlaying(false)
    setPlayingPage(null)
  }

  // PageFlip 페이지 변경 이벤트 핸들러
  const handlePageFlip = (e: any) => {
    const newPage = e.data
    setCurrentPage(newPage)
    stopAudio()
  }

  // 책 클릭 시 좌/우 반쪽을 감지해서 state 동기화
  const handleBookClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!fairyTale) return
    const el = bookContainerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const half = rect.width / 2
    const lastIndex = fairyTale.pages.length - 1

    // react-pageflip도 같은 클릭을 받아 넘김 → 우리는 state만 업데이트
    if (x > half && currentPage < lastIndex) {
      setCurrentPage(p => Math.min(p + 1, lastIndex))
      stopAudio()
    } else if (x <= half && currentPage > 0) {
      setCurrentPage(p => Math.max(p - 1, 0))
      stopAudio()
    }
  }

  // 하단 ←/→ 버튼에서 페이지 넘김 - PageFlip ref 사용
  const goToPrevPage = () => {
    if (!canPrev || !pageFlipRef.current) return

    const newPage = Math.max(currentPage - 1, 0)
    setCurrentPage(newPage)
    stopAudio()

    try {
      if (pageFlipRef.current.pageFlip) {
        pageFlipRef.current.pageFlip().flipPrev()
      } else if (pageFlipRef.current.flipPrev) {
        pageFlipRef.current.flipPrev()
      } else if (pageFlipRef.current.turnToPrevPage) {
        pageFlipRef.current.turnToPrevPage()
      } else {
        console.log('Available methods:', Object.getOwnPropertyNames(pageFlipRef.current))
      }
    } catch (error) {
      console.error('Error flipping to previous page:', error)
    }
  }

  const goToNextPage = () => {
    if (!canNext || !fairyTale || !pageFlipRef.current) return

    const newPage = Math.min(currentPage + 1, fairyTale.pages.length - 1)
    setCurrentPage(newPage)
    stopAudio()

    try {
      if (pageFlipRef.current.pageFlip) {
        pageFlipRef.current.pageFlip().flipNext()
      } else if (pageFlipRef.current.flipNext) {
        pageFlipRef.current.flipNext()
      } else if (pageFlipRef.current.turnToNextPage) {
        pageFlipRef.current.turnToNextPage()
      } else {
        console.log('Available methods:', Object.getOwnPropertyNames(pageFlipRef.current))
      }
    } catch (error) {
      console.error('Error flipping to next page:', error)
    }
  }

  // 쌍 페이지/오디오용 인덱스
  const leftIndex = currentPage % 2 === 0 ? currentPage : currentPage - 1
  const totalPairs = fairyTale ? Math.ceil(fairyTale.pages.length / 2) : 0
  const currentPair = Math.floor(currentPage / 2) + 1

  const canPrev = currentPage > 0
  const canNext = fairyTale ? currentPage < fairyTale.pages.length - 1 : false

  if (loading) {
    return (
      <div className="min-h-screen bg-pink-50 font-pinkfong">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <div className="text-2xl font-semibold">동화책을 불러오는 중...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-pink-50 font-pinkfong">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <div className="text-2xl font-semibold text-red-600">{error}</div>
        </div>
      </div>
    )
  }

  if (!fairyTale) {
    return (
      <div className="min-h-screen bg-pink-50 font-pinkfong">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <div className="text-2xl font-semibold">동화책을 찾을 수 없습니다.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-pink-50 font-pinkfong">
      <Header />

      <div className="min-h-screen bg-pink-50 flex flex-col">
        {/* 메인 컨텐츠: 책 + 오른쪽 하단 외부 컨트롤 */}
        <div className="flex-1 flex items-center justify-center py-8">
          <div className="flex items-start">
            {/* 책(클릭 캡처용 래퍼) */}
            <div
              ref={bookContainerRef}
              className="relative"
              onClick={handleBookClick}
              style={{width: PAGE_W * 2, height: PAGE_H}}
              title="왼쪽 클릭: 이전 / 오른쪽 클릭: 다음">
              <PageFlip
                ref={pageFlipRef}
                width={PAGE_W}
                height={PAGE_H}
                onFlip={handlePageFlip}>
                {fairyTale.pages.map((p, idx) => {
                  const showImage = !!(pageImages[idx] && imageLoadStates[idx] !== false)
                  return (
                    <div
                      key={idx}
                      className="relative bg-gradient-to-br from-amber-50 via-white to-orange-50 border-4 border-amber-200 p-8 w-[530px] h-[680px] flex flex-col shadow-2xl"
                      style={{
                        backgroundImage: `
                          radial-gradient(circle at 20% 80%, rgba(255, 237, 213, 0.3) 0%, transparent 50%),
                          radial-gradient(circle at 80% 20%, rgba(255, 228, 196, 0.2) 0%, transparent 50%),
                          linear-gradient(135deg, rgba(251, 191, 36, 0.05) 0%, rgba(255, 255, 255, 0.8) 50%, rgba(251, 191, 36, 0.05) 100%)
                        `
                      }}
                      data-density={
                        idx === 0 || idx === fairyTale.pages.length - 1
                          ? 'hard'
                          : undefined
                      }>
                      {/* 장식적인 모서리 요소들 */}
                      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-300 rounded-tl-lg"></div>
                      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-300 rounded-tr-lg"></div>
                      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-300 rounded-bl-lg"></div>
                      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-300 rounded-br-lg"></div>

                      {/* 페이지 번호 */}
                      <div className="absolute top-6 right-6 text-xs text-amber-600 font-medium bg-amber-100 px-2 py-1 rounded-full">
                        {idx + 1}
                      </div>

                      {/* 이미지 영역 */}
                      <div className="flex-shrink-0 mb-6 h-[480px] w-full flex justify-center">
                        <div className="relative w-[320px] h-[480px]">
                          {showImage ? (
                            <div className="relative w-full h-full group">
                              <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-xl transform rotate-1 group-hover:rotate-2 transition-transform duration-300"></div>
                              <img
                                src={pageImages[idx]}
                                alt={`페이지 ${idx + 1}`}
                                className="relative w-full h-full object-cover rounded-xl border-3 border-white shadow-xl transform group-hover:scale-105 transition-all duration-300"
                                onError={() => handleImageError(idx)}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-white/10 rounded-xl pointer-events-none"></div>
                            </div>
                          ) : (
                            <div className="w-full h-full rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-dashed border-amber-300 flex items-center justify-center">
                              <div className="text-amber-400">
                                <svg
                                  className="w-16 h-16 mx-auto mb-2"
                                  fill="currentColor"
                                  viewBox="0 0 24 24">
                                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                                </svg>
                                <p className="text-sm text-amber-500">이미지 로딩중...</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 텍스트 영역 */}
                      <div className="flex-1 flex items-start justify-center px-4">
                        {p.text ? (
                          <div className="relative max-w-[400px]">
                            <div className="absolute -inset-4 bg-gradient-to-r from-amber-50/50 via-white/30 to-orange-50/50 rounded-2xl"></div>
                            <p className="relative text-base leading-7 text-gray-800 text-center font-pinkfong tracking-wide">
                              {p.text}
                            </p>
                            <div className="mt-4 flex justify-center">
                              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-amber-400">
                            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                              <span className="text-lg font-bold text-amber-600">
                                {idx + 1}
                              </span>
                            </div>
                            <p className="text-lg font-semibold font-pinkfong">
                              {showImage ? '' : '내용을 준비중입니다'}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* 페이지 하단 장식 */}
                      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-1.5 bg-amber-300 rounded-full"></div>
                          <div className="w-1 h-1 bg-amber-200 rounded-full"></div>
                          <div className="w-1.5 h-1.5 bg-amber-300 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </PageFlip>

              {/* 책 바깥 오른쪽 하단 컨트롤 */}
              <div className="absolute -right-16 bottom-4 flex flex-col items-center gap-4">
                {/* 재생/토글: 왼쪽 페이지 기준 */}
                <button
                  onClick={() => {
                    if (isPlaying && playingPage === leftIndex) stopAudio()
                    else playPageAudio(leftIndex)
                  }}
                  disabled={!fairyTale.pages[leftIndex]?.text}
                  aria-label="재생"
                  className="w-12 h-12 rounded-full bg-white border border-gray-300 shadow-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                  {isPlaying && playingPage === leftIndex ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>

                {/* 강제 정지 */}
                <button
                  onClick={stopAudio}
                  disabled={!isPlaying}
                  aria-label="일시정지"
                  className="w-12 h-12 rounded-full bg-white border border-gray-300 shadow-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 네비게이션 바 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 p-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {/* 이전 */}
            <button
              onClick={goToPrevPage}
              disabled={!canPrev}
              className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* 페이지 쌍 정보 */}
            <div className="flex items-center gap-4">
              <span className="text-gray-600 font-medium">
                {currentPair} / {totalPairs}
              </span>
            </div>

            {/* 다음 */}
            <button
              onClick={goToNextPage}
              disabled={!canNext}
              className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 닫기 버튼 (기존) */}
        <button className="fixed top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors z-10">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default GenerateStory
