import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  TimeSeriesScale,
  Tooltip,
  Legend,
  Filler,
  CategoryScale,
} from 'chart.js'
import { live } from '../services/realtime'
import { PnlPoint, Trade } from '../types'
import { formatCurrency, formatDate } from '../utils/format'

ChartJS.register(LineElement, PointElement, LinearScale, TimeSeriesScale, Tooltip, Legend, Filler, CategoryScale)

export default function KolProfile() {
  const { id = '' } = useParams()
  const [series, setSeries] = useState<PnlPoint[]>([])
  const [trades, setTrades] = useState<Trade[]>([])

  useEffect(() => {
    const offP = live.on('pnl', (p) => { if (p.kolId === id) setSeries(p.series) })
    const offT = live.on('trade', (t) => { if (t.kolId === id) setTrades((prev) => [t, ...prev].slice(0, 200)) })
    return () => { offP(); offT() }
  }, [id])

  const latestPnl = series.length ? series[series.length - 1].v : 0

  const data = useMemo(() => ({
    labels: series.map(p => new Date(p.t).toLocaleTimeString()),
    datasets: [
      {
        label: 'PNL',
        data: series.map(p => p.v),
        fill: true,
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.12)',
        tension: 0.3,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  }), [series])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { intersect: false } },
    scales: {
      x: { ticks: { color: '#a3a3a3' }, grid: { color: 'rgba(255,255,255,0.06)' } },
      y: { ticks: { color: '#a3a3a3' }, grid: { color: 'rgba(255,255,255,0.06)' } },
    },
  } as const

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col gap-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-white/10" />
            <div>
              <h1 className="text-xl font-semibold">{id}</h1>
              <p className="text-sm text-neutral-400">Wallet: ************</p>
            </div>
          </div>
          <div className={`text-lg font-semibold ${latestPnl>=0?'text-emerald-400':'text-rose-400'}`}>{formatCurrency(latestPnl)}</div>
        </header>

        <section className="card p-4 h-72">
          <Line data={data} options={options} />
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">Trade History</h2>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="text-left text-neutral-400">
                <tr>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Side</th>
                  <th className="py-3 px-4">Coin</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {trades.map(t => (
                  <tr key={t.id} className="table-row-hover">
                    <td className="py-3 px-4 whitespace-nowrap">{formatDate(t.time)}</td>
                    <td className={`py-3 px-4 ${t.side==='BUY'?'text-emerald-400':'text-rose-400'}`}>{t.side}</td>
                    <td className="py-3 px-4">{t.coin}</td>
                    <td className="py-3 px-4">{formatCurrency(t.price)}</td>
                    <td className="py-3 px-4">{t.volume}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}
