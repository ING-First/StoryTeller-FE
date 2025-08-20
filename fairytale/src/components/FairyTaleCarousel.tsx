import React, {useState, useEffect} from 'react'
import FairyTaleCard from './FairyTaleCard'
import {Link} from 'react-router-dom'
import {fetchDefaultFairyTales, FairyTale} from '../api/books'

const FairyTaleCarousel = () => {
  const [initialFairyTales, setInitialFairyTales] = useState<FairyTale[]>([])
  const [items, setItems] = useState<FairyTale[]>([])
  const [offset, setOffset] = useState(4)
  const [isTransitioning, setIsTransitioning] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getFairyTales = async () => {
      try {
        const dbTales = await fetchDefaultFairyTales()
        setInitialFairyTales(dbTales)
      } catch (error) {
        console.error('Failed to load fairy tales from API', error)
        setInitialFairyTales([])
      } finally {
        setLoading(false)
      }
    }
    getFairyTales()
  }, [])

  useEffect(() => {
    if (initialFairyTales.length > 0) {
      const clonedBefore = initialFairyTales.slice(-4)
      const clonedAfter = initialFairyTales.slice(0, 4)
      setItems([...clonedBefore, ...initialFairyTales, ...clonedAfter])
    }
  }, [initialFairyTales])

  useEffect(() => {
    if (items.length > 0) {
      const interval = setInterval(() => {
        setOffset(prevOffset => prevOffset + 1)
      }, 1500)
      return () => clearInterval(interval)
    }
  }, [items])

  useEffect(() => {
    if (items.length > 0 && offset >= items.length - 4) {
      setIsTransitioning(false)
      setTimeout(() => {
        setOffset(4)
      }, 10)
    } else {
      setIsTransitioning(true)
    }
  }, [offset, items.length])

  if (loading) {
    return <div>로딩 중...</div>
  }

  if (initialFairyTales.length === 0) {
    return null // 데이터가 없으면 캐러셀을 렌더링하지 않음
  }

  return (
    <section className="p-6 mt-10 overflow-hidden bg-white border border-gray-200 shadow-xl rounded-2xl">
      <h3 className="mb-6 text-xl font-bold text-gray-800">동화 리스트</h3>
      <div
        className={`flex ${
          isTransitioning ? 'transition-transform duration-1000 ease-in-out' : ''
        }`}
        style={{transform: `translateX(-${offset * 25}%)`}}>
        {items.map((tale, index) => (
          <div key={index} className="flex-shrink-0 w-1/4 px-2">
            <Link to={`/story/${tale.fid}`}>
              <FairyTaleCard
                id={tale.fid}
                imageSrc={tale.image}
                title={tale.title}
                date={tale.createDate}
                subText={tale.summary}
              />
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}

export default FairyTaleCarousel
