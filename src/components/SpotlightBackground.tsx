import { useRef, ReactNode } from 'react'
import backgroundImage from '../assets/dark_square_grid_background.jpg'

interface SpotlightBackgroundProps {
  children: ReactNode
}

export default function SpotlightBackground({ children }: SpotlightBackgroundProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    containerRef.current.style.setProperty('--mx', `${x}%`)
    containerRef.current.style.setProperty('--my', `${y}%`)
  }

  const handleMouseLeave = () => {
    if (!containerRef.current) return
    containerRef.current.style.removeProperty('--mx')
    containerRef.current.style.removeProperty('--my')
  }

  return (
    <div
      ref={containerRef}
      className="spotlight-bg"
      style={{ backgroundImage: `url(${backgroundImage})` }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  )
}
