// src/components/FairyTaleList.tsx
import React, {useState} from 'react'
import FairyTaleCard from './FairyTaleCard'
import StoryModal from './StoryModal'

// 동화 데이터의 타입을 정의합니다.
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
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedStory, setSelectedStory] = useState<FairyTale | null>(null)

  const handleCardClick = (story: FairyTale) => {
    setSelectedStory(story)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedStory(null)
  }

  return (
    <section className="p-6 mt-10 bg-white border border-gray-200 shadow-xl rounded-2xl">
      <h3 className="mb-6 text-xl font-bold text-gray-800">나의 동화 리스트</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        {myFairyTales.map(tale => (
          <div key={tale.id} onClick={() => handleCardClick(tale)}>
            <FairyTaleCard
              id={tale.id}
              imageSrc={tale.imageSrc}
              title={tale.title}
              date={tale.date}
              subText={tale.subText}
            />
          </div>
        ))}
      </div>
      {modalOpen && selectedStory && (
        <StoryModal story={selectedStory} onClose={handleCloseModal} />
      )}
    </section>
  )
}

export default FairyTaleList
