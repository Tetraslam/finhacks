import { type Demographics } from "./schema"

// FIPS state codes mapping
const STATE_CODES: { [key: string]: string } = {
  "Alabama": "01",
  "Alaska": "02",
  "Arizona": "04",
  "Arkansas": "05",
  "California": "06",
  "Colorado": "08",
  "Connecticut": "09",
  "Delaware": "10",
  "District of Columbia": "11",
  "Florida": "12",
  "Georgia": "13",
  "Hawaii": "15",
  "Idaho": "16",
  "Illinois": "17",
  "Indiana": "18",
  "Iowa": "19",
  "Kansas": "20",
  "Kentucky": "21",
  "Louisiana": "22",
  "Maine": "23",
  "Maryland": "24",
  "Massachusetts": "25",
  "Michigan": "26",
  "Minnesota": "27",
  "Mississippi": "28",
  "Missouri": "29",
  "Montana": "30",
  "Nebraska": "31",
  "Nevada": "32",
  "New Hampshire": "33",
  "New Jersey": "34",
  "New Mexico": "35",
  "New York": "36",
  "North Carolina": "37",
  "North Dakota": "38",
  "Ohio": "39",
  "Oklahoma": "40",
  "Oregon": "41",
  "Pennsylvania": "42",
  "Rhode Island": "44",
  "South Carolina": "45",
  "South Dakota": "46",
  "Tennessee": "47",
  "Texas": "48",
  "Utah": "49",
  "Vermont": "50",
  "Virginia": "51",
  "Washington": "53",
  "West Virginia": "54",
  "Wisconsin": "55",
  "Wyoming": "56"
}

// State abbreviations mapping
const STATE_ABBREVIATIONS: { [key: string]: string } = {
  "AL": "Alabama",
  "AK": "Alaska",
  "AZ": "Arizona",
  "AR": "Arkansas",
  "CA": "California",
  "CO": "Colorado",
  "CT": "Connecticut",
  "DE": "Delaware",
  "DC": "District of Columbia",
  "FL": "Florida",
  "GA": "Georgia",
  "HI": "Hawaii",
  "ID": "Idaho",
  "IL": "Illinois",
  "IN": "Indiana",
  "IA": "Iowa",
  "KS": "Kansas",
  "KY": "Kentucky",
  "LA": "Louisiana",
  "ME": "Maine",
  "MD": "Maryland",
  "MA": "Massachusetts",
  "MI": "Michigan",
  "MN": "Minnesota",
  "MS": "Mississippi",
  "MO": "Missouri",
  "MT": "Montana",
  "NE": "Nebraska",
  "NV": "Nevada",
  "NH": "New Hampshire",
  "NJ": "New Jersey",
  "NM": "New Mexico",
  "NY": "New York",
  "NC": "North Carolina",
  "ND": "North Dakota",
  "OH": "Ohio",
  "OK": "Oklahoma",
  "OR": "Oregon",
  "PA": "Pennsylvania",
  "RI": "Rhode Island",
  "SC": "South Carolina",
  "SD": "South Dakota",
  "TN": "Tennessee",
  "TX": "Texas",
  "UT": "Utah",
  "VT": "Vermont",
  "VA": "Virginia",
  "WA": "Washington",
  "WV": "West Virginia",
  "WI": "Wisconsin",
  "WY": "Wyoming"
}

interface CensusOptions {
  state?: string
  city?: string
  zipCode?: string
}

export interface CensusDemographicData {
  medianAge: number
  medianIncome: number
  educationLevels: {
    lessHighSchool: number
    highSchool: number
    someCollege: number
    bachelors: number
    graduate: number
  }
  householdSize: number
  maritalStatus: {
    single: number
    married: number
    divorced: number
    widowed: number
    separated: number
  }
}

function getStateCode(state: string): string {
  // If it's already a FIPS code (2 digits), return it
  if (/^\d{2}$/.test(state)) {
    return state
  }
  
  // Convert to uppercase for abbreviation lookup
  const stateUpper = state.toUpperCase()
  
  // Check if it's a state abbreviation
  if (stateUpper in STATE_ABBREVIATIONS) {
    const fullStateName = STATE_ABBREVIATIONS[stateUpper]
    return STATE_CODES[fullStateName]
  }
  
  // Try to find the state code by full name (case-insensitive)
  const stateKey = Object.keys(STATE_CODES).find(
    key => key.toLowerCase() === state.toLowerCase()
  )
  
  if (!stateKey) {
    throw new Error(`Invalid state: ${state}. Please use full state name or 2-letter abbreviation.`)
  }
  
  return STATE_CODES[stateKey]
}

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
  "B11001_001E", // Total households
  "B11001_002E", // Family households
  "B11001_007E", // Nonfamily households
  "B12001_001E"  // Marital status
]

