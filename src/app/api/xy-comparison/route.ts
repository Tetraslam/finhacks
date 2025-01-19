import { type Demographics } from "@/lib/schema"
import { NextResponse } from "next/server"
import { openai } from "@/lib/openai"

const SYSTEM_PROMPT = `You are an expert analyst generating comparison data between different financial metrics.
Generate comprehensive comparison data including:
1. X and Y axis data points (arrays of numbers)
2. Labels for each data point
3. Axis titles and chart title
4. Trendline data points
5. Analysis points about the relationship

Format the response as a JSON object with these exact keys:
{
  "x": number[],
  "y": number[],
  "labels": string[],
  "xTitle": string,
  "yTitle": string,
  "title": string,
  "trendline": {
    "x": number[],
    "y": number[]
  },
  "analysis": string[]
}`

export async function POST(request: Request) {
  try {
    const { demographics, xMetric, yMetric } = await request.json()

    if (!demographics || !xMetric || !yMetric) {
      throw new Error("Missing required parameters")
    }

    const prompt = generatePromptForMetrics(xMetric, yMetric, demographics)

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
    console.error("Error generating comparison data:", error)
    return NextResponse.json(
      { error: "Failed to generate comparison data" },
      { status: 500 }
    )
  }
}

function generatePromptForMetrics(xMetric: string, yMetric: string, demographics: Demographics): string {
  return `Generate comparison data between ${xMetric} and ${yMetric} for a ${demographics.age} year old ${demographics.occupation} 
  with an income of $${demographics.income} in ${demographics.location.state}. Consider their education level (${demographics.education}) 
  and marital status (${demographics.maritalStatus}) when generating the data points and analysis. 
  
  The data should reflect realistic patterns and relationships between these metrics based on the demographic profile.
  Include at least 10 data points and a meaningful trendline that shows the relationship between the metrics.
  
  The analysis should focus on:
  1. The strength and direction of the relationship
  2. Any notable patterns or clusters
  3. Demographic-specific insights
  4. Potential implications for financial planning`
} 