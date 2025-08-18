// src/components/FairyTaleList.tsx

import React from 'react'
import FairyTaleCard from './FairyTaleCard'

const FairyTaleList = () => {
  // 임시 데이터 (실제로는 API 호출을 통해 받아옵니다)
  const fairyTales = [
    {
      id: 1,
      imageSrc: '/assets/pepe-2.jpg',
      title: '나는야 골목대장 윤지원',
      date: '2025/06/10',
      subText: '골목대장 윤지원의 일생'
    },
    {
      id: 2,
      imageSrc: '/assets/pepe-2.jpg',
      title: '밤하늘을 여행하는 아이',
      date: '2025/06/10',
      subText: '날수있다는 헛된 꿈을 꾸는 아이의 이야기'
    },
    {
      id: 3,
      imageSrc: '/assets/pepe-2.jpg',
      title: '숲 속의 작은 집',
      date: '2025/06/10',
      subText: '깊은 숲속 마법을 부리는 노인의 삶'
    },
    {
      id: 4,
      imageSrc: '/assets/pepe-2.jpg',
      title: '별과 아이',
      date: '2025/06/10',
      subText: '별이 아니라 벌에 쏘인 아이'
    }
  ]

  return (
    <section className="mt-10 p-6 bg-white rounded-2xl shadow-xl border border-gray-200">
      {/* "동화 리스트" 제목 추가 */}
      <h3 className="text-xl font-bold text-gray-800 mb-6">동화 리스트</h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {fairyTales.map(tale => (
          <FairyTaleCard
            key={tale.id}
            imageSrc={tale.imageSrc}
            title={tale.title}
            date={tale.date}
            subText={tale.subText}
          />
        ))}
      </div>
    </section>
  )
}

export default FairyTaleList
