"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { type Demographics } from "@/lib/schema"
import { Skeleton } from "@/components/ui/skeleton"
import ReactMarkdown from "react-markdown"
import { motion } from "framer-motion"
import dynamic from "next/dynamic"
import { DollarSign, Tag, TrendingUp, Users, LineChart, ShoppingBag } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Import Plotly dynamically to fix SSR issues
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false })

interface PriceProductProps {
  demographics: Demographics
}

interface ProductDetails {
  name: string
  category: string
  description: string
  targetPrice: number
  competitorPrices: number[]
  features: string[]
}

interface PricingInsights {
  recommendedPrice: {
    min: number
    max: number
    optimal: number
  }
  marketAnalysis: {
    competitiveLandscape: string
    marketTrends: string
    seasonalFactors: string
  }
  demographicFit: {
    spendingCapacity: string
    priceElasticity: string
    valuePerception: string
    purchaseLikelihood: string
  }
  visualizations: {
    priceDistribution: {
      prices: number[]
      probabilities: number[]
    }
    sensitivityCurve: {
      prices: number[]
      demand: number[]
    }
  }
  recommendations: string[]
}

const PRODUCT_CATEGORIES = [
  "Electronics",
  "Clothing",
  "Home & Garden",
  "Food & Beverage",
  "Financial Products",
  "Entertainment",
  "Health & Wellness",
  "Travel",
  "Education",
  "Professional Services"
]

