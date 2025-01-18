"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { type Demographics } from "@/lib/schema"
import { validateDemographics } from "@/lib/census"
import { useToast } from "@/hooks/use-toast"

interface WhatIfScenariosProps {
  demographics: Demographics | null
  onScenarioGenerated: (newDemographics: Demographics) => void
}

type ScenarioType = 
  | "income_change"
  | "location_change"
  | "market_conditions"
  | "life_events"
  | "economic_policy"

interface ScenarioConfig {
  type: ScenarioType
  label: string
  description: string
  adjustments: {
    [key: string]: {
      type: "slider" | "select" | "input"
      label: string
      min?: number
      max?: number
      step?: number
      options?: string[]
      defaultValue: number | string
    }
  }
}

const SCENARIO_CONFIGS: Record<ScenarioType, ScenarioConfig> = {
  income_change: {
    type: "income_change",
    label: "Income Change",
    description: "Adjust income levels and analyze impact",
    adjustments: {
      incomeMultiplier: {
        type: "slider",
        label: "Income Adjustment",
        min: 0.5,
        max: 2,
        step: 0.1,
        defaultValue: 1
      }
    }
  },
  location_change: {
    type: "location_change",
    label: "Location Change",
    description: "Analyze impact of moving to a different location",
    adjustments: {
      newState: {
        type: "select",
        label: "New State",
        options: ["CA", "NY", "TX", "FL", "WA"],
        defaultValue: "CA"
      },
      costOfLivingAdjustment: {
        type: "slider",
        label: "Cost of Living Adjustment",
        min: 0.5,
        max: 2,
        step: 0.1,
        defaultValue: 1
      }
    }
  },
  market_conditions: {
    type: "market_conditions",
    label: "Market Conditions",
    description: "Simulate different market scenarios",
    adjustments: {
      marketScenario: {
        type: "select",
        label: "Market Scenario",
        options: ["Bull Market", "Bear Market", "High Inflation", "Recession"],
        defaultValue: "Bull Market"
      },
      intensity: {
        type: "slider",
        label: "Scenario Intensity",
        min: 1,
        max: 5,
        step: 1,
        defaultValue: 3
      }
    }
  },
  life_events: {
    type: "life_events",
    label: "Life Events",
    description: "Simulate major life changes",
    adjustments: {
      event: {
        type: "select",
        label: "Life Event",
        options: ["Marriage", "Retirement", "Career Change", "Education"],
        defaultValue: "Marriage"
      }
    }
  },
  economic_policy: {
    type: "economic_policy",
    label: "Economic Policy",
    description: "Analyze impact of policy changes",
    adjustments: {
      policyType: {
        type: "select",
        label: "Policy Type",
        options: ["Tax Reform", "Interest Rates", "Stimulus", "Regulation"],
        defaultValue: "Tax Reform"
      },
      impact: {
        type: "slider",
        label: "Policy Impact",
        min: -50,
        max: 50,
        step: 5,
        defaultValue: 0
      }
    }
  }
}

export function WhatIfScenarios({ demographics, onScenarioGenerated }: WhatIfScenariosProps) {
  const { toast } = useToast()
  const [selectedScenario, setSelectedScenario] = React.useState<ScenarioType>("income_change")
  const [adjustments, setAdjustments] = React.useState<Record<string, number | string>>({})
  const [isGenerating, setIsGenerating] = React.useState(false)

  const handleScenarioChange = (value: ScenarioType) => {
    setSelectedScenario(value)
    // Reset adjustments when scenario changes
    const defaultAdjustments: Record<string, number | string> = {}
    Object.entries(SCENARIO_CONFIGS[value].adjustments).forEach(([key, config]) => {
      defaultAdjustments[key] = config.defaultValue
    })
    setAdjustments(defaultAdjustments)
  }

  const handleAdjustmentChange = (key: string, value: number | string) => {
    setAdjustments(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const generateScenario = async () => {
    if (!demographics) {
      toast({
        title: "No demographics",
        description: "Please create a digital twin first.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      // Create a deep copy of demographics
      const newDemographics = JSON.parse(JSON.stringify(demographics))

      // Apply adjustments based on scenario type
      switch (selectedScenario) {
        case "income_change":
          newDemographics.income *= adjustments.incomeMultiplier as number
          break
        case "location_change":
          newDemographics.location.state = adjustments.newState as string
          newDemographics.income *= adjustments.costOfLivingAdjustment as number
          break
        // Add other scenario type handlers
      }

      // Validate the new demographics
      await validateDemographics(newDemographics)
      
      onScenarioGenerated(newDemographics)
      
      toast({
        title: "Scenario generated",
        description: "What-if analysis has been updated.",
      })
    } catch (error) {
      console.error("Scenario generation error:", error)
      toast({
        title: "Generation failed",
        description: "Failed to generate scenario. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const renderAdjustment = (key: string, config: ScenarioConfig["adjustments"][string]) => {
    switch (config.type) {
      case "slider":
        return (
          <div key={key} className="space-y-2">
            <Label>{config.label}</Label>
            <Slider
              min={config.min}
              max={config.max}
              step={config.step}
              value={[adjustments[key] as number || config.defaultValue as number]}
              onValueChange={([value]) => handleAdjustmentChange(key, value)}
            />
            <div className="text-sm text-muted-foreground">
              Value: {adjustments[key] || config.defaultValue}
            </div>
          </div>
        )
      case "select":
        return (
          <div key={key} className="space-y-2">
            <Label>{config.label}</Label>
            <Select
              value={adjustments[key]?.toString() || config.defaultValue.toString()}
              onValueChange={(value) => handleAdjustmentChange(key, value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {config.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>What-If Scenarios</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Scenario Type</Label>
          <Select
            value={selectedScenario}
            onValueChange={(value: ScenarioType) => handleScenarioChange(value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SCENARIO_CONFIGS).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            {SCENARIO_CONFIGS[selectedScenario].description}
          </p>
        </div>

        <div className="space-y-4">
          {Object.entries(SCENARIO_CONFIGS[selectedScenario].adjustments).map(([key, config]) => 
            renderAdjustment(key, config)
          )}
        </div>

        <Button
          onClick={generateScenario}
          disabled={!demographics || isGenerating}
          className="w-full"
        >
          {isGenerating ? "Generating..." : "Generate Scenario"}
        </Button>
      </CardContent>
    </Card>
  )
} 