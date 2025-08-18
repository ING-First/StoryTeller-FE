import React, {useState} from 'react'
import Header from '../components/Header'
import Button from '../components/Button'
import {useNavigate} from 'react-router-dom' // debug

const StoryForm = () => {
  const [characterName, setCharacterName] = useState('')
  const [age, setAge] = useState('')
  const [genre, setGenre] = useState('')
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    console.log('폼 제출:', {characterName, age, genre})

    // TODO: 여기에 폼 데이터를 서버로 보내는 로직을 추가합니다.
    // 예: API 호출
  }
  // debug
  const navigate = useNavigate()
  const handleGenerateStory = () => {
    console.log('버튼 클릭, 페이지 이동 시작')
    // 다음 페이지로 이동
    navigate('/generate_story') // 이동할 경로를 지정
  }

  return (
    <div className="min-h-screen bg-pink-50">
      <Header />
      <div className="container mx-auto p-4">
        <div className="text-center py-20 flex flex-col items-center">
          <p className="font-pinkfong text-5xl font-extrabold ">
            내 아이만을 위한 동화책을
          </p>
          {/* 두 번째 줄: 왼쪽 마진을 최대로 주고 오른쪽 마진으로 여백 조절 */}
          <p className="font-pinkfong text-5xl font-extrabold text-gray-800 leading-tight">
            만들어보아요!
          </p>
        </div>
      </div>

      {/* 동화 생성 폼 */}
      <div className="container mx-auto p-4 flex flex-col items-center justify-center">
        <section className="mt-10 p-6 w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 주인공 이름 입력 필드 */}
            <div>
              <label
                htmlFor="character-name"
                className="font-pinkfong text-2xl font-bold text-gray-800">
                주인공 이름*
              </label>
              <input
                id="character-name"
                type="text"
                value={characterName}
                onChange={e => setCharacterName(e.target.value)}
                className="w-full px-4 py-3 mt-2 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
                required
              />
            </div>

            {/* 나이 입력 필드 */}
            <div className="relative">
              <label
                htmlFor="age"
                className="font-pinkfong text-2xl font-bold text-gray-800">
                나이*
              </label>
              <input
                id="age"
                type="number"
                value={age}
                onChange={e => setAge(e.target.value)}
                className="w-full px-4 py-3 mt-2 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
                required
              />
              <span className="absolute right-4 top-1/2 mt-2 transform -translate-y-1/2 text-sm text-gray-500">
                난이도 조절을 위해 필요해요!
              </span>
            </div>

            {/* 장르 입력 필드 */}
            <div>
              <label
                htmlFor="genre"
                className="font-pinkfong text-2xl font-bold text-gray-800">
                장르*
              </label>
              <input
                id="genre"
                type="text"
                value={genre}
                onChange={e => setGenre(e.target.value)}
                className="w-full px-4 py-3 mt-2 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
                required
              />
            </div>

            {/* 동화 생성하기 버튼 */}
            <div className="flex justify-center pt-8">
              <button
                // type="submit"
                onClick={handleGenerateStory} // debug
                className="font-pinkfong bg-pink-300 text-pink-800 text-3xl px-16 py-4 rounded-full font-bold shadow-md hover:bg-pink-400 transition-colors">
                동화 생성하기
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}

export default StoryForm
