import React from 'react'
import {Link} from 'react-router-dom'

type FairyTaleCardProps = {
  id?: number // Make the id prop optional
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
  const content = (
    <div
      className={`flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow ${
        id ? 'cursor-pointer' : ''
      } ${className}`}>
      <img src={imageSrc} alt={title} className="object-cover w-full rounded-md" />
      <div className="w-full mt-2 text-center">
        <p className="text-sm font-semibold text-gray-800 truncate">{title}</p>
        <p className="mt-1 text-xs text-gray-500">{date}</p>
        <p className="text-xs text-gray-500">{subText}</p>
      </div>
    </div>
  )

  // If id exists, render as a clickable Link
  if (id) {
    return <Link to={`/story/${id}`}>{content}</Link>
  }

  // If no id, render as a non-clickable div
  return content
}

export default FairyTaleCard
