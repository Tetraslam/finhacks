"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { type ValidationResult } from "@/lib/census"
import { Info } from "lucide-react"

interface DemographicInsightsProps {
  insights: ValidationResult["insights"]
}

export function DemographicInsights({ insights }: DemographicInsightsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Demographic Insights</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Age & Income</AlertTitle>
          <AlertDescription className="mt-2">
            <p>{insights.ageComparison}</p>
            <p className="mt-1">{insights.incomeComparison}</p>
          </AlertDescription>
        </Alert>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Education</AlertTitle>
          <AlertDescription className="mt-2">
            {insights.educationComparison}
          </AlertDescription>
        </Alert>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Household</AlertTitle>
          <AlertDescription className="mt-2">
            {insights.householdComparison}
          </AlertDescription>
        </Alert>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Marital Status</AlertTitle>
          <AlertDescription className="mt-2">
            {insights.maritalStatusComparison}
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
} 