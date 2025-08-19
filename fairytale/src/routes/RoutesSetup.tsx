import React from 'react'
// Route component는 path와 element속성을 제공
import {Routes, Route} from 'react-router-dom'
import Homepage from '../pages/home'
import ProfilePage from '../pages/profile'
import SignupPage from '../pages/signup'
import VoiceRegister from '../pages/voice_register'
import StoryForm from '../pages/generate_form'
import StoryGenerator from '../pages/generate_story'
import LoginPage from '../pages/login'
import NoMatch from '../routes/NoMatch'

export default function RoutesSetup() {
  return (
    <Routes>
      {/* <Route path="*" element={<NoMatch />} /> */}
      <Route path="/" element={<Homepage />} />
      <Route path="/voice_register" element={<VoiceRegister />} />
      <Route path="/generate_form" element={<StoryForm />} />
      <Route path="/generate_story" element={<StoryGenerator />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  )
}
