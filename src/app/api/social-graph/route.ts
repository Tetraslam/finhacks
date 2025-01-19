import { type Demographics } from "@/lib/schema"
import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
})

const SYSTEM_PROMPT = `You are an expert in social network analysis and word-of-mouth marketing.
Generate a detailed social graph and recommendations based on demographic data.
Focus on roles and personas that would be in the person's social network, NOT arbitrary names.

For example, for a college student, nodes might include:
- Primary: "Study Group Peer", "Roommate", "Academic Advisor"
- Secondary: "Department Head", "Club Member", "Teaching Assistant"
- Tertiary: "Alumni Network", "Campus Staff", "Industry Mentor"

The response should be a valid JSON object with this exact schema:
{
  "socialGraph": {
    "nodes": [
      {
        "id": string (role-based identifier like "academic_advisor"),
        "label": string (role/persona name like "Academic Advisor"),
        "type": "primary" | "secondary" | "tertiary",
        "influence": number (1-10),
        "category": string (e.g., "academic", "professional", "social", "family"),
        "description": string (brief description of role's influence)
      }
    ],
    "edges": [
      {
        "source": string (node id),
        "target": string (node id),
        "strength": number (1-10),
        "type": "frequent" | "occasional" | "rare",
        "context": string (describes relationship context)
      }
    ]
  },
  "recommendations": {
    "networkGrowth": string[] (strategies to expand role-based network),
    "influencerStrategy": string[] (how to leverage key roles),
    "contentStrategy": string[] (content tailored to different roles),
    "channelStrategy": string[] (channels to reach different roles),
    "engagementTactics": string[] (ways to strengthen role relationships)
  },
  "metrics": {
    "networkSize": number,
    "avgInfluence": number,
    "keyConnectors": string[] (important roles, not names),
    "reachPotential": number,
    "virality": number
  }
}`

export async function POST(req: Request) {
  try {
    const demographics: Demographics = await req.json()

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: JSON.stringify({
            task: "Generate a role-based social graph and word-of-mouth marketing recommendations based on the demographic profile. Focus on professional, academic, social, and family roles that would be in their network.",
            demographics
          })
        }
      ],
      response_format: { type: "json_object" },
    })

    const response = completion.choices[0].message.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }
    return NextResponse.json(JSON.parse(response))
  } catch (error) {
    console.error("Error in social-graph route:", error)
    return NextResponse.json(
      { error: "Failed to generate social graph analysis" },
      { status: 500 }
    )
  }
} 