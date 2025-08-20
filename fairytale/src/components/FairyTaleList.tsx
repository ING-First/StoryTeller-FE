// src/components/FairyTaleList.tsx
import React, {useState, useEffect} from 'react'
import FairyTaleCard from './FairyTaleCard'
import {Link} from 'react-router-dom'
import {check_records, FairyTale} from '../api/records'

const FairyTaleList: React.FC = () => {
  const [fairyTales, setFairyTales] = useState<FairyTale[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFairyTales = async () => {
      try {
        setIsLoading(true)
        const data = await check_records(localStorage.uid)
        setFairyTales(data.records)
      } catch (err) {
        setError("읽은 기록이 없습니다.")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFairyTales()
  }, [])

  if (isLoading) {
    return (
      <section className="p-6 mt-10 bg-white border border-gray-200 shadow-xl rounded-2xl">
        <h3 className="mb-6 text-xl font-bold text-gray-800">나의 동화 기록</h3>
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="p-6 mt-10 bg-white border border-gray-200 shadow-xl rounded-2xl">
        <h3 className="mb-6 text-xl font-bold text-gray-800">나의 동화 기록</h3>
        <div className="flex justify-center items-center h-32">
          <div className="text-gray-500">{error}</div>
        </div>
      </section>
    )
  }

  return (
    <section className="p-6 mt-10 bg-white border border-gray-200 shadow-xl rounded-2xl">
      <h3 className="mb-6 text-xl font-bold text-gray-800">나의 동화 기록</h3>
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
