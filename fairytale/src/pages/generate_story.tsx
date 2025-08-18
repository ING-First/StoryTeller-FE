// src/pages/StoryGenerator.tsx

import React, {useState} from 'react'
import Header from '../components/Header'

const StoryGenerator = () => {
  const [generatedContent, setGeneratedContent] = useState<string | null>(null)
  const [generatedCaption, setGeneratedCaption] = useState<string | null>(null) // 자막 상태 추가

  const handleGenerateStory = () => {
    // API 호출이 성공했다고 가정하고, 더미 URL과 자막으로 상태를 업데이트합니다.
    const dummyImageUrl = 'https://picsum.photos/600/400'
    const dummyCaption =
      '아주 먼 옛날, 작은 마을에 살던 소녀는 밤하늘을 여행하는 꿈을 꾸었습니다.'

    setGeneratedContent(dummyImageUrl)
    setGeneratedCaption(dummyCaption) // 자막 상태 업데이트
  }

  return (
    <div className="min-h-screen bg-pink-50">
      <Header />
      <div className="container mx-auto p-4 flex flex-col items-center justify-center">
        <section className="mt-10 p-6 w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-200">
          <div className="text-center">
            {generatedContent ? (
              // URL이 존재할 경우 이미지와 자막 컨테이너를 표시
              <div className="w-full h-auto">
                <h3 className="font-pinkfong text-2xl font-bold mb-4">생성된 동화</h3>

                {/* 이미지 컨테이너 */}
                <img
                  src={generatedContent}
                  alt="생성된 동화"
                  className="w-full rounded-lg shadow-md"
                />

                {/* 자막 컨테이너 */}
                {generatedCaption && (
                  <div className="mt-4 p-4 bg-gray-100 rounded-lg text-lg text-gray-700">
                    {generatedCaption}
                  </div>
                )}
              </div>
            ) : (
              // URL이 없을 경우, 폼 또는 안내 메시지를 표시
              <div className="flex flex-col items-center justify-center">
                <h3 className="font-pinkfong text-2xl font-bold mb-4">
                  동화를 생성하세요!
                </h3>
                <button
                  onClick={handleGenerateStory}
                  className="font-pinkfong bg-pink-300 text-pink-800 text-xl px-8 py-4 rounded-full font-bold shadow-md hover:bg-pink-400 transition-colors">
                  동화 생성 시작
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default StoryGenerator
