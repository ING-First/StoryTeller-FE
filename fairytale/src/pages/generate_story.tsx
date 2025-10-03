// src/pages/generate_story.tsx
import React, {useState, useEffect, useRef} from 'react'
import {useParams, useNavigate} from 'react-router-dom'
import Header from '../components/Header'
import {getFairyTaleById, FairyTaleItem} from '../api/search'
import {readFairyTalePage} from '../api/read'
import {resumeReading} from '../api/read_resume'
import {getAllImages} from '../api/image'
import {generateStoryStream} from '../api/story_generate'
import PageFlip from '../components/PageFlip'

const PAGE_W = 530
const PAGE_H = 680

interface JWTPayload {
  sub?: string | number
  uid?: string | number
  exp?: number
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

interface StreamingPage {
  text: string
  page: number
}

const GenerateStory = () => {
  const {fid} = useParams<{fid: string}>()
  const navigate = useNavigate()

  const [uid, setUid] = useState<number | null>(null)
  const [fairyTale, setFairyTale] = useState<FairyTaleItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 스트리밍 관련 state
  const [streamingPages, setStreamingPages] = useState<StreamingPage[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [streamTitle, setStreamTitle] = useState<string>('')
  const [isStreamCompleted, setIsStreamCompleted] = useState(false)
  const [completedFid, setCompletedFid] = useState<string | null>(null)

  const [currentPage, setCurrentPage] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playingPage, setPlayingPage] = useState<number | null>(null)
  const [imageLoadStates, setImageLoadStates] = useState<{[key: number]: boolean}>({})
  const [pageImages, setPageImages] = useState<{[key: number]: string}>({})
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const bookContainerRef = useRef<HTMLDivElement | null>(null)
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

    const payload = parseJwt(token)
    if (payload?.exp && payload.exp * 1000 < Date.now()) {
      setError('로그인 세션이 만료되었습니다. 다시 로그인해주세요.')
      setLoading(false)
      return
    }

    setUid(uidNum)
  }, [])

  // 2) 모드 결정: fid가 있으면 기존 동화책 보기, 없으면 스트리밍 생성
  const isStreamMode = !fid

  // 3) 스트리밍 모드 처리
  useEffect(() => {
    if (isStreamMode && uid) {
      const urlParams = new URLSearchParams(window.location.search)
      const name = urlParams.get('name') || ''
      const age = parseInt(urlParams.get('age') || '7')
      const genre = urlParams.get('genre') || ''

      if (name && age && genre) {
        startStreamGeneration({name, age, genre, uid, type: 2})
      } else {
        setError('동화 생성에 필요한 정보가 없습니다. 다시 시도해주세요.')
        setLoading(false)
      }
    }
  }, [isStreamMode, uid])

  // 4) 기존 동화책 로딩 (fid가 있을 때)
  useEffect(() => {
    if (!isStreamMode && uid && fid) {
      loadExistingFairyTale()
    }
  }, [isStreamMode, uid, fid])

  const startStreamGeneration = async (storyData: any) => {
    setIsGenerating(true)
    setStreamingPages([])
    setLoading(true)
    setIsStreamCompleted(false)

    try {
      await generateStoryStream(storyData, pageData => {
        if (pageData.page) {
          const newPage: StreamingPage = {
            text: pageData.content,
            page: pageData.page
          }

          if (pageData.title && !streamTitle) {
            setStreamTitle(pageData.title)
          }

          setStreamingPages(prev => [...prev, newPage])

          if (pageData.image) {
            setPageImages(prev => ({
              ...prev,
              [pageData.page - 1]: pageData.image
            }))
            setImageLoadStates(prev => ({
              ...prev,
              [pageData.page - 1]: true
            }))
          }

          setCurrentPage(pageData.page - 1)
          setLoading(false)
        } else if (pageData.completed) {
          // 스트리밍 완료
          setIsGenerating(false)
          setIsStreamCompleted(true)
          setCompletedFid(pageData.fid)
          setLoading(false)

          console.log('동화 생성 완료:', pageData.fid)

          // URL만 업데이트 (페이지 리로드 없이)
          window.history.replaceState(
            {
              fromStreaming: true,
              streamedPages: streamingPages,
              streamedTitle: streamTitle,
              streamedImages: pageImages
            },
            '',
            `/generate_story/${pageData.fid}`
          )
        } else if (pageData.error) {
          setIsGenerating(false)
          setLoading(false)
          setError(pageData.error)
        }
      })
    } catch (error) {
      setIsGenerating(false)
      setLoading(false)
      setError('동화 생성에 실패했습니다.')
      console.error('스트리밍 에러:', error)
    }
  }

  const loadExistingFairyTale = async () => {
    const fidNum = fid ? parseInt(fid, 10) : NaN

    if (!uid || !fid || Number.isNaN(fidNum)) {
      setError('잘못된 요청입니다.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      // React Router state에서 스트리밍 데이터 확인
      const navigationState = navigate.length ? null : window.history.state?.usr

      if (navigationState?.fromStreaming) {
        // 스트리밍에서 넘어온 경우 캐시된 데이터 사용
        setStreamingPages(navigationState.streamedPages || [])
        setStreamTitle(navigationState.streamedTitle || '')
        setPageImages(navigationState.streamedImages || {})
        setIsStreamCompleted(true)
        setCompletedFid(fid)
        setLoading(false)
        return
      }

      // 일반적인 동화책 로딩
      const data = await getFairyTaleById(uid, fidNum)
      setFairyTale(data)

      // 이미지 로딩
      const imageFolderPath = `/content/gdrive/MyDrive/Colab Notebooks/fairyTale_images/${data.title}`

      try {
        const imagesData = await getAllImages(imageFolderPath)
        if (imagesData && imagesData.images.length > 0) {
          const imageMap: {[key: number]: string} = {}
          imagesData.images.forEach((img, index) => {
            imageMap[index] = `data:image/png;base64,${img.image}`
            setImageLoadStates(prev => ({...prev, [index]: true}))
          })
          setPageImages(imageMap)
        }
      } catch (error) {
        console.error('이미지 로딩 실패:', error)
      }

      // 이어읽기 처리
      try {
        const resumeData = await resumeReading(uid, fidNum)
        const startIdx = Math.max((resumeData?.next_page ?? 1) - 1, 0)
        setCurrentPage(startIdx)

        setTimeout(() => {
          if (pageFlipRef.current && startIdx > 0) {
            pageFlipRef.current.flip(startIdx)
          }
        }, 100)
      } catch {
        // 이어읽기 실패 무시
      }
    } catch (err: any) {
      setError(err.message || '동화책을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleImageError = (pageIndex: number) => {
    setImageLoadStates(prev => ({...prev, [pageIndex]: false}))
  }

  const playPageAudio = async (pageIndex: number) => {
    const pages = displayPages
    if (!pages[pageIndex]?.text || !uid) return

    // 스트리밍 모드에서는 완료된 경우에만 오디오 재생 허용
    if (isStreamMode && !isStreamCompleted) {
      alert('동화 생성이 완료된 후 음성을 들을 수 있습니다.')
      return
    }

    // fid가 필요한데 없는 경우
    const currentFid = completedFid || fid
    if (!currentFid) {
      alert('음성 재생을 위한 정보가 부족합니다.')
      return
    }

    try {
      setIsPlaying(true)
      setPlayingPage(pageIndex)

      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }

      const response = await readFairyTalePage(
        uid,
        parseInt(currentFid, 10),
        pageIndex + 1,
        'eleven_labs_default'
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

  // 뒤로가기 처리 (스트리밍 중에만)
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (isStreamMode && isGenerating && !isStreamCompleted) {
        e.preventDefault()
        const shouldLeave = window.confirm('동화 생성을 중단하고 나가시겠습니까?')
        if (!shouldLeave) {
          window.history.pushState(
            null,
            '',
            window.location.pathname + window.location.search
          )
          return
        }
        setIsGenerating(false)
      }
    }

    if (isStreamMode && isGenerating && !isStreamCompleted) {
      window.addEventListener('popstate', handlePopState)
      window.history.pushState(
        null,
        '',
        window.location.pathname + window.location.search
      )
    }

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [isStreamMode, isGenerating, isStreamCompleted])

  const handlePageFlip = (e: any) => {
    const newPage = e.data
    setCurrentPage(newPage)
    stopAudio()
  }

  const handleBookClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const pages = displayPages
    if (!pages.length) return

    const el = bookContainerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const half = rect.width / 2
    const lastIndex = pages.length - 1

    if (x > half && currentPage < lastIndex) {
      setCurrentPage(p => Math.min(p + 1, lastIndex))
      stopAudio()
    } else if (x <= half && currentPage > 0) {
      setCurrentPage(p => Math.max(p - 1, 0))
      stopAudio()
    }
  }

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
      }
    } catch (error) {
      console.error('Error flipping to previous page:', error)
    }
  }

  const goToNextPage = () => {
    if (!canNext || !pageFlipRef.current) return

    const pages = displayPages
    const newPage = Math.min(currentPage + 1, pages.length - 1)
    setCurrentPage(newPage)
    stopAudio()

    try {
      if (pageFlipRef.current.pageFlip) {
        pageFlipRef.current.pageFlip().flipNext()
      } else if (pageFlipRef.current.flipNext) {
        pageFlipRef.current.flipNext()
      } else if (pageFlipRef.current.turnToNextPage) {
        pageFlipRef.current.turnToNextPage()
      }
    } catch (error) {
      console.error('Error flipping to next page:', error)
    }
  }

  // 표시할 데이터 결정
  const displayPages = isStreamMode ? streamingPages : fairyTale?.pages || []
  const displayTitle = isStreamMode ? streamTitle : fairyTale?.title

  const totalPairs = Math.ceil(displayPages.length / 2)
  const currentPair = Math.floor(currentPage / 2) + 1
  const canPrev = currentPage > 0
  const canNext = currentPage < displayPages.length - 1

  if (loading) {
    const message =
      isStreamMode && isGenerating
        ? `페이지 ${streamingPages.length + 1} 생성 중... (이미지 포함)`
        : '동화책을 불러오는 중...'

    return (
      <div className="min-h-screen bg-pink-50 font-pinkfong">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="text-2xl font-semibold mb-4">{message}</div>
            {isStreamMode && streamTitle && (
              <div className="text-lg text-gray-600">"{streamTitle}"</div>
            )}
            {isStreamMode && isGenerating && (
              <div className="mt-4">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-pink-500 border-t-transparent mx-auto"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-pink-50 font-pinkfong">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="text-2xl font-semibold text-red-600 mb-4">{error}</div>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors">
              돌아가기
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!displayPages.length && !isGenerating) {
    return (
      <div className="min-h-screen bg-pink-50 font-pinkfong">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="text-2xl font-semibold mb-4">동화책을 찾을 수 없습니다.</div>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors">
              돌아가기
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-pink-50 font-pinkfong">
      <Header />

      {/* 스트리밍 상태 표시 */}
      {isStreamMode && isGenerating && (
        <div className="fixed top-20 left-4 bg-blue-500 text-white px-4 py-2 rounded-lg z-50 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span>페이지 {streamingPages.length + 1} 생성 중... (텍스트 + 이미지)</span>
          </div>
        </div>
      )}

      {/* 완료 알림 */}
      {isStreamMode && isStreamCompleted && (
        <div className="fixed top-20 left-4 bg-green-500 text-white px-4 py-2 rounded-lg z-50 shadow-lg">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>동화 생성 완료!</span>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-pink-50 flex flex-col">
        {/* 메인 컨텐츠 */}
        <div className="flex-1 flex items-center justify-center py-8">
          <div className="flex items-start">
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
                {displayPages.map((p, idx) => {
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
                        idx === 0 || idx === displayPages.length - 1 ? 'hard' : undefined
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
                                <p className="text-sm text-amber-500">
                                  {isGenerating
                                    ? '이미지 생성 중...'
                                    : '이미지 로딩중...'}
                                </p>
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
                              {isGenerating
                                ? '내용 생성 중...'
                                : showImage
                                ? ''
                                : '내용을 준비중입니다'}
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

              {/* 오디오 컨트롤 */}
              <div className="absolute -right-16 bottom-4 flex flex-col items-center gap-4">
                <button
                  onClick={() => {
                    if (isPlaying && playingPage === currentPage) stopAudio()
                    else playPageAudio(currentPage)
                  }}
                  disabled={
                    !displayPages[currentPage]?.text ||
                    (isStreamMode && !isStreamCompleted)
                  }
                  aria-label="재생"
                  className="w-12 h-12 rounded-full bg-white border border-gray-300 shadow-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                  {isPlaying && playingPage === currentPage ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>

                <button
                  onClick={stopAudio}
                  disabled={!isPlaying}
                  aria-label="정지"
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

            <div className="flex items-center gap-4">
              <span className="text-gray-600 font-medium">
                {currentPair} / {totalPairs}
              </span>
              {displayTitle && (
                <span className="text-gray-800 font-semibold max-w-xs truncate">
                  {displayTitle}
                </span>
              )}
            </div>

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
      </div>
    </div>
  )
}

export default GenerateStory
