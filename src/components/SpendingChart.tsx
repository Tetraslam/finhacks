import { useEffect, useRef } from 'react'
import Plotly from 'plotly.js-dist-min'

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
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartRef.current) return

    const categories = data.map(d => d.category)
    const percentages = data.map(d => d.percentage)
    const notes = data.map(d => d.notes)

    const colors = [
      '#FF6B6B', // housing
      '#4ECDC4', // transportation
      '#45B7D1', // food
      '#96CEB4', // healthcare
      '#FFEEAD', // entertainment
      '#D4A5A5', // savings
      '#9FA8DA'  // other
    ]

    const trace = {
      type: 'pie',
      values: percentages,
      labels: categories,
      text: notes,
      textinfo: 'label+percent',
      hoverinfo: 'label+percent+text',
      marker: {
        colors: colors
      },
      hole: 0.4
    }

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

    Plotly.newPlot(chartRef.current, [trace], layout, {
      displayModeBar: false,
      responsive: true
    })

    return () => {
      if (chartRef.current) {
        Plotly.purge(chartRef.current)
      }
    }
  }, [data])

  return (
    <div className={`w-full h-[400px] ${className}`}>
      <div ref={chartRef} className="w-full h-full" />
    </div>
  )
} 