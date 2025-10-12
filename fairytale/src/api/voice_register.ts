import api from './index'

export async function voice_register(voice: {uid: number; audio: File}) {
  const formData = new FormData()
  formData.append('uid', voice.uid.toString())
  formData.append('audio', voice.audio)

  const token = localStorage.getItem('access_token')

  const res = await api.post('/voices/register', formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  })

  return res.data
}