async function fetchCensusData(options: CensusOptions): Promise<CensusDemographicData> {
  const { state, city, zipCode } = options

  try {
    // Construct URL for our API route
    const url = new URL('http://localhost:3000/api/census')
    
    // If zipCode is provided, state is required
    if (zipCode && !state) {
      throw new Error("State is required when querying by ZIP code")
    }

    // Add query parameters
    if (state) {
      const stateCode = getStateCode(state)
      url.searchParams.append('state', stateCode)
    }
    if (city) url.searchParams.append('city', city)
    if (zipCode) url.searchParams.append('zipCode', zipCode)

    console.log("Fetching from:", url.toString())

    const response = await fetch(url.toString())
    const responseData = await response.json()
    
    if (!response.ok) {
      throw new Error(responseData.error || `Census API error: ${response.status}`)
    }

    if (!Array.isArray(responseData) || responseData.length < 2) {
      throw new Error("Invalid data format received from Census API")
    }

    // For debugging
    console.log("Census API response:", responseData)

    // Process the actual Census data
    // The first row contains headers, actual data starts from index 1
    const headers = responseData[0]
    const row = responseData[1]

    // Find indices for each variable
    const getIndex = (prefix: string) => headers.findIndex((h: string) => h.startsWith(prefix))

    const nameIdx = getIndex("NAME")
    const ageIdx = getIndex("B01002_001E")
    const incomeIdx = getIndex("B19013_001E")
    const eduTotalIdx = getIndex("B15003_001E")
    const noSchoolIdx = getIndex("B15003_002E")
    const hsIdx = getIndex("B15003_017E")
    const bachelorIdx = getIndex("B15003_022E")
    const masterIdx = getIndex("B15003_023E")
    const totalHouseholdsIdx = getIndex("B11001_001E")
    const familyHouseholdsIdx = getIndex("B11001_002E")
    const nonFamilyHouseholdsIdx = getIndex("B11001_007E")

    const total = parseFloat(row[eduTotalIdx]) || 1 // Education total
    const totalHouseholds = parseFloat(row[totalHouseholdsIdx]) || 1
    const familyHouseholds = parseFloat(row[familyHouseholdsIdx]) || 0
    const nonFamilyHouseholds = parseFloat(row[nonFamilyHouseholdsIdx]) || 0

    // Calculate average household size
    // Family households typically have 2+ people, non-family typically have 1-2
    const estimatedTotalPeople = (familyHouseholds * 2.5) + (nonFamilyHouseholds * 1.2)
    const averageHouseholdSize = estimatedTotalPeople / totalHouseholds

    return {
      medianAge: parseFloat(row[ageIdx]) || 35,
      medianIncome: parseFloat(row[incomeIdx]) || 75000,
      educationLevels: {
        lessHighSchool: (parseFloat(row[noSchoolIdx]) / total * 100) || 10,
        highSchool: (parseFloat(row[hsIdx]) / total * 100) || 25,
        someCollege: 30, // Need to add correct variable
        bachelors: (parseFloat(row[bachelorIdx]) / total * 100) || 25,
        graduate: (parseFloat(row[masterIdx]) / total * 100) || 10,
      },
      householdSize: Number(averageHouseholdSize.toFixed(1)) || 2.5,
      maritalStatus: {
        single: 30,
        married: 45,
        divorced: 15,
        widowed: 5,
        separated: 5,
      }
    }

  } catch (error) {
    console.error("Census API Error:", error)
    // Return mock data for development
    return {
      medianAge: 35,
      medianIncome: 75000,
      educationLevels: {
        lessHighSchool: 10,
        highSchool: 25,
        someCollege: 30,
        bachelors: 25,
        graduate: 10,
      },
      householdSize: 2.5,
      maritalStatus: {
        single: 30,
        married: 45,
        divorced: 15,
        widowed: 5,
        separated: 5,
      }
    }
  }
}

export interface ValidationResult {
  isValid: boolean
  insights: {
    // Basic Demographics
    ageComparison: string
    incomeComparison: string
    educationComparison: string
    householdComparison: string
    maritalStatusComparison: string
    
    // Detailed Income Analysis
    incomePercentile?: string
    incomeVsState?: string
    monthlyIncome?: string
    
    // Education Context
    educationTrends?: string
    educationVsIncome?: string
    
    // Household Insights
    householdType?: string
    householdVsMedian?: string
    
    // Location Context
    locationDemographics?: string
    costOfLiving?: string
    
    // Financial Implications
    suggestedSavings?: string
    retirementProjections?: string
    investmentPotential?: string
  }
}

