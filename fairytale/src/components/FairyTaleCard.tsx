// src/components/FairyTaleCard.tsx

import React from 'react'

type FairyTaleCardProps = {
  imageSrc: string
  title: string
  date: string
  subText: string
  className?: string
}

// 여기에서 React.FC에 props 타입을 제네릭으로 명시해야 합니다.
const FairyTaleCard: React.FC<FairyTaleCardProps> = ({
  imageSrc,
  title,
  date,
  subText,
  className
}) => {
  return (
    <div className="flex flex-col items-center p-4 transition-shadow bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-md">
      <img src={imageSrc} alt={title} className="object-cover w-full rounded-md" />

      <div className="w-full mt-2 text-center">
        <p className="text-sm font-semibold text-gray-800 truncate">{title}</p>
        <p className="mt-1 text-xs text-gray-500">{date}</p>
        <p className="text-xs text-gray-500">{subText}</p>
      </div>
    </div>
  )
}

export default FairyTaleCard
