// src/components/FairyTaleCard.tsx

import React from 'react'

type FairyTaleCardProps = {
  imageSrc: string
  title: string
  date: string
  subText: string
}

// 여기에서 React.FC에 props 타입을 제네릭으로 명시해야 합니다.
const FairyTaleCard: React.FC<FairyTaleCardProps> = ({
  imageSrc,
  title,
  date,
  subText
}) => {
  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow">
      <img src={imageSrc} alt={title} className="w-full rounded-md object-cover" />

      <div className="mt-2 text-center w-full">
        <p className="text-sm font-semibold text-gray-800 truncate">{title}</p>
        <p className="text-xs text-gray-500 mt-1">{date}</p>
        <p className="text-xs text-gray-500">{subText}</p>
      </div>
    </div>
  )
}

export default FairyTaleCard
