import React from 'react'
import {useNavigate} from 'react-router-dom' // 페이지 이동을 위한 훅

type ButtonProps = {
  children: React.ReactNode
  to?: string // 이동할 경로를 props로 받음 (선택적)
  onClick?: () => void // 클릭 이벤트 핸들러 (선택적)
  className?: string
}

const Button: React.FC<ButtonProps> = ({children, to, onClick, className}) => {
  const navigate = useNavigate()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // onClick 함수가 prop으로 전달되면 먼저 실행합니다.
    if (onClick) {
      onClick()
    }
    // to 속성이 있으면 페이지 이동을 실행합니다.
    if (to) {
      navigate(to)
    }
  } // 👈 여기에 닫는 중괄호가 있어야 합니다.

  return (
    <button
      className={`bg-pink-300 text-pink-800 px-8 py-4 rounded-full font-semibold shadow-md hover:bg-pink-400 transition-colors ${className}`}
      onClick={handleClick}>
      {children}
    </button>
  )
}

export default Button
