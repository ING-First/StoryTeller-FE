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
        setFairyTales(data)
      } catch (err) {
        setError('동화를 불러오는데 실패했습니다.')
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
        <h3 className="mb-6 text-xl font-bold text-gray-800">나의 동화 리스트</h3>
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="p-6 mt-10 bg-white border border-gray-200 shadow-xl rounded-2xl">
        <h3 className="mb-6 text-xl font-bold text-gray-800">나의 동화 리스트</h3>
        <div className="flex items-center justify-center h-32">
          <div className="text-red-500">{error}</div>
        </div>
      </section>
    )
  }

  return (
    <section className="p-6 mt-10 bg-white border border-gray-200 shadow-xl rounded-2xl">
      <h3 className="mb-6 text-xl font-bold text-gray-800">나의 동화 리스트</h3>
      {fairyTales.length === 0 ? (
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500">아직 생성된 동화가 없습니다.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          {fairyTales.map(tale => (
            <Link key={tale.id} to={`/story/${tale.id}`} className="cursor-pointer">
              <FairyTaleCard
                imageSrc={tale.imageSrc}
                title={tale.title}
                date={tale.date}
                subText={tale.subText}
              />
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

export default FairyTaleList
