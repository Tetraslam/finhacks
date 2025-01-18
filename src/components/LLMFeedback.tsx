"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { type Demographics } from "@/lib/schema"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import ReactMarkdown from "react-markdown"

interface LLMFeedbackProps {
  prompt: string
  demographics: Demographics
  submitted: boolean
  onFeedbackGenerated?: (feedback: ExportData["llmFeedback"]) => void
}

export function LLMFeedback({
  prompt,
  demographics,
  submitted,
  onFeedbackGenerated,
}: LLMFeedbackProps) {
  const [insights, setInsights] = React.useState<string | null>(() => {
    if (typeof window === "undefined") return null
    const cached = localStorage.getItem("llm_insights")
    if (!cached) return null
    try {
      const { prompt: cachedPrompt, insights: cachedInsights } = JSON.parse(cached)
      return prompt === cachedPrompt ? cachedInsights : null
    } catch {
      return null
    }
  })
  const [isLoading, setIsLoading] = React.useState(false)
  const { toast } = useToast()
  const hasRun = React.useRef(false)

  React.useEffect(() => {
    const fetchInsights = async () => {
      if (!prompt || !demographics || !submitted || hasRun.current) return
      if (insights) return // Don't fetch if we have cached insights

      try {
        setIsLoading(true)
        hasRun.current = true
        const response = await fetch("/api/insights", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt,
            demographics,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to fetch insights")
        }

        const data = await response.json()
        setInsights(data)
        if (onFeedbackGenerated) {
          onFeedbackGenerated(data)
        }
        localStorage.setItem("llm_insights", JSON.stringify({ prompt, insights: data.insights }))
      } catch (error) {
        console.error("Failed to fetch insights:", error)
        toast({
          title: "Error",
          description: "Failed to generate insights. Please try again.",
          variant: "destructive",
        })
        hasRun.current = false
      } finally {
        setIsLoading(false)
      }
    }

    fetchInsights()
  }, [prompt, demographics, submitted, insights, toast, onFeedbackGenerated])

  if (!prompt || !demographics || !submitted) {
    return null
  }

  return (
    <Card className={`p-6`}>
      <h3 className="text-lg font-semibold mb-4">Digital Twin Insights</h3>
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ) : insights ? (
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown>{insights}</ReactMarkdown>
        </div>
      ) : null}
    </Card>
  )
} 