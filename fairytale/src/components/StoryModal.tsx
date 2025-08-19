// src/components/StoryModal.tsx
import React from 'react'

type Story = {
  id: number
  imageSrc: string
  title: string
  date: string
  subText: string
}

type StoryModalProps = {
  story: Story
  onClose: () => void
}

const StoryModal: React.FC<StoryModalProps> = ({story, onClose}) => {
  if (!story) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="w-full max-w-2xl p-6 transition-transform duration-300 transform scale-95 bg-white shadow-lg rounded-2xl md:scale-100">
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 focus:outline-none">
            &times;
          </button>
        </div>
        <div className="flex flex-col items-center mt-4 space-y-4 md:flex-row md:items-start md:space-y-0 md:space-x-8">
          <div className="flex-shrink-0 w-full md:w-1/2">
            <img
              src={story.imageSrc}
              alt={story.title}
              className="w-full rounded-lg shadow-md"
            />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-extrabold text-gray-800 font-pinkfong">
              {story.title}
            </h1>
            <p className="mt-2 text-gray-500">{story.date}</p>
            <p className="mt-4 text-lg text-gray-700">{story.subText}</p>
            <button className="px-8 py-4 mt-8 text-xl font-bold text-pink-800 transition-colors bg-pink-300 rounded-full shadow-md font-pinkfong hover:bg-pink-400">
              동화책 읽으러 가기 &gt;&gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StoryModal
