// src/components/FairyTaleList.tsx
import React, {useState, useEffect} from 'react'
import FairyTaleCard from './FairyTaleCard'
import {Link} from 'react-router-dom'
import {check_records, FairyTale} from '../api/records'
import {getReadingRecords, saveReadingRecords} from '../utils/storyCache'

const FairyTaleList: React.FC = () => {
  const [fairyTales, setFairyTales] = useState<FairyTale[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFairyTales = async () => {
      try {
        setIsLoading(true)
        const uid = localStorage.uid

        // 1. 캐시된 데이터를 먼저 표시 (빠른 초기 렌더링)
        const cachedRecords = await getReadingRecords(uid)
        if (cachedRecords && cachedRecords.length > 0) {
          setFairyTales(cachedRecords)
          setIsLoading(false)
        }

        // 2. 서버에서 최신 데이터 가져오기 (백그라운드)
        const data = await check_records(uid)

        // 3. 서버 데이터로 업데이트
        setFairyTales(data.records)

        // 4. 캐시 갱신
        await saveReadingRecords(uid, data.records)

        setIsLoading(false)
      } catch (err) {
        setError('읽은 기록이 없습니다.')
        console.error(err)
        setIsLoading(false)
      }
    }

    fetchFairyTales()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (isLoading && fairyTales.length === 0) {
    return (
      <section className="p-6 mt-10 bg-white border border-gray-200 shadow-xl rounded-2xl">
        <h3 className="mb-6 text-xl font-bold text-gray-800 font-pinkfong">
          나의 독서 기록
        </h3>
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500 font-pinkfong">로딩 중...</div>
        </div>
      </section>
    )
  }

  if (error && fairyTales.length === 0) {
    return (
      <section className="p-6 mt-10 bg-white border border-gray-200 shadow-xl rounded-2xl">
        <h3 className="mb-6 text-xl font-bold text-gray-800 font-pinkfong">
          나의 독서 기록
        </h3>
        <div className="flex justify-center items-center h-32">
          <div className="text-gray-500 font-pinkfong">{error}</div>
        </div>
      </section>
    )
  }

  return (
    <section className="p-6 mt-10 bg-white border border-gray-200 shadow-xl rounded-2xl">
      <h3 className="mb-6 text-xl font-bold text-gray-800 font-pinkfong">
        나의 독서 기록
        {isLoading && (
          <span className="ml-2 text-sm text-gray-400 animate-pulse">업데이트 중...</span>
        )}
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        {fairyTales.map(tale => (
          <Link key={tale.fid} to={`/detail/${tale.fid}`} className="cursor-pointer">
            <FairyTaleCard
              imageSrc={tale.image_url}
              title={tale.title}
              date={tale.create_date}
              subText={tale.summary}
            />
          </Link>
        ))}
      </div>
    </section>
  )
}

export default FairyTaleList
