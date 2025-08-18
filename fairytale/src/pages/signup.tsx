import type {FC} from 'react'

type HomeProps = {
  title?: string
}

const Home: FC<HomeProps> = ({title}) => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold">{title || 'Welcome to Fairytale'}</h1>
      <p className="mt-4">This is the home page of the Fairytale application.</p>
    </div>
  )
}

export default Home
