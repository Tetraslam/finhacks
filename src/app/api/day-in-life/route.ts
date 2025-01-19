import { type Demographics } from "@/lib/schema"
import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
})

const SYSTEM_PROMPT = `You are an expert analyst generating a detailed lifestyle analysis based on demographic data. 
Generate a comprehensive analysis including:
1. A markdown-formatted daily schedule
2. Marketing insights (shopping habits, brand preferences, price points, media consumption, decision factors)
3. Financial insights (daily spending patterns, payment methods, financial goals, investment style, risk tolerance)
4. Location insights (frequented locations, commute patterns, neighborhood preferences)

Format the response as a JSON object with these exact keys:
{
  "schedule": "markdown string",
  "marketingInsights": {
    "shoppingHabits": string[],
    "brandPreferences": string[],
    "pricePoints": { category: string, range: string }[],
    "mediaConsumption": string[],
    "decisionFactors": string[]
  },
  "financialInsights": {
    "dailySpending": { category: string, amount: number }[],
    "paymentMethods": string[],
    "financialGoals": string[],
    "investmentStyle": string,
    "riskTolerance": string
  },
  "locationInsights": {
    "frequentedLocations": { type: string, examples: string[] }[],
    "commutePatterns": string[],
    "neighborhoodPreferences": string[]
  }
}`

function cleanJsonResponse(content: string): string {
  // Remove markdown code fences if present
  const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/)
  if (jsonMatch) {
    return jsonMatch[1]
  }
  return content
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body || typeof body !== 'object') {
      throw new Error("Missing request body")
    }

    const demographics = body as Demographics

    if (!demographics.age || !demographics.income || !demographics.location || !demographics.education || !demographics.occupation) {
      throw new Error("Missing required demographic fields")
    }

    console.log("Generating insights for demographics:", demographics)

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content: `Generate a lifestyle analysis for a ${demographics.age} year old ${demographics.occupation} in ${demographics.location.state}${demographics.location.city ? `, ${demographics.location.city}` : ""} with an income of $${demographics.income} and ${demographics.education} education.${demographics.maritalStatus ? ` They are ${demographics.maritalStatus}.` : ""}`
        }
      ],
      response_format: { type: "json_object" }
    })

    console.log("Raw OpenAI response:", completion)
    
    const content = completion.choices[0].message.content
    console.log("Response content:", content)

    if (!content) {
      throw new Error("Empty response from OpenAI")
    }

    // Clean the response before parsing
    const cleanedContent = cleanJsonResponse(content)
    console.log("Cleaned content:", cleanedContent)

    let insights
    try {
      insights = JSON.parse(cleanedContent)
      console.log("Parsed insights:", insights)
    } catch (e) {
      console.error("Failed to parse insights:", e)
      throw new Error("Invalid response format")
    }

    // Ensure schedule is a string
    if (typeof insights.schedule !== "string") {
      console.log("Schedule is not a string, converting:", insights.schedule)
      insights.schedule = JSON.stringify(insights.schedule)
    }

    console.log("Final insights with string schedule:", insights)

    return NextResponse.json(insights)
  } catch (error) {
    console.error("Error generating lifestyle insights:", error)
    return NextResponse.json(
      { error: "Failed to generate lifestyle insights" },
      { status: 500 }
    )
  }
} 