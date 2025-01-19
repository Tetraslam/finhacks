import { type Demographics } from "@/lib/schema"
import { NextResponse } from "next/server"
import { openai } from "@/lib/openai"

const SYSTEM_PROMPT = `You are an expert analyst generating correlation insights between different financial and demographic metrics. 
Generate comprehensive correlation data including:
1. X and Y axis data points (arrays of numbers)
2. Labels for each data point
3. Axis titles and chart title
4. Key insights about the correlation

Format the response as a JSON object with these exact keys:
{
  "x": number[],
  "y": number[],
  "labels": string[],
  "xTitle": string,
  "yTitle": string,
  "title": string,
  "insights": string[]
}`

export async function POST(request: Request) {
  try {
    const { demographics, type } = await request.json()

    if (!demographics || !type) {
      throw new Error("Missing required parameters")
    }

    const prompt = generatePromptForType(type, demographics)

    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      stream: true
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        let fullResponse = ""
        
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || ""
            fullResponse += content
            controller.enqueue(encoder.encode(content))
          }
          
          // Validate the full response is valid JSON
          JSON.parse(fullResponse)
          
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      }
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error("Error generating correlation insights:", error)
    return NextResponse.json(
      { error: "Failed to generate correlation insights" },
      { status: 500 }
    )
  }
}

function generatePromptForType(type: string, demographics: Demographics): string {
  switch (type) {
    case "spending_vs_market":
      return `Analyze how market conditions affect spending patterns for a ${demographics.age} year old ${demographics.occupation} 
      with an income of $${demographics.income}. Generate correlation data between market volatility and spending in different categories.`

    case "income_vs_spending":
      return `Analyze the relationship between income levels and spending patterns for someone in ${demographics.location.state} 
      with ${demographics.education} education. Generate correlation data showing how spending in different categories changes with income.`

    case "portfolio_vs_risk":
      return `Analyze how portfolio allocation correlates with risk factors for a ${demographics.maritalStatus?.toLowerCase()} ${demographics.age} year old 
      with ${demographics.education} education. Generate correlation data between risk metrics and portfolio performance.`

    case "location_vs_finance":
      return `Analyze how location affects financial decisions for someone with an income of $${demographics.income} 
      and ${demographics.education} education. Generate correlation data between location-based metrics and financial choices.`

    default:
      throw new Error("Invalid correlation type")
  }
} 