// src/components/FairyTaleList.tsx
import React from 'react'
import FairyTaleCard from './FairyTaleCard'
import {Link} from 'react-router-dom' // Link 컴포넌트 import

type FairyTale = {
  id: number
  imageSrc: string
  title: string
  date: string
  subText: string
}

const myFairyTales: FairyTale[] = [
  {
    id: 1,
    imageSrc: '/assets/pepe-2.jpg',
    title: '나는야 골목대장 윤지원',
    date: '2025/08/10',
    subText: '골목대장 웅지현의 일생'
  },
  {
    id: 2,
    imageSrc: '/assets/pepe-2.jpg',
    title: '밤하늘을 여행하는 아이',
    date: '2025/08/10',
    subText: '난이도 조절을 위해 필요해요'
  },
  {
    id: 3,
    imageSrc: '/assets/pepe-2.jpg',
    title: '숲 속의 작은 집',
    date: '2025/08/10',
    subText: '깊은 숲 속 마법을 부리는 소녀'
  },
  {
    id: 4,
    imageSrc: '/assets/pepe-2.jpg',
    title: '별과 함께 잠든 아이',
    date: '2025/08/10',
    subText: '밤이 되니 별과 함께 잠든 아이'
  }
]

const FairyTaleList: React.FC = () => {
  return (
    <section className="p-6 mt-10 bg-white border border-gray-200 shadow-xl rounded-2xl">
      <h3 className="mb-6 text-xl font-bold text-gray-800">나의 동화 리스트</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        {myFairyTales.map(tale => (
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
    </section>
  )
}

export default FairyTaleList
