import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, LineData, LineSeriesOptions } from 'lightweight-charts';

interface PriceChartProps {
  tokenMint: string;
  price?: number | null;
  height?: number | string;
}

// TradingView Lightweight Charts based price chart (dark theme)
export default function PriceChart({ tokenMint, price, height = 500 }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const [data, setData] = useState<LineData[]>([]);

  // Initialize the chart once
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: { color: 'transparent' },
        textColor: '#e5e7eb',
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.08)',
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.08)',
        timeVisible: true,
        secondsVisible: true,
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.06)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.06)' },
      },
      crosshair: {
        mode: 1,
      },
    });

    const lineSeriesOptions: Partial<LineSeriesOptions> = {
      color: '#22d3ee',
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: true,
      crosshairMarkerVisible: true,
    };

    const series = chart.addLineSeries(lineSeriesOptions);

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      chart.applyOptions({}); // autoSize handles resizing
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  // Reset data when token changes
  useEffect(() => {
    setData([]);
    if (seriesRef.current) {
      seriesRef.current.setData([]);
    }
  }, [tokenMint]);

  // Append new point whenever price updates (every 5s from parent)
  useEffect(() => {
    if (price === undefined || price === null || !isFinite(price)) return;
    const nowSec = Math.floor(Date.now() / 1000);

    setData(prev => {
      if (prev.length > 0 && nowSec === prev[prev.length - 1].time) {
        const updated = [...prev.slice(0, -1), { time: nowSec as any, value: Number(price) }];
        seriesRef.current?.setData(updated);
        return updated;
      }
      const next = [...prev, { time: nowSec as any, value: Number(price) }];
      seriesRef.current?.setData(next);
      return next;
    });
  }, [price]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: typeof height === 'number' ? `${height}px` : height }}
    />
  );
}