export async function validateDemographics(demographics: Demographics): Promise<ValidationResult> {
  try {
    const censusData = await fetchCensusData({
      state: demographics.location.state,
      city: demographics.location.city,
      zipCode: demographics.location.zipCode,
    })

    const getEducationLevel = (education: string): keyof CensusDemographicData["educationLevels"] => {
      switch (education) {
        case "Less than High School": return "lessHighSchool"
        case "High School": return "highSchool"
        case "Some College": return "someCollege"
        case "Bachelor's Degree": return "bachelors"
        case "Master's Degree":
        case "Doctoral Degree": return "graduate"
        default: return "highSchool"
      }
    }

    // Helper function to normalize marital status
    const normalizeMaritalStatus = (status: string): keyof CensusDemographicData["maritalStatus"] => {
      const normalized = status.toLowerCase()
      switch (normalized) {
        case "single": return "single"
        case "married": return "married"
        case "divorced": return "divorced"
        case "widowed": return "widowed"
        case "separated": return "separated"
        default: return "single"
      }
    }

    // Calculate percentiles and additional metrics
    const incomeDiff = ((demographics.income - censusData.medianIncome) / censusData.medianIncome) * 100
    const monthlyIncome = demographics.income / 12
    const suggestedSavings = monthlyIncome * 0.20 // 20% savings rule
    const retirementAge = 65
    const yearsToRetirement = Math.max(0, retirementAge - demographics.age)
    const retirementSavingsGoal = demographics.income * 10 // 10x salary rule
    
    // Determine household type based on size
    const householdType = censusData.householdSize <= 2 ? "small" : 
                         censusData.householdSize <= 4 ? "medium" : "large"

    // Education level comparison
    const eduLevel = getEducationLevel(demographics.education)
    const eduPercentage = censusData.educationLevels[eduLevel]

    // Safe marital status comparison
    const maritalStatus = normalizeMaritalStatus(demographics.maritalStatus)
    const maritalStatusPercentage = censusData.maritalStatus[maritalStatus] || 0

    return {
      isValid: true,
      insights: {
        // Basic Demographics
        ageComparison: `Age is ${demographics.age > censusData.medianAge ? "above" : "below"} the median age (${censusData.medianAge}) for this area`,
        incomeComparison: `Income is ${demographics.income > censusData.medianIncome ? "above" : "below"} the median income ($${censusData.medianIncome.toLocaleString()}) for this area`,
        educationComparison: `${eduPercentage.toFixed(1)}% of people in this area have a similar education level`,
        householdComparison: `Average household size in this area is ${censusData.householdSize} people`,
        maritalStatusComparison: `${maritalStatusPercentage.toFixed(1)}% of people in this area have the same marital status`,
        
        // Detailed Income Analysis
        incomePercentile: `The income is ${Math.abs(incomeDiff).toFixed(1)}% ${incomeDiff > 0 ? "above" : "below"} the median for this area`,
        incomeVsState: `Monthly income of $${monthlyIncome.toLocaleString(undefined, {maximumFractionDigits: 0})} suggests ${incomeDiff > 20 ? "comfortable" : incomeDiff > 0 ? "moderate" : "tight"} living standards for this area`,
        monthlyIncome: `Monthly income breakdown: $${monthlyIncome.toLocaleString(undefined, {maximumFractionDigits: 0})} gross, suggesting about $${(monthlyIncome * 0.75).toLocaleString(undefined, {maximumFractionDigits: 0})} after taxes`,
        
        // Education Context
        educationTrends: `People with ${demographics.education} education in this area typically earn ${eduPercentage > 50 ? "above" : "below"} median income`,
        educationVsIncome: `This income level is ${demographics.income > censusData.medianIncome ? "typical" : "atypical"} for this education level in this area`,
        
        // Household Insights
        householdType: `This area has predominantly ${householdType} households`,
        householdVsMedian: `The household profile aligns with ${censusData.householdSize > 2 ? "family" : "non-family"} household patterns in this area`,
        
        // Location Context
        locationDemographics: `This area has a ${censusData.medianAge > 40 ? "mature" : "young"} population with ${censusData.medianIncome > 75000 ? "high" : "moderate"} income levels`,
        costOfLiving: `Based on median income, this area has ${censusData.medianIncome > 75000 ? "high" : censusData.medianIncome > 50000 ? "moderate" : "low"} cost of living`,
        
        // Financial Implications
        suggestedSavings: `Recommended monthly savings: $${suggestedSavings.toLocaleString(undefined, {maximumFractionDigits: 0})} (20% of income)`,
        retirementProjections: `Retirement goal: $${retirementSavingsGoal.toLocaleString()} in ${yearsToRetirement} years`,
        investmentPotential: `Investment capacity: ${demographics.income > censusData.medianIncome * 1.2 ? "High" : demographics.income > censusData.medianIncome ? "Moderate" : "Limited"} based on income vs. area median`
      }
    }
  } catch (error) {
    console.error("Validation error:", error)
    // Return a generic insight if the Census API fails
    return {
      isValid: true,
      insights: {
        ageComparison: "Unable to compare age with area statistics",
        incomeComparison: "Unable to compare income with area statistics",
        educationComparison: "Unable to compare education with area statistics",
        householdComparison: "Unable to compare household size with area statistics",
        maritalStatusComparison: "Unable to compare marital status with area statistics"
      }
    }
  }
} 