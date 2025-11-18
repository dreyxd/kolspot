import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Leaderboard from './pages/Leaderboard'
import KolProfile from './pages/KolProfile'
import KOLBoard from './pages/KOLBoard'
import Navbar from './components/Navbar'

function App() {
  return (
    <div className="min-h-full">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/kolboard" element={<KOLBoard />} />
        <Route path="/kol/:id" element={<KolProfile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
