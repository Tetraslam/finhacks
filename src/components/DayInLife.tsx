"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type Demographics, type ExportData } from "@/lib/schema"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import ReactMarkdown from "react-markdown"
import { Clock, Target, TrendingUp, ShoppingBag, DollarSign, MapPin } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import dynamic from "next/dynamic"

// Import Plotly dynamically to fix SSR issues
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false })

interface DayInLifeProps {
  demographics: Demographics
  onAnalysisGenerated?: (analysis: ExportData["lifestyleAnalysis"]) => void
}

interface LifestyleInsights {
  schedule: string
  marketingInsights: {
    shoppingHabits: string[]
    brandPreferences: string[]
    pricePoints: { category: string; range: string }[]
    mediaConsumption: string[]
    decisionFactors: string[]
  }
  financialInsights: {
    dailySpending: { category: string; amount: number }[]
    paymentMethods: string[]
    financialGoals: string[]
    investmentStyle: string
    riskTolerance: string
  }
  locationInsights: {
    frequentedLocations: { type: string; examples: string[] }[]
    commutePatterns: string[]
    neighborhoodPreferences: string[]
  }
}

export function DayInLife({
  demographics,
  onAnalysisGenerated,
}: DayInLifeProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const { toast } = useToast()
  const fetchedRef = React.useRef(false)

  const [insights, setInsights] = React.useState<LifestyleInsights | null>(() => {
    if (typeof window === "undefined") return null
    const cached = localStorage.getItem("day_in_life_insights")
    if (!cached) return null
    try {
      const { demographics: cachedDemographics, insights: cachedInsights } = JSON.parse(cached)
      return JSON.stringify(demographics) === JSON.stringify(cachedDemographics) ? cachedInsights : null
    } catch {
      return null
    }
  })

  React.useEffect(() => {
    const fetchInsights = async () => {
      if (!demographics || fetchedRef.current) return
      if (insights) return // Don't fetch if we have cached insights

      try {
        setIsLoading(true)
        fetchedRef.current = true
        const response = await fetch("/api/day-in-life", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ demographics }),
        })

        if (!response.ok) {
          throw new Error("Failed to fetch lifestyle insights")
        }

        const data = await response.json()
        setInsights(data)
        if (onAnalysisGenerated) {
          onAnalysisGenerated(data)
        }
        localStorage.setItem("day_in_life_insights", JSON.stringify({ demographics, insights: data }))
      } catch (error) {
        console.error("Failed to fetch lifestyle insights:", error)
        toast({
          title: "Error",
          description: "Failed to generate lifestyle insights. Please try again.",
          variant: "destructive",
        })
        fetchedRef.current = false
      } finally {
        setIsLoading(false)
      }
    }

    fetchInsights()

    return () => {
      fetchedRef.current = false
    }
  }, [demographics, insights, toast, onAnalysisGenerated])

  const renderSpendingChart = () => {
    if (!insights?.financialInsights.dailySpending.length) return null

    const data = insights.financialInsights.dailySpending
    return (
      <Plot
        data={[
          {
            type: "pie",
            values: data.map(item => item.amount),
            labels: data.map(item => item.category),
            hole: 0.4,
          },
        ]}
        layout={{
          height: 300,
          margin: { t: 0, b: 0, l: 0, r: 0 },
          showlegend: true,
          legend: { orientation: "h", y: -0.2 },
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
        }}
        config={{ displayModeBar: false }}
      />
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    )
  }

  if (!insights) return null

  return (
    <div className={`space-y-6`}>
      <Tabs defaultValue="schedule">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="schedule">
            <Clock className="h-4 w-4 mr-2" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="marketing">
            <Target className="h-4 w-4 mr-2" />
            Marketing
          </TabsTrigger>
          <TabsTrigger value="financial">
            <DollarSign className="h-4 w-4 mr-2" />
            Financial
          </TabsTrigger>
          <TabsTrigger value="location">
            <MapPin className="h-4 w-4 mr-2" />
            Location
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Daily Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{insights.schedule}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketing">
          <div className="grid gap-4 grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Shopping Habits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-4 space-y-2">
                  {insights.marketingInsights.shoppingHabits.map((habit, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      {habit}
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Price Sensitivity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.marketingInsights.pricePoints.map((point, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex justify-between items-center"
                    >
                      <span className="font-medium">{point.category}</span>
                      <span className="text-muted-foreground">{point.range}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial">
          <div className="grid gap-4 grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Daily Spending Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {renderSpendingChart()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Investment Style</h4>
                    <p className="text-sm text-muted-foreground">{insights.financialInsights.investmentStyle}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Risk Tolerance</h4>
                    <p className="text-sm text-muted-foreground">{insights.financialInsights.riskTolerance}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Financial Goals</h4>
                    <ul className="list-disc pl-4 space-y-1">
                      {insights.financialInsights.financialGoals.map((goal, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="text-sm text-muted-foreground"
                        >
                          {goal}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="location">
          <div className="grid gap-4 grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Visited Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {insights.locationInsights.frequentedLocations.map((location, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="space-y-2"
                    >
                      <h4 className="font-medium">{location.type}</h4>
                      <ul className="list-disc pl-4 space-y-1">
                        {location.examples.map((example, j) => (
                          <li key={j} className="text-sm text-muted-foreground">
                            {example}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Location Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Commute Patterns</h4>
                    <ul className="list-disc pl-4 space-y-1">
                      {insights.locationInsights.commutePatterns.map((pattern, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="text-sm text-muted-foreground"
                        >
                          {pattern}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Neighborhood Preferences</h4>
                    <ul className="list-disc pl-4 space-y-1">
                      {insights.locationInsights.neighborhoodPreferences.map((pref, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="text-sm text-muted-foreground"
                        >
                          {pref}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 