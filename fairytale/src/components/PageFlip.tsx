// src/components/PageFlip.tsx
import React, {forwardRef} from 'react'
import HTMLFlipBook from 'react-pageflip'

interface PageFlipProps {
  width?: number
  height?: number
  startPage?: number
  children?: React.ReactNode
  onFlip?: (e: any) => void
}

const PageFlip = forwardRef<any, PageFlipProps>(
  ({width = 800, height = 1000, startPage = 0, children, onFlip}, ref) => {
    const FlipBookComponent = HTMLFlipBook as any

    return (
      <FlipBookComponent
        ref={ref}
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
        startPage={startPage}
        showPageCorners={true}
        disableFlipByClick={false}
        onFlip={onFlip}
        style={{}}>
        {children}
      </FlipBookComponent>
    )
  }
)

PageFlip.displayName = 'PageFlip'

export default PageFlip
