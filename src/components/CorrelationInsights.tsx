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

interface CorrelationInsightsProps {
  demographics: Demographics
  cache: {[key: string]: any}
}

type CorrelationType = 
  | "spending_vs_market"
  | "income_vs_spending"
  | "portfolio_vs_risk"
  | "location_vs_finance"

interface CorrelationData {
  x: number[]
  y: number[]
  labels: string[]
  xTitle: string
  yTitle: string
  title: string
  insights: string[]
}

export function CorrelationInsights({ demographics, cache }: CorrelationInsightsProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [selectedCorrelation, setSelectedCorrelation] = React.useState<CorrelationType>("spending_vs_market")
  const [correlationData, setCorrelationData] = React.useState<CorrelationData | null>(null)
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

  // Check cache and update state when component mounts or when correlation type changes
  React.useEffect(() => {
    const cacheKey = `${JSON.stringify(memoizedDemographics)}_${selectedCorrelation}`
    const cachedData = cache[cacheKey]
    if (cachedData) {
      setCorrelationData(cachedData)
    } else {
      setCorrelationData(null)
    }
  }, [memoizedDemographics, selectedCorrelation, cache])

  const generateCorrelationData = React.useCallback(async (type: CorrelationType) => {
    const cacheKey = `${JSON.stringify(memoizedDemographics)}_${type}`
    
    if (cache[cacheKey]) {
      setCorrelationData(cache[cacheKey])
      return
    }

    if (isLoading) return

    setIsLoading(true)
    setStreamedResponse("")
    setPartialData("")
    setCorrelationData(null)
    
    try {
      const response = await fetch('/api/correlations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demographics: memoizedDemographics, type }),
      })

      if (!response.ok) throw new Error('Failed to generate correlation data')
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
          if (data.x?.length > 0 && data.y?.length > 0 && data.labels?.length > 0) {
            cache[cacheKey] = data
            setCorrelationData(data)
          }
        } catch (e) {
          // Not valid JSON yet, continue accumulating
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate correlation insights. Please try again.",
        variant: "destructive"
      })
      setCorrelationData(null)
    } finally {
      setIsLoading(false)
    }
  }, [memoizedDemographics, cache, toast, isLoading])

  // Trigger data generation when correlation type changes or when there's no cached data
  React.useEffect(() => {
    const cacheKey = `${JSON.stringify(memoizedDemographics)}_${selectedCorrelation}`
    if (!cache[cacheKey] && !isLoading) {
      generateCorrelationData(selectedCorrelation)
    }
  }, [selectedCorrelation, memoizedDemographics, generateCorrelationData, cache, isLoading])

  const renderStreamingContent = () => {
    if (!partialData) return null;

    return (
      <div className="font-mono text-sm whitespace-pre-wrap opacity-50">
        {partialData}
      </div>
    );
  };

  const renderCorrelationPlot = () => {
    // Make sure we have valid data with non-empty arrays
    if (!correlationData?.x?.length || !correlationData?.y?.length || !correlationData?.labels?.length) {
      return null
    }

    return (
      <Plot
        data={[
          {
            type: "scatter",
            mode: "markers",
            x: correlationData.x,
            y: correlationData.y,
            text: correlationData.labels,
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
        ]}
        layout={{
          title: correlationData.title || "Correlation Analysis",
          xaxis: { 
            title: correlationData.xTitle || "X Axis",
            color: "#FFFFFF",
            gridcolor: "#FFFFFF20"
          },
          yaxis: { 
            title: correlationData.yTitle || "Y Axis",
            color: "#FFFFFF",
            gridcolor: "#FFFFFF20"
          },
          height: 400,
          margin: { t: 40, r: 20, b: 40, l: 60 },
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
          showlegend: false,
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
          <CardTitle>Correlation Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Select Correlation Type</Label>
            <Select
              value={selectedCorrelation}
              onValueChange={(value) => setSelectedCorrelation(value as CorrelationType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spending_vs_market">Spending vs Market Conditions</SelectItem>
                <SelectItem value="income_vs_spending">Income vs Spending Patterns</SelectItem>
                <SelectItem value="portfolio_vs_risk">Portfolio vs Risk Factors</SelectItem>
                <SelectItem value="location_vs_finance">Location vs Financial Decisions</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="min-h-[400px] w-full">
            {isLoading ? (
              <div className="space-y-4">
                {renderStreamingContent()}
                <Skeleton className="h-[400px] w-full" />
              </div>
            ) : (
              renderCorrelationPlot()
            )}
          </div>

          {correlationData?.insights && (
            <div className="space-y-2">
              <h4 className="font-medium">Key Insights</h4>
              <ul className="list-disc pl-4 space-y-1">
                {correlationData.insights.map((insight, i) => (
                  <li key={i} className="text-sm text-muted-foreground">{insight}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 