export function PriceProduct({ demographics }: PriceProductProps) {
  const [productDetails, setProductDetails] = React.useState<ProductDetails>({
    name: "",
    category: "",
    description: "",
    targetPrice: 0,
    competitorPrices: [],
    features: []
  })

  const [insights, setInsights] = React.useState<PricingInsights | null>(() => {
    if (typeof window === "undefined") return null
    const cached = localStorage.getItem("pricing_insights")
    if (!cached) return null
    try {
      const { demographics: cachedDemographics, insights: cachedInsights } = JSON.parse(cached)
      return JSON.stringify(demographics) === JSON.stringify(cachedDemographics) ? cachedInsights : null
    } catch {
      return null
    }
  })

  const [isLoading, setIsLoading] = React.useState(false)
  const [currentFeature, setCurrentFeature] = React.useState("")
  const { toast } = useToast()
  const hasRun = React.useRef(false)

  const handleAddFeature = () => {
    if (!currentFeature.trim()) return
    setProductDetails(prev => ({
      ...prev,
      features: [...prev.features, currentFeature.trim()]
    }))
    setCurrentFeature("")
  }

  const handleRemoveFeature = (index: number) => {
    setProductDetails(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  const handleAddCompetitorPrice = (price: number) => {
    if (price <= 0) return
    setProductDetails(prev => ({
      ...prev,
      competitorPrices: [...prev.competitorPrices, price]
    }))
  }

  const handleRemoveCompetitorPrice = (index: number) => {
    setProductDetails(prev => ({
      ...prev,
      competitorPrices: prev.competitorPrices.filter((_, i) => i !== index)
    }))
  }

  const handleAnalyze = async () => {
    if (!productDetails.name || !productDetails.category || !productDetails.description) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      })
      return
    }

    try {
      setIsLoading(true)
      hasRun.current = true
      const response = await fetch("/api/price-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          demographics,
          product: productDetails
        })
      })

      if (!response.ok) {
        throw new Error("Failed to analyze product pricing")
      }

      const data = await response.json()
      setInsights(data)
      localStorage.setItem("pricing_insights", JSON.stringify({ demographics, insights: data }))
    } catch (error) {
      console.error("Failed to analyze product pricing:", error)
      toast({
        title: "Analysis failed",
        description: "Failed to analyze product pricing. Please try again.",
        variant: "destructive"
      })
      hasRun.current = false
    } finally {
      setIsLoading(false)
    }
  }

  const renderPriceDistribution = () => {
    if (!insights?.visualizations.priceDistribution) return null

    const { prices, probabilities } = insights.visualizations.priceDistribution
    return (
      <Plot
        data={[
          {
            type: "bar",
            x: prices,
            y: probabilities,
            marker: {
              color: "rgb(99, 102, 241)"
            }
          }
        ]}
        layout={{
          title: "Price Distribution Analysis",
          xaxis: { title: "Price Point" },
          yaxis: { title: "Purchase Probability" },
          height: 300,
          margin: { t: 30, b: 40, l: 60, r: 20 },
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent"
        }}
        config={{ displayModeBar: false }}
      />
    )
  }

  const renderSensitivityCurve = () => {
    if (!insights?.visualizations.sensitivityCurve) return null

    const { prices, demand } = insights.visualizations.sensitivityCurve
    return (
      <Plot
        data={[
          {
            type: "scatter",
            x: prices,
            y: demand,
            mode: "lines",
            line: {
              color: "rgb(99, 102, 241)",
              width: 2
            }
          }
        ]}
        layout={{
          title: "Price Sensitivity Curve",
          xaxis: { title: "Price Point" },
          yaxis: { title: "Expected Demand" },
          height: 300,
          margin: { t: 30, b: 40, l: 60, r: 20 },
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent"
        }}
        config={{ displayModeBar: false }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={productDetails.name}
                onChange={e => setProductDetails(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter product name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={productDetails.category}
                onValueChange={value => setProductDetails(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={productDetails.description}
              onChange={e => setProductDetails(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your product"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetPrice">Target Price ($)</Label>
            <Input
              id="targetPrice"
              type="number"
              min="0"
              step="0.01"
              value={productDetails.targetPrice}
              onChange={e => setProductDetails(prev => ({ ...prev, targetPrice: parseFloat(e.target.value) || 0 }))}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label>Features</Label>
            <div className="flex gap-2">
              <Input
                value={currentFeature}
                onChange={e => setCurrentFeature(e.target.value)}
                placeholder="Add a feature"
                onKeyPress={e => e.key === "Enter" && handleAddFeature()}
              />
              <Button onClick={handleAddFeature} type="button">
                Add
              </Button>
            </div>
            <ul className="list-disc pl-6 space-y-1">
              {productDetails.features.map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex justify-between items-center"
                >
                  <span>{feature}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFeature(index)}
                    className="h-6 px-2"
                  >
                    ×
                  </Button>
                </motion.li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <Label>Competitor Prices ($)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                onKeyPress={e => {
                  if (e.key === "Enter") {
                    const input = e.currentTarget as HTMLInputElement
                    handleAddCompetitorPrice(parseFloat(input.value))
                    input.value = ""
                  }
                }}
              />
              <Button
                onClick={() => {
                  const input = document.querySelector('input[type="number"]:not([id])') as HTMLInputElement
                  handleAddCompetitorPrice(parseFloat(input.value))
                  input.value = ""
                }}
                type="button"
              >
                Add
              </Button>
            </div>
            <ul className="list-disc pl-6 space-y-1">
              {productDetails.competitorPrices.map((price, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex justify-between items-center"
                >
                  <span>${price.toFixed(2)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCompetitorPrice(index)}
                    className="h-6 px-2"
                  >
                    ×
                  </Button>
                </motion.li>
              ))}
            </ul>
          </div>

          <Button
            onClick={handleAnalyze}
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Analyzing..." : "Analyze Pricing"}
          </Button>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ) : insights ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Recommended Price Range
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-muted-foreground">Minimum</div>
                  <div className="text-2xl font-bold">${insights.recommendedPrice.min.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Optimal</div>
                  <div className="text-2xl font-bold text-primary">${insights.recommendedPrice.optimal.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Maximum</div>
                  <div className="text-2xl font-bold">${insights.recommendedPrice.max.toFixed(2)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="market">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="market">
                <TrendingUp className="h-4 w-4 mr-2" />
                Market
              </TabsTrigger>
              <TabsTrigger value="demographic">
                <Users className="h-4 w-4 mr-2" />
                Demographic
              </TabsTrigger>
              <TabsTrigger value="analysis">
                <LineChart className="h-4 w-4 mr-2" />
                Analysis
              </TabsTrigger>
              <TabsTrigger value="recommendations">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Recommendations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="market">
              <Card>
                <CardHeader>
                  <CardTitle>Market Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Competitive Landscape</h4>
                    <p className="text-sm text-muted-foreground">{insights.marketAnalysis.competitiveLandscape}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Market Trends</h4>
                    <p className="text-sm text-muted-foreground">{insights.marketAnalysis.marketTrends}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Seasonal Factors</h4>
                    <p className="text-sm text-muted-foreground">{insights.marketAnalysis.seasonalFactors}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="demographic">
              <Card>
                <CardHeader>
                  <CardTitle>Demographic Fit Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Spending Capacity</h4>
                    <p className="text-sm text-muted-foreground">{insights.demographicFit.spendingCapacity}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Price Elasticity</h4>
                    <p className="text-sm text-muted-foreground">{insights.demographicFit.priceElasticity}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Value Perception</h4>
                    <p className="text-sm text-muted-foreground">{insights.demographicFit.valuePerception}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Purchase Likelihood</h4>
                    <p className="text-sm text-muted-foreground">{insights.demographicFit.purchaseLikelihood}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis">
              <div className="grid gap-4 grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Price Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderPriceDistribution()}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Price Sensitivity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderSensitivityCurve()}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="recommendations">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {insights.recommendations.map((recommendation, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-2"
                      >
                        <div className="h-6 w-6 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                          {index + 1}
                        </div>
                        <p className="text-sm text-muted-foreground flex-1">{recommendation}</p>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      ) : null}
    </div>
  )
} 