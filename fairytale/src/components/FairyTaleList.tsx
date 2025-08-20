import React, {useState, useEffect} from 'react'
import FairyTaleCard from './FairyTaleCard'
import {Link} from 'react-router-dom'
import {fetchFairyTalesByUser, FairyTale} from '../api/books'

// 임시 유저 ID. 실제로는 로그인 상태에서 가져와야 합니다.
const MOCK_USER_ID = 1

const FairyTaleList: React.FC = () => {
  const [myFairyTales, setMyFairyTales] = useState<FairyTale[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getMyFairyTales = async () => {
      try {
        const userTales = await fetchFairyTalesByUser(MOCK_USER_ID)
        setMyFairyTales(userTales)
      } catch (error) {
        console.error('Failed to load my fairy tales from API', error)
        setMyFairyTales([])
      } finally {
        setLoading(false)
      }
    }
    getMyFairyTales()
  }, [])

  if (loading) {
    return <div>나의 동화를 불러오는 중...</div>
  }

  if (myFairyTales.length === 0) {
    return <div>생성된 동화가 없습니다.</div>
  }

  return (
    <section className="p-6 mt-10 bg-white border border-gray-200 shadow-xl rounded-2xl">
      <h3 className="mb-6 text-xl font-bold text-gray-800">나의 동화 리스트</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        {myFairyTales.map(tale => (
          <Link key={tale.fid} to={`/story/${tale.fid}`} className="cursor-pointer">
            <FairyTaleCard
              id={tale.fid}
              imageSrc={tale.image_path}
              title={tale.title}
              date={tale.createDate}
              subText={tale.summary}
            />
          </Link>
        ))}
      </div>
    </section>
  )
}

export default FairyTaleList
