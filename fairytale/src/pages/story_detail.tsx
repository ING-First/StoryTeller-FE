import React from 'react'
import {useParams, useNavigate} from 'react-router-dom'
import Header from '../components/Header'

const allFairyTales = [
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

const StoryDetailPage = () => {
  const {id} = useParams()
  const navigate = useNavigate()

  const story = allFairyTales.find(tale => tale.id === Number(id))

  if (!story) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-pink-50">
        <Header />
        <p className="mt-20 text-xl text-gray-700">동화를 찾을 수 없습니다.</p>
        <button
          onClick={() => navigate('/mypage')}
          className="px-6 py-2 mt-4 text-white bg-pink-400 rounded-full hover:bg-pink-500">
          돌아가기
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-pink-50">
      <Header />
      <div className="flex flex-col items-center justify-center w-full max-w-4xl p-6 mx-auto mt-10 bg-white border border-gray-200 shadow-xl rounded-2xl">
        <div className="flex flex-col items-center space-y-8 md:flex-row md:items-start md:space-y-0 md:space-x-12">
          <div className="flex-shrink-0 w-full md:w-1/2">
            <img
              src={story.imageSrc}
              alt={story.title}
              className="w-full rounded-lg shadow-md"
            />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-5xl font-extrabold text-gray-800 font-pinkfong">
              {story.title}
            </h1>
            <p className="mt-4 text-gray-500">{story.date}</p>
            <p className="mt-6 text-lg text-gray-700">{story.subText}</p>
            <button className="px-10 py-5 mt-10 text-xl font-bold text-pink-800 transition-colors bg-pink-300 rounded-full shadow-md font-pinkfong hover:bg-pink-400">
              동화책 읽기 &gt;&gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StoryDetailPage
