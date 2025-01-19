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
  cache: {[key: string]: LifestyleInsights}
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
  cache
}: DayInLifeProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [insights, setInsights] = React.useState<LifestyleInsights | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const { toast } = useToast()

  const defaultInsights: LifestyleInsights = {
    schedule: "",
    marketingInsights: {
      shoppingHabits: [],
      brandPreferences: [],
      pricePoints: [],
      mediaConsumption: [],
      decisionFactors: []
    },
    financialInsights: {
      dailySpending: [],
      paymentMethods: [],
      financialGoals: [],
      investmentStyle: "",
      riskTolerance: ""
    },
    locationInsights: {
      frequentedLocations: [],
      commutePatterns: [],
      neighborhoodPreferences: []
    }
  }

  const generateInsights = React.useCallback(async () => {
    if (!demographics) return

    // Create a cache key based on demographics
    const cacheKey = JSON.stringify(demographics)

    // Check if we have cached results
    if (cache[cacheKey]) {
      setInsights(cache[cacheKey])
      if (onAnalysisGenerated) {
        onAnalysisGenerated({
          schedule: cache[cacheKey].schedule,
          marketingInsights: cache[cacheKey].marketingInsights,
          financialInsights: cache[cacheKey].financialInsights,
          locationInsights: cache[cacheKey].locationInsights
        })
      }
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/day-in-life', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(demographics),
      })

      if (!response.ok) {
        throw new Error('Failed to generate insights')
      }

      const data = await response.json()
      
      // Cache the results
      cache[cacheKey] = data

      setInsights(data)
      if (onAnalysisGenerated) {
        onAnalysisGenerated({
          schedule: data.schedule,
          marketingInsights: data.marketingInsights,
          financialInsights: data.financialInsights,
          locationInsights: data.locationInsights
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast({
        title: "Error",
        description: "Failed to generate lifestyle insights. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [demographics, onAnalysisGenerated, toast, cache])

  React.useEffect(() => {
    if (demographics) {
      const cacheKey = JSON.stringify(demographics)
      // Only make the API call if we don't have cached data
      if (!cache[cacheKey]) {
        generateInsights()
      } else {
        // Use cached data if available
        setInsights(cache[cacheKey])
        if (onAnalysisGenerated) {
          onAnalysisGenerated({
            schedule: cache[cacheKey].schedule,
            marketingInsights: cache[cacheKey].marketingInsights,
            financialInsights: cache[cacheKey].financialInsights,
            locationInsights: cache[cacheKey].locationInsights
          })
        }
      }
    }
  }, [demographics, generateInsights])

  const safeInsights = React.useMemo(() => ({ ...defaultInsights, ...insights }), [insights])

  const renderSpendingChart = () => {
    if (!safeInsights?.financialInsights?.dailySpending?.length) return null

    const data = safeInsights.financialInsights.dailySpending
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
                <ReactMarkdown>{safeInsights.schedule}</ReactMarkdown>
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
                  {safeInsights.marketingInsights.shoppingHabits.map((habit, i) => (
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
                  {safeInsights.marketingInsights.pricePoints.map((point, i) => (
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
                    <p className="text-sm text-muted-foreground">{safeInsights.financialInsights.investmentStyle}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Risk Tolerance</h4>
                    <p className="text-sm text-muted-foreground">{safeInsights.financialInsights.riskTolerance}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Financial Goals</h4>
                    <ul className="list-disc pl-4 space-y-1">
                      {safeInsights.financialInsights.financialGoals.map((goal, i) => (
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
                <CardTitle>Location Map</CardTitle>
              </CardHeader>
              <CardContent>
                {demographics?.location ? (
                  <div className="aspect-video w-full overflow-hidden rounded-lg border border-border">
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(
                        demographics.location.city 
                          ? `${demographics.location.city}, ${demographics.location.state}`
                          : demographics.location.state || 'World'
                      )}`}
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted flex items-center justify-center">
                    <p className="text-muted-foreground">No location data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Frequently Visited Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {safeInsights.locationInsights.frequentedLocations.map((location, i) => (
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

            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Location Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Commute Patterns</h4>
                    <ul className="list-disc pl-4 space-y-1">
                      {safeInsights.locationInsights.commutePatterns.map((pattern, i) => (
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
                      {safeInsights.locationInsights.neighborhoodPreferences.map((pref, i) => (
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