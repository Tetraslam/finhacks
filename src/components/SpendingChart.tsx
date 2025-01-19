import dynamic from 'next/dynamic'

// Import react-plotly.js dynamically to fix SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

interface SpendingData {
  category: string
  percentage: number
  notes: string
}

interface SpendingChartProps {
  data: SpendingData[]
  className?: string
}

export function SpendingChart({ data, className = '' }: SpendingChartProps) {
  const chartData = [{
    type: 'pie',
    values: data.map(d => d.percentage),
    labels: data.map(d => d.category),
    text: data.map(d => d.notes),
    textinfo: 'label+percent',
    hoverinfo: 'label+percent+text',
    marker: {
      colors: [
        '#FF6B6B', // housing
        '#4ECDC4', // transportation
        '#45B7D1', // food
        '#96CEB4', // healthcare
        '#FFEEAD', // entertainment
        '#D4A5A5', // savings
        '#9FA8DA'  // other
      ]
    },
    hole: 0.4
  }]

  const layout = {
    title: 'Monthly Spending Distribution',
    showlegend: true,
    legend: {
      orientation: 'h',
      y: -0.1
    },
    margin: {
      l: 0,
      r: 0,
      t: 40,
      b: 0
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: {
      color: 'currentColor'
    }
  }

  const config = {
    displayModeBar: false,
    responsive: true
  }

  return (
    <div className={`w-full h-[400px] ${className}`}>
      <Plot
        data={chartData}
        layout={layout}
        config={config}
        useResizeHandler
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  )
} 