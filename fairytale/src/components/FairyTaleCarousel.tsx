// src/components/FairyTaleCarousel.tsx
import React, {useState, useEffect} from 'react'
import FairyTaleCard from './FairyTaleCard'
import {Link} from 'react-router-dom' // Link 컴포넌트 추가

const initialFairyTales = [
  // id 속성을 추가합니다.
  {
    id: 1,
    imageSrc: '/assets/pepe-2.jpg',
    title: '나는야 골목대장 윤지원',
    date: '2025/06/10',
    subText: '골목대장 웅지현의 일생'
  },
  {
    id: 2,
    imageSrc: '/assets/pepe-2.jpg',
    title: '밤하늘을 여행하는 아이',
    date: '2025/06/10',
    subText: '난이도 조절을 위해 필요해요'
  },
  {
    id: 3,
    imageSrc: '/assets/pepe-2.jpg',
    title: '숲 속의 작은 집',
    date: '2025/06/10',
    subText: '깊은 숲 속 마법을 부리는 소녀'
  },
  {
    id: 4,
    imageSrc: '/assets/pepe-2.jpg',
    title: '별과 함께 잠든 아이',
    date: '2025/06/10',
    subText: '밤이 되니 별과 함께 잠든 아이'
  },
  {
    id: 5,
    imageSrc: '/assets/pepe-2.jpg',
    title: '새로운 모험의 시작',
    date: '2025/06/10',
    subText: '새로운 모험을 떠나는 소년'
  },
  {
    id: 6,
    imageSrc: '/assets/pepe-2.jpg',
    title: '바다 속 신비한 친구들',
    date: '2025/06/10',
    subText: '바다 속 친구들을 만나는 이야기'
  },
  {
    id: 7,
    imageSrc: '/assets/pepe-2.jpg',
    title: '무지개를 찾아서',
    date: '2025/06/10',
    subText: '무지개 끝에 숨겨진 보물을 찾아서'
  },
  {
    id: 8,
    imageSrc: '/assets/pepe-2.jpg',
    title: '신기한 마법의 성',
    date: '2025/06/10',
    subText: '마법의 성에서 일어나는 신기한 일'
  }
]

const FairyTaleCarousel = () => {
  const [items, setItems] = useState(() => {
    const clonedBefore = initialFairyTales.slice(-4)
    const clonedAfter = initialFairyTales.slice(0, 4)
    return [...clonedBefore, ...initialFairyTales, ...clonedAfter]
  })

  const [offset, setOffset] = useState(4)
  const [isTransitioning, setIsTransitioning] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset(prevOffset => prevOffset + 1)
    }, 1500)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (offset >= items.length - 4) {
      setIsTransitioning(false)
      setTimeout(() => {
        setOffset(4)
      }, 10)
    } else {
      setIsTransitioning(true)
    }
  }, [offset, items.length])

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
            <Link to={`/story/${tale.id}`}>
              <FairyTaleCard
                imageSrc={tale.imageSrc}
                title={tale.title}
                date={tale.date}
                subText={tale.subText}
              />
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}

export default FairyTaleCarousel
