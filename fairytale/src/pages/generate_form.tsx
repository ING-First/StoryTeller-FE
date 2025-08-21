import React, {useState, useEffect, useRef} from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { generate } from '../api/story_generate'

const StoryForm = () => {
  const [characterName, setCharacterName] = useState('')
  const [age, setAge] = useState('')
  const [genre, setGenre] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const hasCheckedLogin = useRef(false)

  useEffect(() => {
    if (hasCheckedLogin.current) return
    hasCheckedLogin.current = true

    const uid = localStorage.getItem('uid')
    if (!uid) {
      alert("로그인이 필요합니다.")
      navigate('/')
    }
  }, [navigate])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    console.log('폼 제출:', {characterName, age, genre})

    if (!characterName) {
      alert("주인공 이름을 입력해주세요.");
      return;
    }

    if (!age) {
      alert("나이를 입력해주세요.");
      return;
    }

    if (!genre) {
      alert("장르를 입력해주세요.");
      return;
    }

    try {
      setLoading(true)
      const res = await generate({
        name: characterName,
        age: Number(age),
        genre: genre,
        uid: localStorage.uid,
        type: 2
      });
      console.log(res);
      alert(res.message);
      window.location.href = `/generate_story/${res.fid}`;
    } catch (err: any) {
      console.error(err);
      alert("동화생성을 샐패했습니다.");
    } finally {
      setLoading(false)  // 로딩 종료
    }
  };

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
              <input
                type="submit"
                className="font-pinkfong bg-pink-300 text-pink-800 text-3xl px-16 py-4 rounded-full font-bold shadow-md hover:bg-pink-400 transition-colors"
                value={loading ? "생성 중..." : "동화 생성하기"}
              />
            </div>
            
          </form>
        </section>
      </div>
      {/* 로딩 오버레이 */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50">
          <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
          <p className="mt-6 text-white text-xl font-bold">동화를 생성 중이에요...</p>
        </div>
      )}
    </div>
  )
}

export default StoryForm
