import { z } from "zod"
import { type ValidationResult } from "./census"
import { type LifestyleInsights } from "@/components/DayInLife"

export const demographicSchema = z.object({
  age: z.number().min(0).max(120),
  income: z.number().min(0),
  location: z.object({
    state: z.string(),
    city: z.string(),
    zipCode: z.string(),
  }),
  education: z.enum([
    "Less than High School",
    "High School",
    "Some College",
    "Bachelor's Degree",
    "Master's Degree",
    "Doctoral Degree",
  ]),
  occupation: z.string(),
  householdSize: z.number().min(1),
  maritalStatus: z.enum([
    "Single",
    "Married",
    "Divorced",
    "Widowed",
    "Separated",
  ]),
})

export const portfolioSchema = z.object({
  assets: z.object({
    stocks: z.number().default(0),
    bonds: z.number().default(0),
    commodities: z.number().default(0),
    realEstate: z.number().default(0),
    cash: z.number().default(0),
    crypto: z.number().default(0),
  }),
  monthlyIncome: z.number(),
  monthlyExpenses: z.number(),
})

export const digitalTwinSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  demographics: demographicSchema,
  portfolio: portfolioSchema,
  preferences: z.record(z.string(), z.unknown()).optional(),
})

export type DigitalTwin = z.infer<typeof digitalTwinSchema>
export type Demographics = z.infer<typeof demographicSchema>
export type Portfolio = z.infer<typeof portfolioSchema>

export interface ExportData {
  // Base demographic data
  demographics: Demographics
  
  // Generated insights and analysis
  censusInsights: ValidationResult["insights"]
  llmFeedback: {
    financialProfile: string
    riskFactors: string
    opportunities: string
    behavioralInsights: string
    recommendations: string
  }
  lifestyleAnalysis: LifestyleInsights
  spendingHabits: {
    category: string
    amount: number
    percentage: number
  }[]
  
  // Metadata
  exportDate: string
  version: string
} 