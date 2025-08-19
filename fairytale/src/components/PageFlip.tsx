// src/components/PageFlip.tsx
import React from 'react'
import HTMLFlipBook from 'react-pageflip'

interface PageFlipProps {
  width?: number
  height?: number
  children?: React.ReactNode
}

const PageFlip: React.FC<PageFlipProps> = ({width = 800, height = 1000, children}) => {
  return (
    <HTMLFlipBook
      width={width}
      height={height}
      className="book"
      size="fixed"
      minWidth={600}
      maxWidth={800}
      minHeight={800}
      maxHeight={1000}
      drawShadow={true}
      flippingTime={1000}
      usePortrait={true}
      startZIndex={0}
      autoSize={true}
      maxShadowOpacity={1}
      showCover={false}
      mobileScrollSupport={true}
      swipeDistance={30}
      clickEventForward={true}
      useMouseEvents={true}
      renderOnlyPageLengthChange={false}
      startPage={0}
      showPageCorners={true}
      disableFlipByClick={false}
      style={{}}>
      {children}
    </HTMLFlipBook>
  )
}

export default PageFlip
