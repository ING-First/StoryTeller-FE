import React from 'react'
import PageFlip from '../components/PageFlip'
import Header from '../components/Header'
const GenerateStroy = () => {
  return (
    <div className="min-h-screen bg-pink-50">
      <Header />
      <div className="flex items-center justify-center h-screen">
        <PageFlip width={600} height={800}>
          <div className="flex items-center justify-center text-2xl font-semibold bg-white border-4 border-gray-300 rounded-lg shadow-xl">
            Page 1
          </div>
          <div className="flex items-center justify-center text-2xl font-semibold bg-white border-4 border-gray-300 rounded-lg shadow-xl">
            Page 2
          </div>
          <div className="flex items-center justify-center text-2xl font-semibold bg-white border-4 border-gray-300 rounded-lg shadow-xl">
            Page 3
          </div>
          <div className="flex items-center justify-center text-2xl font-semibold bg-white border-4 border-gray-300 rounded-lg shadow-xl">
            Page 4
          </div>
        </PageFlip>
      </div>
    </div>
  )
}

export default GenerateStroy
