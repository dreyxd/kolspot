import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Leaderboard from './pages/Leaderboard'
import KolProfile from './pages/KolProfile'
import KOLTerminal from './pages/KOLTerminal'
import TokenDetailPage from './pages/TokenDetailPage'
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
        <Route path="/terminal" element={<KOLTerminal />} />
        <Route path="/token/:mint" element={<TokenDetailPage />} />
        <Route path="/kol/:id" element={<KolProfile />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        {/* Redirect old KOLBoard route to Terminal */}
        <Route path="/kolboard" element={<Navigate to="/terminal" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App
