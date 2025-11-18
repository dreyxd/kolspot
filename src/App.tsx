import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Leaderboard from './pages/Leaderboard'
import KolProfile from './pages/KolProfile'
import KOLBoard from './pages/KOLBoard'
import HowItWorks from './pages/HowItWorks'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/kolboard" element={<KOLBoard />} />
        <Route path="/kol/:id" element={<KolProfile />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App
