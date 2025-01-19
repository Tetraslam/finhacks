import { NextResponse } from "next/server"
import { type Demographics } from "@/lib/schema"
import { openai } from "@/lib/openai"

const SYSTEM_PROMPT = `You are an expert pricing analyst with deep knowledge of market dynamics, consumer behavior, and demographic analysis. Your task is to analyze product pricing based on demographic data and product details.

Consider the following factors in your analysis:
1. Demographic spending patterns and financial capacity
2. Market conditions and competitive landscape
3. Product category trends and seasonality
4. Price elasticity of demand
5. Value perception and brand positioning
6. Purchase likelihood and conversion factors

Provide comprehensive insights that would be valuable for:
- Marketers planning product launches
- Financial institutions developing products
- Retailers setting pricing strategies
- Small businesses entering new markets
- Government agencies analyzing market accessibility

Format your response as a JSON object with the following structure:
{
  "recommendedPrice": {
    "min": number,
    "max": number,
    "optimal": number
  },
  "marketAnalysis": {
    "competitiveLandscape": string,
    "marketTrends": string,
    "seasonalFactors": string
  },
  "demographicFit": {
    "spendingCapacity": string,
    "priceElasticity": string,
    "valuePerception": string,
    "purchaseLikelihood": string
  },
  "visualizations": {
    "priceDistribution": {
      "prices": number[],
      "probabilities": number[]
    },
    "sensitivityCurve": {
      "prices": number[],
      "demand": number[]
    }
  },
  "recommendations": string[]
}`

export async function POST(req: Request) {
  try {
    const { demographics, product } = await req.json()

    if (!demographics || !product) {
      return new NextResponse(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400 }
      )
    }

    const prompt = `Analyze pricing for the following product:

Product Name: ${product.name}
Category: ${product.category}
Description: ${product.description}
Target Price: $${product.targetPrice}
Features: ${product.features.join(", ")}
Competitor Prices: ${product.competitorPrices.map((p: number) => `$${p}`).join(", ")}

Target Demographic:
- Age: ${demographics.age}
- Income: $${demographics.income}
- Occupation: ${demographics.occupation}
- Education: ${demographics.education}
- Location: ${demographics.location.city}, ${demographics.location.state}
- Household Size: ${demographics.householdSize}
- Marital Status: ${demographics.maritalStatus}

Provide a comprehensive pricing analysis considering the demographic profile, market conditions, and competitive landscape.`

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    })

    const insights = JSON.parse(response.choices[0].message.content || "{}")

    // Generate price points for visualizations if not provided
    if (!insights.visualizations?.priceDistribution?.prices) {
      const minPrice = insights.recommendedPrice.min
      const maxPrice = insights.recommendedPrice.max
      const step = (maxPrice - minPrice) / 10
      insights.visualizations = {
        priceDistribution: {
          prices: Array.from({ length: 11 }, (_, i) => minPrice + i * step),
          probabilities: Array.from({ length: 11 }, () => Math.random())
        },
        sensitivityCurve: {
          prices: Array.from({ length: 11 }, (_, i) => minPrice + i * step),
          demand: Array.from({ length: 11 }, (_, i) => Math.max(0, 1 - i * 0.1))
        }
      }
    }

    return new NextResponse(JSON.stringify(insights))
  } catch (error) {
    console.error("Failed to analyze product pricing:", error)
    return new NextResponse(
      JSON.stringify({ error: "Failed to analyze product pricing" }),
      { status: 500 }
    )
  }
} 