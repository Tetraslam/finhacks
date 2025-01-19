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

function extractMarkdownContent(data: any): string {
  // If it's already a string, return it
  if (typeof data === 'string') return data
  
  // If it's an object with an insights field, extract that
  if (data?.insights && typeof data.insights === 'string') {
    return data.insights
  }

  // If it's an object with a content or text field, extract that
  if (data?.content && typeof data.content === 'string') {
    return data.content
  }
  if (data?.text && typeof data.text === 'string') {
    return data.text
  }

  // If it's an object but we don't recognize the structure, stringify it nicely
  if (typeof data === 'object') {
    return JSON.stringify(data, null, 2)
  }

  // Fallback
  return String(data)
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
      return prompt === cachedPrompt ? extractMarkdownContent(cachedInsights) : null
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
        
        // Extract the markdown content from the response
        const markdownContent = extractMarkdownContent(data)
        setInsights(markdownContent)
        
        if (onFeedbackGenerated) {
          onFeedbackGenerated(data)
        }
        
        localStorage.setItem("llm_insights", JSON.stringify({ 
          prompt, 
          insights: markdownContent 
        }))
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