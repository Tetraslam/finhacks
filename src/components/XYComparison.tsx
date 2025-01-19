"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type Demographics } from "@/lib/schema"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import dynamic from "next/dynamic"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

// Import Plotly dynamically to fix SSR issues
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false })

interface XYComparisonProps {
  demographics: Demographics
  cache: {[key: string]: any}
}

type MetricType = 
  | "spending"
  | "income"
  | "portfolio_value"
  | "risk_score"
  | "savings"
  | "expenses"
  | "assets"
  | "liabilities"

interface ComparisonData {
  x: number[]
  y: number[]
  labels: string[]
  xTitle: string
  yTitle: string
  title: string
  trendline: {
    x: number[]
    y: number[]
  }
  analysis: string[]
}

export function XYComparison({ demographics, cache }: XYComparisonProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [xMetric, setXMetric] = React.useState<MetricType>("income")
  const [yMetric, setYMetric] = React.useState<MetricType>("spending")
  const [comparisonData, setComparisonData] = React.useState<ComparisonData | null>(null)
  const [streamedResponse, setStreamedResponse] = React.useState("")
  const [partialData, setPartialData] = React.useState<string>("")
  const { toast } = useToast()

  // Memoize the demographics object to prevent unnecessary re-renders
  const memoizedDemographics = React.useMemo(() => demographics, [
    demographics.age,
    demographics.occupation,
    demographics.income,
    demographics.location.state,
    demographics.education,
    demographics.maritalStatus
  ])

  // Check cache and update state when component mounts or when metrics change
  React.useEffect(() => {
    const cacheKey = `${JSON.stringify(memoizedDemographics)}_${xMetric}_${yMetric}`
    const cachedData = cache[cacheKey]
    if (cachedData) {
      setComparisonData(cachedData)
    } else {
      setComparisonData(null)
    }
  }, [memoizedDemographics, xMetric, yMetric, cache])

  const generateComparisonData = React.useCallback(async (x: MetricType, y: MetricType) => {
    const cacheKey = `${JSON.stringify(memoizedDemographics)}_${x}_${y}`
    
    if (cache[cacheKey]) {
      setComparisonData(cache[cacheKey])
      return
    }

    if (isLoading) return

    setIsLoading(true)
    setStreamedResponse("")
    setPartialData("")
    setComparisonData(null)
    
    try {
      const response = await fetch('/api/xy-comparison', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demographics: memoizedDemographics, xMetric: x, yMetric: y }),
      })

      if (!response.ok) throw new Error('Failed to generate comparison data')
      if (!response.body) throw new Error('No response body')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      let accumulatedResponse = ""
      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        accumulatedResponse += chunk
        setStreamedResponse(accumulatedResponse)
        setPartialData(accumulatedResponse)

        try {
          const data = JSON.parse(accumulatedResponse)
          if (
            data.x?.length > 0 && 
            data.y?.length > 0 && 
            data.labels?.length > 0 && 
            data.trendline?.x?.length > 0 && 
            data.trendline?.y?.length > 0
          ) {
            cache[cacheKey] = data
            setComparisonData(data)
          }
        } catch (e) {
          // Not valid JSON yet, continue accumulating
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate comparison analysis. Please try again.",
        variant: "destructive"
      })
      setComparisonData(null)
    } finally {
      setIsLoading(false)
    }
  }, [memoizedDemographics, cache, toast, isLoading])

  // Trigger data generation when metrics change or when there's no cached data
  React.useEffect(() => {
    const cacheKey = `${JSON.stringify(memoizedDemographics)}_${xMetric}_${yMetric}`
    if (!cache[cacheKey] && !isLoading) {
      generateComparisonData(xMetric, yMetric)
    }
  }, [xMetric, yMetric, memoizedDemographics, generateComparisonData, cache, isLoading])

  const renderStreamingContent = () => {
    if (!partialData) return null;

    return (
      <div className="font-mono text-sm whitespace-pre-wrap opacity-50">
        {partialData}
      </div>
    );
  };

  const renderComparisonPlot = () => {
    // Make sure we have valid data with non-empty arrays
    if (
      !comparisonData?.x?.length || 
      !comparisonData?.y?.length || 
      !comparisonData?.labels?.length ||
      !comparisonData?.trendline?.x?.length ||
      !comparisonData?.trendline?.y?.length
    ) {
      return null
    }

    return (
      <Plot
        data={[
          {
            type: "scatter",
            mode: "markers",
            x: comparisonData.x,
            y: comparisonData.y,
            text: comparisonData.labels,
            name: "Data Points",
            marker: {
              size: 10,
              color: "#FFFFFF",
              opacity: 0.9,
              line: {
                color: "#DC2626",
                width: 1
              }
            },
            hoverinfo: "text",
          },
          {
            type: "scatter",
            mode: "lines",
            x: comparisonData.trendline.x,
            y: comparisonData.trendline.y,
            name: "Trend Line",
            line: {
              color: "#DC2626",
              width: 2,
              dash: "solid"
            }
          }
        ]}
        layout={{
          title: comparisonData.title || "Metric Comparison",
          xaxis: { 
            title: comparisonData.xTitle || "X Axis",
            color: "#FFFFFF",
            gridcolor: "#FFFFFF20"
          },
          yaxis: { 
            title: comparisonData.yTitle || "Y Axis",
            color: "#FFFFFF",
            gridcolor: "#FFFFFF20"
          },
          height: 400,
          margin: { t: 40, r: 20, b: 40, l: 60 },
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
          showlegend: true,
          legend: {
            x: 0,
            y: 1,
            orientation: "h",
            font: {
              color: "#FFFFFF"
            }
          },
          font: {
            color: "#FFFFFF"
          }
        }}
        config={{ displayModeBar: false }}
        style={{ width: "100%" }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Metric Comparison</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>X Axis Metric</Label>
              <Select
                value={xMetric}
                onValueChange={(value) => setXMetric(value as MetricType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="spending">Spending</SelectItem>
                  <SelectItem value="portfolio_value">Portfolio Value</SelectItem>
                  <SelectItem value="risk_score">Risk Score</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                  <SelectItem value="expenses">Expenses</SelectItem>
                  <SelectItem value="assets">Assets</SelectItem>
                  <SelectItem value="liabilities">Liabilities</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Y Axis Metric</Label>
              <Select
                value={yMetric}
                onValueChange={(value) => setYMetric(value as MetricType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="spending">Spending</SelectItem>
                  <SelectItem value="portfolio_value">Portfolio Value</SelectItem>
                  <SelectItem value="risk_score">Risk Score</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                  <SelectItem value="expenses">Expenses</SelectItem>
                  <SelectItem value="assets">Assets</SelectItem>
                  <SelectItem value="liabilities">Liabilities</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="min-h-[400px] w-full">
            {isLoading ? (
              <div className="space-y-4">
                {renderStreamingContent()}
                <Skeleton className="h-[400px] w-full" />
              </div>
            ) : (
              renderComparisonPlot()
            )}
          </div>

          {comparisonData?.analysis && (
            <div className="space-y-2">
              <h4 className="font-medium">Analysis</h4>
              <ul className="list-disc pl-4 space-y-1">
                {comparisonData.analysis.map((point, i) => (
                  <li key={i} className="text-sm text-muted-foreground">{point}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 