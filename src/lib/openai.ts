import OpenAI from "openai"
import { type Demographics } from "./schema"

if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
  throw new Error("Missing NEXT_PUBLIC_OPENAI_API_KEY environment variable")
}

export const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Required for client-side usage
})

export async function generateDemographics(prompt: string): Promise<Demographics> {
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: `You are a helpful assistant that extracts demographic information from natural language descriptions.
        You should return a JSON object that matches this TypeScript type:
        
        type Demographics = {
          age: number;
          income: number;
          location: {
            state: string;
            city: string;
            zipCode: string;
          };
          education: "Less than High School" | "High School" | "Some College" | "Bachelor's Degree" | "Master's Degree" | "Doctoral Degree";
          occupation: string;
          householdSize: number;
          maritalStatus: "Single" | "Married" | "Divorced" | "Widowed" | "Separated";
        }
        
        If any information is missing, make reasonable assumptions based on the provided context.
        Ensure all fields are filled with valid values.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    response_format: { type: "json_object" },
  })

  if (!response.choices[0]?.message?.content) {
    throw new Error("Failed to generate demographics")
  }

  const data = JSON.parse(response.choices[0].message.content)
  return data as Demographics
} 