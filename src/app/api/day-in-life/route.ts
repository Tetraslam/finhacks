import { type NextRequest } from "next/server"
import { type Demographics } from "@/lib/schema"
import { openai } from "@/lib/openai"

export async function POST(req: NextRequest) {
  try {
    const { demographics } = await req.json()

    if (!demographics) {
      return new Response(
        JSON.stringify({ error: "Missing demographics data" }),
        { status: 400 }
      )
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are an expert analyst providing detailed lifestyle and behavioral insights for marketers, financial institutions, and urban planners. Generate a comprehensive analysis of a person's daily life and habits based on their demographic data.

Your response should be a JSON object with the following structure:
{
  "schedule": "A markdown-formatted daily schedule with timestamps and activities",
  "marketingInsights": {
    "shoppingHabits": ["Array of detailed shopping behaviors"],
    "brandPreferences": ["Array of likely brand preferences and loyalty factors"],
    "pricePoints": [{"category": "Category name", "range": "Price range they're willing to pay"}],
    "mediaConsumption": ["Array of media consumption habits"],
    "decisionFactors": ["Array of key factors in purchase decisions"]
  },
  "financialInsights": {
    "dailySpending": [{"category": "Spending category", "amount": number}],
    "paymentMethods": ["Preferred payment methods"],
    "financialGoals": ["Key financial objectives"],
    "investmentStyle": "Investment approach description",
    "riskTolerance": "Risk tolerance level"
  },
  "locationInsights": {
    "frequentedLocations": [{"type": "Location type", "examples": ["Specific examples"]}],
    "commutePatterns": ["Transportation and timing preferences"],
    "neighborhoodPreferences": ["Housing and area preferences"]
  }
}

Make insights specific, actionable, and based on demographic patterns. Include realistic price points, brands, and locations relevant to their income level and location.`,
        },
        {
          role: "user",
          content: `Generate insights for someone with these demographics:
Age: ${demographics.age}
Income: $${demographics.income.toLocaleString()}
Location: ${demographics.location.city}, ${demographics.location.state}
Education: ${demographics.education}
Occupation: ${demographics.occupation}
Household Size: ${demographics.householdSize}
Marital Status: ${demographics.maritalStatus}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    })

    const insights = JSON.parse(completion.choices[0].message.content)

    if (!insights) {
      throw new Error("No insights generated")
    }

    return new Response(JSON.stringify({ insights }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Failed to generate insights:", error)
    return new Response(
      JSON.stringify({ error: "Failed to generate insights" }),
      { status: 500 }
    )
  }
} 