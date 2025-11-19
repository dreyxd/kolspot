import { useEffect } from 'react';

interface ChartWidgetProps {
  tokenMint: string;
  height?: number | string;
}

// Moralis price chart widget loader. Injects script once and (re)initializes when tokenMint changes.
export default function ChartWidget({ tokenMint, height = 500 }: ChartWidgetProps) {
  useEffect(() => {
    const containerId = 'price-chart-widget-container';

    function loadWidget() {
      // @ts-ignore - external script provides global
      if (typeof window.createMyWidget === 'function') {
        // @ts-ignore
        window.createMyWidget(containerId, {
          autoSize: true,
            chainId: 'solana',
            tokenAddress: tokenMint,
            showHoldersChart: true,
            defaultInterval: '1D',
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Etc/UTC',
            theme: 'dark',
            locale: 'en',
            showCurrencyToggle: true,
            hideLeftToolbar: false,
            hideTopToolbar: false,
            hideBottomToolbar: false
        });
      } else {
        // Widget script not yet ready; will rely on onload callback
        // Could add a small retry if needed.
      }
    }

    const existing = document.getElementById('moralis-chart-widget');
    if (!existing) {
      const script = document.createElement('script');
      script.id = 'moralis-chart-widget';
      script.src = 'https://moralis.com/static/embed/chart.js';
      script.type = 'text/javascript';
      script.async = true;
      script.onload = loadWidget;
      document.body.appendChild(script);
    } else {
      loadWidget();
    }
  }, [tokenMint]);

  return (
    <div
      id="price-chart-widget-container"
      style={{ width: '100%', height: typeof height === 'number' ? `${height}px` : height }}
    />
  );
}
