import { Trade } from '../types'

// Persistent trade store that maintains state across component unmounts
class TradeStore {
  private trades: Trade[] = []
  private listeners: Set<(trades: Trade[]) => void> = new Set()
  private maxTrades = 3000

  addTrade(trade: Trade) {
    // Add new trade to the beginning
    this.trades = [trade, ...this.trades].slice(0, this.maxTrades)
    this.notifyListeners()
  }

  getTrades(): Trade[] {
    return [...this.trades]
  }

  subscribe(callback: (trades: Trade[]) => void): () => void {
    this.listeners.add(callback)
    // Immediately call with current state
    callback(this.getTrades())
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback)
    }
  }

  private notifyListeners() {
    const currentTrades = this.getTrades()
    this.listeners.forEach(listener => listener(currentTrades))
  }

  clear() {
    this.trades = []
    this.notifyListeners()
  }
}

export const tradeStore = new TradeStore()
