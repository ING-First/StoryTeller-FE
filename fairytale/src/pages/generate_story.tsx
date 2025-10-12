// src/pages/generate_story.tsx
import React, {useState, useEffect, useRef, useCallback} from 'react'
import {useParams, useNavigate} from 'react-router-dom'
import Header from '../components/Header'
import {getFairyTaleById, FairyTaleItem} from '../api/search'
import {readFairyTalePage} from '../api/read'
import {resumeReading} from '../api/read_resume'
import {getAllImages} from '../api/image'
import {generateStoryStream} from '../api/story_generate'
import {updateReadingProgress} from '../api/progress'
import PageFlip from '../components/PageFlip'
import {
  saveImage,
  getImage,
  saveFairyTaleMeta,
  getFairyTaleMeta,
  clearOldCache
} from '../utils/storyCache'

const IMAGE_BASE_PATH = process.env.REACT_APP_IMAGE_BASE_PATH

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

  const [streamingPages, setStreamingPages] = useState<StreamingPage[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [streamTitle, setStreamTitle] = useState<string>('')
  const [isStreamCompleted, setIsStreamCompleted] = useState(false)
  const [completedFid, setCompletedFid] = useState<string | null>(null)

  const [currentPage, setCurrentPage] = useState(0)
  const [initialPage, setInitialPage] = useState(0)
  const [isDataReady, setIsDataReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playingPage, setPlayingPage] = useState<number | null>(null)
  const [imageLoadStates, setImageLoadStates] = useState<{[key: number]: boolean}>({})
  const [pageImages, setPageImages] = useState<{[key: number]: string}>({})
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const bookContainerRef = useRef<HTMLDivElement | null>(null)
  const pageFlipRef = useRef<any>(null)
  const progressUpdateTimer = useRef<NodeJS.Timeout | null>(null)
  const currentPageRef = useRef<number>(0)
  const hasStartedGeneration = useRef(false)

  // 앱 시작 시 오래된 캐시 정리
  useEffect(() => {
    clearOldCache()
  }, [])

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

  const isStreamMode = !fid

  // 현재 페이지를 ref에 동기화
  useEffect(() => {
    currentPageRef.current = currentPage
  }, [currentPage])

  // debounce된 진행 상황 저장 (페이지 전환 시 사용)
  const debouncedUpdateProgress = useCallback(
    (page: number) => {
      const currentFid = completedFid || fid
      if (!uid || !currentFid) return

      if (progressUpdateTimer.current) {
        clearTimeout(progressUpdateTimer.current)
      }

      progressUpdateTimer.current = setTimeout(async () => {
        try {
          const clipNumber = Math.floor(page / 2) + 1
          await updateReadingProgress(uid, parseInt(currentFid, 10), clipNumber)
          console.log(
            `[Debounce] Clip ${clipNumber} (페이지 ${page}-${page + 1}) 진행 상황 저장됨`
          )
        } catch (error) {
          console.error('진행 상황 저장 실패:', error)
        }
      }, 1000)
    },
    [uid, fid, completedFid]
  )

  // 페이지 이탈/탭 전환 시 즉시 저장
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const currentFid = completedFid || fid
        if (uid && currentFid && currentPageRef.current !== undefined) {
          const clipNumber = Math.floor(currentPageRef.current / 2) + 1

          const apiUrl = `/api/users/${uid}/fairy_tales/${parseInt(
            currentFid,
            10
          )}/progress`
          const data = JSON.stringify({next_page: clipNumber})

          if (navigator.sendBeacon) {
            const blob = new Blob([data], {type: 'application/json'})
            const success = navigator.sendBeacon(apiUrl, blob)
            console.log(
              `[visibilitychange] sendBeacon 전송 ${
                success ? '성공' : '실패'
              }: Clip ${clipNumber}`
            )
          } else {
            updateReadingProgress(uid, parseInt(currentFid, 10), clipNumber).catch(err =>
              console.error('진행 상황 저장 실패:', err)
            )
          }
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)

      if (progressUpdateTimer.current) {
        clearTimeout(progressUpdateTimer.current)
      }

      const currentFid = completedFid || fid
      if (uid && currentFid && currentPageRef.current !== undefined) {
        const clipNumber = Math.floor(currentPageRef.current / 2) + 1
        updateReadingProgress(uid, parseInt(currentFid, 10), clipNumber)
          .then(() => {
            console.log(
              `[언마운트] Clip ${clipNumber} (페이지 ${currentPageRef.current}) 진행 상황 저장됨`
            )
          })
          .catch(error => {
            console.error('언마운트 시 진행 상황 저장 실패:', error)
          })
      }
    }
  }, [uid, fid, completedFid])

  const startStreamGeneration = useCallback(async (storyData: any) => {
    setIsGenerating(true)
    // 두 개의 빈 페이지로 시작 (짝수 페이지 구조 유지)
    setStreamingPages([
      {text: '', page: 1},
      {text: '', page: 2}
    ])
    setLoading(false)
    setIsDataReady(true)
    setIsStreamCompleted(false)

    try {
      let capturedTitle = ''
      let capturedPages: StreamingPage[] = [
        {text: '', page: 1},
        {text: '', page: 2}
      ]
      let capturedImages: {[key: number]: string} = {}

      await generateStoryStream(storyData, async pageData => {
        if (pageData.page) {
          const newPage: StreamingPage = {
            text: pageData.content,
            page: pageData.page
          }

          if (pageData.title && !capturedTitle) {
            capturedTitle = pageData.title
            setStreamTitle(pageData.title)
          }

          const pageIndex = pageData.page - 1
          capturedPages[pageIndex] = newPage

          const desiredLength =
            pageData.page % 2 === 0 ? pageData.page : pageData.page + 1
          while (capturedPages.length < desiredLength) {
            capturedPages.push({
              text: '',
              page: capturedPages.length + 1
            })
          }

          setStreamingPages([...capturedPages])

          if (pageData.image) {
            capturedImages = {
              ...capturedImages,
              [pageData.page - 1]: pageData.image
            }
            setPageImages(capturedImages)
            setImageLoadStates(prev => ({
              ...prev,
              [pageData.page - 1]: true
            }))
          }
        } else if (pageData.completed) {
          setIsGenerating(false)
          setCompletedFid(pageData.fid)

          // ✅ 최종 페이지 정리
          let finalPages = capturedPages.filter(p => p.text)

          // ✅ 모든 페이지가 홀수라면 마지막에 더미 페이지 추가
          if (finalPages.length % 2 !== 0) {
            finalPages.push({
              text: '',
              page: finalPages.length + 1
            })
          }

          // ✅ 먼저 페이지 상태 업데이트 (렌더링 트리거)
          setStreamingPages(finalPages)

          // ✅ 렌더링 반영 후 완료 상태 변경
          setTimeout(() => {
            setIsStreamCompleted(true)
          }, 50)

          console.log('동화 생성 완료:', pageData.fid)

          if (pageData.fid && capturedTitle && finalPages.length > 0) {
            await saveFairyTaleMeta(pageData.fid, capturedTitle, finalPages)

            const imageEntries = Object.entries(capturedImages)
            for (const [idx, imageData] of imageEntries) {
              await saveImage(pageData.fid, parseInt(idx), imageData as string)
            }
            console.log('캐시 저장 완료')

            try {
              await updateReadingProgress(storyData.uid, parseInt(pageData.fid, 10), 1)
              console.log('독서 상황 업데이트 완료: Clip 1로 설정')
            } catch (error) {
              console.error('독서 상황 업데이트 실패:', error)
            }
          }

          window.history.replaceState(
            {
              fromStreaming: true,
              streamedPages: finalPages,
              streamedTitle: capturedTitle,
              streamedImages: capturedImages
            },
            '',
            `/generate_story/${pageData.fid}`
          )
        } else if (pageData.error) {
          setIsGenerating(false)
          setError(pageData.error)
        }
      })
    } catch (error) {
      setIsGenerating(false)
      setError('동화 생성에 실패했습니다.')
      console.error('스트리밍 에러:', error)
    }
  }, [])

  const loadExistingFairyTale = useCallback(
    async (currentFid: string) => {
      const fidNum = currentFid ? parseInt(currentFid, 10) : NaN

      if (!uid || !currentFid || Number.isNaN(fidNum)) {
        setError('잘못된 요청입니다.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)

        const navigationState = navigate.length ? null : window.history.state?.usr

        if (navigationState?.fromStreaming) {
          setStreamingPages(navigationState.streamedPages || [])
          setStreamTitle(navigationState.streamedTitle || '')
          setPageImages(navigationState.streamedImages || {})
          setIsStreamCompleted(true)
          setCompletedFid(currentFid)
          setIsDataReady(true)
          setLoading(false)
          return
        }

        const cachedMeta = await getFairyTaleMeta(currentFid)

        const data = await getFairyTaleById(uid, fidNum)
        setFairyTale(data)
        setIsDataReady(true)

        // ✅ 페이지가 홀수면 더미 페이지 추가
        if (data.pages.length % 2 !== 0) {
          ;(data.pages as any).push({text: ''}) // 👈 page 제거 + 타입 무시
        }

        let hasAllCachedImages = true
        const imageMap: {[key: number]: string} = {}

        for (let i = 0; i < data.pages.length; i++) {
          const cachedImage = await getImage(currentFid, i)
          if (cachedImage) {
            imageMap[i] = cachedImage
            setImageLoadStates(prev => ({...prev, [i]: true}))
          } else {
            hasAllCachedImages = false
          }
        }

        if (Object.keys(imageMap).length > 0) {
          setPageImages(imageMap)
          console.log(`캐시에서 ${Object.keys(imageMap).length}개 이미지 로드됨`)
        }

        if (!hasAllCachedImages) {
          const imageFolderPath = `${IMAGE_BASE_PATH}/${data.title}`

          try {
            const imagesData = await getAllImages(imageFolderPath)
            if (imagesData && imagesData.images.length > 0) {
              for (let index = 0; index < imagesData.images.length; index++) {
                const img = imagesData.images[index]
                const imageData = `data:image/png;base64,${img.image}`

                if (!imageMap[index]) {
                  imageMap[index] = imageData
                  setImageLoadStates(prev => ({...prev, [index]: true}))
                  await saveImage(currentFid, index, imageData)
                }
              }
              setPageImages(imageMap)
              console.log('서버에서 추가 이미지 로드 및 캐시 저장 완료')
            }
          } catch (error) {
            console.error('이미지 로딩 실패:', error)
          }
        }

        if (!cachedMeta && data.title && data.pages) {
          await saveFairyTaleMeta(currentFid, data.title, data.pages)
        }

        try {
          const resumeData = await resumeReading(uid, fidNum)
          const clipNumber = resumeData?.next_page ?? 1
          const startIdx = (clipNumber - 1) * 2

          console.log(`이어읽기: clipNumber=${clipNumber}, startIdx=${startIdx}`)

          setLoading(false)
          setCurrentPage(startIdx)
          setInitialPage(startIdx)
        } catch (err) {
          console.error('이어읽기 실패:', err)
          setLoading(false)
        }
      } catch (err: any) {
        setError(err.message || '동화책을 불러오는데 실패했습니다.')
        setLoading(false)
      }
    },
    [uid, navigate]
  )

  useEffect(() => {
    if (isStreamMode && uid && !hasStartedGeneration.current) {
      const urlParams = new URLSearchParams(window.location.search)
      const name = urlParams.get('name') || ''
      const age = parseInt(urlParams.get('age') || '7')
      const genre = urlParams.get('genre') || ''

      if (name && age && genre) {
        hasStartedGeneration.current = true
        startStreamGeneration({name, age, genre, uid, type: 2})
      } else {
        setError('동화 생성에 필요한 정보가 없습니다. 다시 시도해주세요.')
        setLoading(false)
      }
    }
  }, [isStreamMode, uid, startStreamGeneration])

  useEffect(() => {
    if (!isStreamMode && uid && fid) {
      loadExistingFairyTale(fid)
    }
  }, [isStreamMode, uid, fid, loadExistingFairyTale])

  const handleImageError = (pageIndex: number) => {
    setImageLoadStates(prev => ({...prev, [pageIndex]: false}))
  }

  const playPageAudio = async (pageIndex: number) => {
    const pages = displayPages
    if (!pages[pageIndex]?.text || !uid) return

    if (isStreamMode && !isStreamCompleted) {
      alert('동화 생성이 완료된 후 음성을 들을 수 있습니다.')
      return
    }

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

      const storedVoiceId = localStorage.getItem('voice_id') || undefined

      const response = await readFairyTalePage(
        uid,
        parseInt(currentFid, 10),
        pageIndex + 1,
        storedVoiceId
      )

      if (!(response instanceof Blob)) {
        console.warn('Unexpected response type:', typeof response)
        return
      }

      const audioUrl = URL.createObjectURL(new Blob([response], {type: 'audio/wav'}))
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
    debouncedUpdateProgress(newPage)
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

    let newPage = currentPage

    if (x > half && currentPage < lastIndex) {
      newPage = Math.min(currentPage + 1, lastIndex)
      setCurrentPage(newPage)
      stopAudio()
    } else if (x <= half && currentPage > 0) {
      newPage = Math.max(currentPage - 1, 0)
      setCurrentPage(newPage)
      stopAudio()
    }

    if (newPage !== currentPage) {
      debouncedUpdateProgress(newPage)
    }
  }

  const goToPrevPage = () => {
    if (!canPrev || !pageFlipRef.current) return

    const newPage = Math.max(currentPage - 1, 0)
    setCurrentPage(newPage)
    stopAudio()
    debouncedUpdateProgress(newPage)

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
    debouncedUpdateProgress(newPage)

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

  const displayPages = isStreamMode ? streamingPages : fairyTale?.pages || []
  const displayTitle = isStreamMode ? streamTitle : fairyTale?.title

  const totalPairs = Math.ceil(displayPages.length / 2)
  const currentPair = Math.floor(currentPage / 2) + 1
  const canPrev = currentPage > 0
  const canNext = currentPage < displayPages.length - 1

  if (loading) {
    const message = '동화책을 불러오는 중...'

    return (
      <div className="min-h-screen bg-pink-50 font-pinkfong">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="text-2xl font-semibold mb-4">{message}</div>
            <div className="mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-pink-500 border-t-transparent mx-auto"></div>
            </div>
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

      {isStreamMode && isGenerating && (
        <div className="fixed top-20 left-4 bg-blue-500 text-white px-4 py-2 rounded-lg z-50 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span>
              페이지 생성 중... ({streamingPages.filter(p => p.text).length}페이지 완료)
            </span>
          </div>
        </div>
      )}

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
        <div className="flex-1 flex items-center justify-center py-8">
          <div className="flex items-start">
            <div
              ref={bookContainerRef}
              className="relative"
              onClick={handleBookClick}
              style={{
                width: PAGE_W * 2,
                height: PAGE_H,
                boxShadow: `
                  0 4px 0 rgba(139, 92, 46, 0.15),
                  0 8px 0 rgba(139, 92, 46, 0.12),
                  0 12px 0 rgba(139, 92, 46, 0.09),
                  0 16px 0 rgba(139, 92, 46, 0.06),
                  0 20px 0 rgba(139, 92, 46, 0.03),
                  0 24px 40px rgba(0, 0, 0, 0.2)
                `
              }}
              title="왼쪽 클릭: 이전 / 오른쪽 클릭: 다음">
              {/* 종이 더미 효과 */}
              <div className="absolute left-1 right-1 -bottom-2 pointer-events-none">
                {[...Array(120)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute left-0 right-0"
                    style={{
                      bottom: `${i * 4}px`,
                      height: '2px',
                      background: `linear-gradient(to bottom, 
                        ${i % 2 === 0 ? '#fef3c7' : '#fde68a'}, 
                        ${i % 2 === 0 ? '#fde68a' : '#fcd34d'})`,
                      borderTop: '0.5px solid rgba(217, 119, 6, 0.3)',
                      marginLeft: `${i * 1.2}px`,
                      marginRight: `${i * 1.2}px`,
                      boxShadow: `0 0.5px 1px rgba(120, 53, 15, ${0.2 + i * 0.01})`,
                      opacity: 0.95,
                      clipPath: `polygon(
                        0 0, 
                        45% 0, 
                        46% ${Math.min(i * 1.5, 30)}px,
                        47% ${Math.min(i * 2.5, 50)}px,
                        48% ${Math.min(i * 3.5, 70)}px,
                        49% ${Math.min(i * 4, 80)}px,
                        50% ${Math.min(i * 5, 100)}px,
                        51% ${Math.min(i * 4, 80)}px,
                        52% ${Math.min(i * 3.5, 70)}px,
                        53% ${Math.min(i * 2.5, 50)}px,
                        54% ${Math.min(i * 1.5, 30)}px,
                        55% 0,
                        100% 0,
                        100% 100%,
                        0 100%
                      )`
                    }}
                  />
                ))}
              </div>

              {/* 중앙 제본 그림자 효과 */}
              <div
                className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
                style={{
                  bottom: '-2px',
                  width: '12px',
                  height: `${100 * 4}px`,
                  background:
                    'linear-gradient(to right, rgba(80, 50, 20, 0.6), rgba(60, 40, 15, 0.8), rgba(80, 50, 20, 0.6))',
                  boxShadow: '0 0 15px rgba(0, 0, 0, 0.4)'
                }}
              />
              {isDataReady && (
                <PageFlip
                  ref={pageFlipRef}
                  width={PAGE_W}
                  height={PAGE_H}
                  startPage={initialPage}
                  onFlip={handlePageFlip}>
                  {displayPages.map((p: any, idx: number) => {
                    const showImage = !!(
                      pageImages[idx] && imageLoadStates[idx] !== false
                    )
                    const hasContent = !!p.text
                    const isDummyDuringStream =
                      isStreamMode &&
                      !isStreamCompleted &&
                      idx === displayPages.length - 1 &&
                      displayPages.length % 2 !== 0

                    return (
                      <div
                        key={idx}
                        className="relative bg-gradient-to-br from-amber-50 via-white to-orange-50 border-4 border-amber-200 p-8 w-[530px] h-[680px] flex flex-col shadow-2xl"
                        style={{
                          backgroundImage: `
                            radial-gradient(circle at 20% 80%, rgba(255, 237, 213, 0.3) 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, rgba(255, 228, 196, 0.2) 0%, transparent 50%),
                            linear-gradient(135deg, rgba(251, 191, 36, 0.05) 0%, rgba(255, 255, 255, 0.8) 50%, rgba(251, 191, 36, 0.05) 100%)
                          `,
                          boxShadow: `
                            0 4px 0 rgba(139, 92, 46, 0.15),
                            0 8px 0 rgba(139, 92, 46, 0.12),
                            0 12px 0 rgba(139, 92, 46, 0.09),
                            0 16px 0 rgba(139, 92, 46, 0.06),
                            0 20px 0 rgba(139, 92, 46, 0.03),
                            0 24px 40px rgba(0, 0, 0, 0.2)
                          `
                        }}
                        data-density={
                          idx === 0 || idx === displayPages.length - 1
                            ? 'hard'
                            : undefined
                        }>
                        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-300 rounded-tl-lg"></div>
                        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-300 rounded-tr-lg"></div>
                        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-300 rounded-bl-lg"></div>
                        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-300 rounded-br-lg"></div>

                        {hasContent && (
                          <div className="absolute top-6 right-6 text-xs text-amber-600 font-medium bg-amber-100 px-2 py-1 rounded-full">
                            {idx + 1}
                          </div>
                        )}

                        <div className="flex-shrink-0 mb-6 h-[480px] w-full flex justify-center">
                          <div className="relative w-[320px] h-[480px]">
                            {showImage ? (
                              <div
                                className="relative w-full h-full group"
                                style={{
                                  animation:
                                    isStreamMode && isGenerating
                                      ? 'fadeIn 0.8s ease-in-out'
                                      : 'none'
                                }}>
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-xl transform rotate-1 group-hover:rotate-2 transition-transform duration-300"></div>
                                <img
                                  src={pageImages[idx]}
                                  alt={`페이지 ${idx + 1}`}
                                  className="relative w-full h-full object-cover rounded-xl border-3 border-white shadow-xl transform group-hover:scale-105 transition-all duration-300"
                                  onError={() => handleImageError(idx)}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-white/10 rounded-xl pointer-events-none"></div>
                              </div>
                            ) : hasContent ? (
                              <div className="w-full h-full rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-dashed border-amber-300 flex items-center justify-center">
                                <div className="text-amber-400">
                                  <svg
                                    className="w-16 h-16 mx-auto mb-2"
                                    fill="currentColor"
                                    viewBox="0 0 24 24">
                                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                                  </svg>
                                  <p className="text-sm text-amber-500">
                                    이미지 생성 중...
                                  </p>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex-1 flex items-start justify-center px-4">
                          {hasContent ? (
                            <div
                              className="relative max-w-[400px]"
                              style={{
                                animation:
                                  isStreamMode && isGenerating
                                    ? 'fadeIn 0.8s ease-in-out'
                                    : 'none'
                              }}>
                              <div className="absolute -inset-4 bg-gradient-to-r from-amber-50/50 via-white/30 to-orange-50/50 rounded-2xl"></div>
                              <p className="relative text-base leading-7 text-gray-800 text-center font-pinkfong tracking-wide">
                                {p.text}
                              </p>
                              <div className="mt-4 flex justify-center">
                                <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
                              </div>
                            </div>
                          ) : isDummyDuringStream || p.text === '' || pageImages[idx] ? (
                            // ✅ 더미 페이지, 빈 텍스트, 또는 이미지만 있을 때는 완전 빈 화면
                            <div className="w-full h-full bg-transparent" />
                          ) : (
                            // ⚠️ 그 외 경우만 "페이지 생성 중..." 스피너 표시
                            <div className="flex flex-col items-center justify-center text-amber-400">
                              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                                <div className="animate-spin rounded-full h-6 w-6 border-2 border-amber-600 border-t-transparent"></div>
                              </div>
                              <p className="text-lg font-semibold font-pinkfong">
                                페이지 생성 중...
                              </p>
                            </div>
                          )}
                        </div>
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
              )}

              <div className="absolute -right-16 bottom-4 flex flex-col items-center gap-4">
                <button
                  onClick={() => {
                    if (isStreamMode && !isStreamCompleted) {
                      alert('스트리밍 완료 후에 음성 재생이 가능합니다.')
                      return
                    }
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
                  onClick={() => {
                    if (isStreamMode && !isStreamCompleted) {
                      alert('스트리밍 완료 후에 음성 재생이 가능합니다.')
                      return
                    }
                    stopAudio()
                  }}
                  disabled={!isPlaying || (isStreamMode && !isStreamCompleted)}
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

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

export default GenerateStory
