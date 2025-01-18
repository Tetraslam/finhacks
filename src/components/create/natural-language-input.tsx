"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { type Demographics } from "@/lib/schema"
import { generateDemographics } from "@/lib/openai"
import { inferDemographics } from "@/lib/nlp"

interface NaturalLanguageInputProps {
  onDemographicsGenerated: (demographics: Demographics) => void
  demographics: Demographics | null
  setDemographics: (demographics: Demographics) => void
  onPromptChange: (prompt: string) => void
  isLoading?: boolean
}

export function NaturalLanguageInput({
  onDemographicsGenerated,
  demographics,
  setDemographics,
  onPromptChange,
  isLoading: externalLoading = false,
}: NaturalLanguageInputProps) {
  const [prompt, setPrompt] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const { toast } = useToast()

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newPrompt = e.target.value
    setPrompt(newPrompt)
    onPromptChange(newPrompt)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please describe the digital twin first.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      // First try to infer demographics locally
      const inferredDemographics = inferDemographics(prompt)
      setDemographics(inferredDemographics)

      // Then get more accurate demographics from OpenAI
      const aiDemographics = await generateDemographics(prompt)
      onDemographicsGenerated(aiDemographics)
      toast({
        title: "Demographics generated",
        description: "The digital twin's demographics have been created.",
      })
    } catch (error) {
      console.error("Failed to generate demographics:", error)
      toast({
        title: "Error",
        description: "Failed to generate demographics. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        placeholder="Describe the target demographic in natural language. For example: 'A 35-year-old software engineer living in Seattle, married with 2 kids, making $150,000 annually.'"
        value={prompt}
        onChange={handlePromptChange}
        className="min-h-[100px]"
        disabled={isLoading || externalLoading}
      />
      <Button type="submit" disabled={isLoading || externalLoading}>
        {isLoading ? "Generating..." : "Generate Demographics"}
      </Button>
    </form>
  )
} 