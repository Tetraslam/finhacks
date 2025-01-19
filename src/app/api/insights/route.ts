import { type NextRequest } from "next/server"
import { openai } from "@/lib/openai"

export async function POST(req: NextRequest) {
  try {
    const { prompt, demographics } = await req.json()

    if (!prompt || !demographics) {
      return new Response(
        JSON.stringify({ error: "Missing prompt or demographics" }),
        { status: 400 }
      )
    }

    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a financial advisor and demographic analyst. Analyze the provided description and demographic data to generate insights about the digital twin. Focus on:
1. Financial Profile: Current financial status, income sources, and potential concerns
2. Risk Factors: Identify potential financial, lifestyle, or demographic risks
3. Opportunities: Areas for improvement or optimization
4. Behavioral Insights: Likely financial behaviors and decision-making patterns
5. Recommendations: Actionable steps for financial planning and lifestyle optimization

Keep responses concise but insightful. Use bullet points for clarity.`,
        },
        {
          role: "user",
          content: `Description: ${prompt}\n\nDemographic Data: ${JSON.stringify(
            demographics,
            null,
            2
          )}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      stream: true
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || ""
            controller.enqueue(encoder.encode(content))
          }
          
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
    console.error("Failed to generate insights:", error)
    return new Response(
      JSON.stringify({ error: "Failed to generate insights" }),
      { status: 500 }
    )
  }
} 