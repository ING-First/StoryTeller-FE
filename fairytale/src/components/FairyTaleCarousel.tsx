// src/components/FairyTaleCarousel.tsx
import React, {useState, useEffect} from 'react'
import FairyTaleCard from './FairyTaleCard'
import {Link} from 'react-router-dom'
import {fetchDefaultFairyTales, FairyTale, fetchMyFairyTales} from '../api/books'
import {getFairyTaleList, saveFairyTaleList} from '../utils/storyCache'

const FairyTaleCarousel = () => {
  const [initialFairyTales, setInitialFairyTales] = useState<FairyTale[]>([])
  const [items, setItems] = useState<FairyTale[]>([])
  const [offset, setOffset] = useState(4)
  const [isTransitioning, setIsTransitioning] = useState(true)
  const [loading, setLoading] = useState(true)
  // check login
  const isLogginedIn = !!localStorage.getItem('token')

  useEffect(() => {
    const getFairyTales = async () => {
      try {
        const cachedList = await getFairyTaleList()

        if (cachedList) {
          setInitialFairyTales(cachedList)
          setLoading(false)
          return
        }

        const dbTales = isLogginedIn
          ? await fetchMyFairyTales()
          : await fetchDefaultFairyTales()

        setInitialFairyTales(dbTales)

        await saveFairyTaleList(dbTales)
      } catch (error) {
        console.error('Failed to load fairy tales from API', error)
        setInitialFairyTales([])
      } finally {
        setLoading(false)
      }
    }
    getFairyTales()
  }, [isLogginedIn])

  useEffect(() => {
    if (initialFairyTales.length > 0) {
      if (initialFairyTales.length >= 4) {
        const clonedBefore = initialFairyTales.slice(-4)
        const clonedAfter = initialFairyTales.slice(0, 4)
        setItems([...clonedBefore, ...initialFairyTales, ...clonedAfter])
        setOffset(4)
      } else {
        setItems(initialFairyTales)
        setOffset(0)
      }
    }
  }, [initialFairyTales])

  useEffect(() => {
    if (items.length > 0 && initialFairyTales.length >= 4) {
      const interval = setInterval(() => {
        setOffset(prevOffset => prevOffset + 1)
      }, 1500)
      return () => clearInterval(interval)
    }
  }, [items, initialFairyTales])

  useEffect(() => {
    if (initialFairyTales.length >= 4 && items.length > 0) {
      if (offset >= items.length - 4) {
        setIsTransitioning(false)
        setTimeout(() => {
          setOffset(4)
        }, 10)
      } else {
        setIsTransitioning(true)
      }
    }
  }, [offset, items, initialFairyTales])

  if (loading) {
    return <div className="py-10 text-center font-pinkfong">로딩 중...</div>
  }

  if (initialFairyTales.length === 0) {
    return null
  }

  return (
    <section className="p-6 mt-10 overflow-hidden bg-white border border-gray-200 shadow-xl rounded-2xl font-pinkfong">
      <div
        className={`flex ${
          isTransitioning && initialFairyTales.length >= 4
            ? 'transition-transform duration-1000 ease-in-out'
            : ''
        }`}
        style={{
          transform:
            initialFairyTales.length >= 4
              ? `translateX(-${offset * 25}%)`
              : 'translateX(0)'
        }}>
        {items.map((tale, index) => (
          <div key={index} className="flex-shrink-0 w-1/4 px-2">
            <Link to={`/detail/${tale.fid}`}>
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
