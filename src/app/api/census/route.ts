import { NextResponse } from 'next/server'

const CENSUS_API_BASE = "https://api.census.gov/data"
const CURRENT_YEAR = "2019"
const DATASET = "acs/acs5"

// Variables we want to fetch
const variables = [
  "NAME",
  "B01002_001E", // Median Age
  "B19013_001E", // Median Household Income
  "B15003_001E", // Education Total
  "B15003_002E", // No schooling completed
  "B15003_017E", // High school graduate
  "B15003_022E", // Bachelor's degree
  "B15003_023E", // Master's degree
  "B11001_001E", // Household type
  "B12001_001E"  // Marital status
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const state = searchParams.get('state')
    const city = searchParams.get('city')
    const zipCode = searchParams.get('zipCode')

    // Construct Census API URL
    const baseUrl = `${CENSUS_API_BASE}/${CURRENT_YEAR}/${DATASET}`
    let url = `${baseUrl}?get=${variables.join(",")}`

    // Add geography predicates
    if (zipCode) {
      // For ZIP codes, we need to use "zip code tabulation area" and specify the state
      if (!state) {
        return NextResponse.json(
          { error: "State is required when querying by ZIP code" },
          { status: 400 }
        )
      }
      url += `&for=zip%20code%20tabulation%20area:${zipCode}&in=state:${state}`
    } else if (city && state) {
      // For cities, we need to use "place" with state
      url += `&for=place:*&in=state:${state}`
    } else if (state) {
      // For states, just use the state code
      url += `&for=state:${state}`
    } else {
      return NextResponse.json(
        { error: "No valid location provided" },
        { status: 400 }
      )
    }

    console.log("Fetching Census data from:", url)

    const response = await fetch(url)
    const responseText = await response.text()
    
    if (!response.ok) {
      console.error("Census API Error Response:", responseText)
      return NextResponse.json(
        { error: `Census API error: ${response.status} - ${responseText}` },
        { status: response.status }
      )
    }

    try {
      const data = JSON.parse(responseText)
      if (!Array.isArray(data) || data.length < 2) {
        throw new Error("Invalid data format")
      }
      return NextResponse.json(data)
    } catch {
      console.error("Failed to parse Census API response:", responseText)
      return NextResponse.json(
        { error: "Invalid response format from Census API" },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error("Census API Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch Census data" },
      { status: 500 }
    )
  }
} 