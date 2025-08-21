import React from 'react'

type FairyTaleCardProps = {
  id?: number
  imageSrc: string
  title: string
  date: string
  subText: string
  className?: string
}

const FairyTaleCard: React.FC<FairyTaleCardProps> = ({
  id,
  imageSrc,
  title,
  date,
  subText,
  className
}) => {
  return (
    <div
      className={`flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer ${className}`}>
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
