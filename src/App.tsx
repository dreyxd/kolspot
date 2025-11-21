import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import KolProfile from './pages/KolProfile'
import KOLTerminal from './pages/KOLTerminal'
import TokenDetailPage from './pages/TokenDetailPage'
import HowItWorks from './pages/HowItWorks'
import Docs from './pages/Docs'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import About from './pages/About'
import FAQs from './pages/FAQs'
import Disclaimer from './pages/Disclaimer'
import KOLS from './pages/KOLS'
import Roadmap from './pages/Roadmap'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import SpotlightBackground from './components/SpotlightBackground'

function App() {
  return (
    <SpotlightBackground>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/terminal" element={<KOLTerminal />} />
          <Route path="/token/:mint" element={<TokenDetailPage />} />
          <Route path="/kol/:id" element={<KolProfile />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/about" element={<About />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="/kols" element={<KOLS />} />
          <Route path="/roadmap" element={<Roadmap />} />
          {/* Redirect old KOLBoard route to Terminal */}
          <Route path="/kolboard" element={<Navigate to="/terminal" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </div>
    </SpotlightBackground>
  )
}

export default App
