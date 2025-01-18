import { type Demographics } from "./schema"

interface ExtractedInfo {
  age?: number
  maritalStatus?: string
  education?: string
  income?: number
  location: {
    state?: string
    city?: string
    zipCode?: string
  }
  confidence: number
}

const AGE_PATTERNS = [
  /(\d+)(?:\s*(?:year|yr)s?)?(?:\s*old)?/i,
  /age(?:\s*:)?\s*(\d+)/i
]

const STATE_PATTERNS = [
  /\b(alabama|alaska|arizona|arkansas|california|colorado|connecticut|delaware|florida|georgia|hawaii|idaho|illinois|indiana|iowa|kansas|kentucky|louisiana|maine|maryland|massachusetts|michigan|minnesota|mississippi|missouri|montana|nebraska|nevada|new\s+hampshire|new\s+jersey|new\s+mexico|new\s+york|north\s+carolina|north\s+dakota|ohio|oklahoma|oregon|pennsylvania|rhode\s+island|south\s+carolina|south\s+dakota|tennessee|texas|utah|vermont|virginia|washington|west\s+virginia|wisconsin|wyoming)\b/i,
  /\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\b/
]

const MARITAL_STATUS_KEYWORDS = {
  single: ['single', 'never married', 'bachelor', 'unmarried', 'no wife', 'no husband'],
  married: ['married', 'wife', 'husband', 'spouse'],
  divorced: ['divorced', 'separated', 'ex-wife', 'ex-husband'],
  widowed: ['widowed', 'widow', 'widower'],
  separated: ['separated']
}

const EDUCATION_KEYWORDS = {
  'Less than High School': ['dropout', 'no diploma', 'no degree', 'elementary', 'middle school'],
  'High School': ['high school', 'hs diploma', 'ged'],
  'Some College': ['some college', 'associate', 'trade school', 'vocational'],
  'Bachelor\'s Degree': ['bachelor', 'college', 'university', 'undergrad'],
  'Master\'s Degree': ['master', 'graduate', 'phd', 'doctorate', 'professional degree']
}

const INCOME_PATTERNS = [
  /(?:earn|make|income|salary)\s*(?:of|:)?\s*\$?(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:k|thousand|m|million)?/i,
  /\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:k|thousand|m|million)?(?:\s*(?:per|a|\/)\s*(?:year|yr|annually))?/i
]

function findBestMatch(text: string, keywords: Record<string, string[]>): { value: string, confidence: number } {
  let bestMatch = { value: '', confidence: 0 }
  
  for (const [value, patterns] of Object.entries(keywords)) {
    for (const pattern of patterns) {
      if (text.toLowerCase().includes(pattern)) {
        const confidence = pattern.length / text.length // Simple confidence based on pattern length
        if (confidence > bestMatch.confidence) {
          bestMatch = { value, confidence }
        }
      }
    }
  }
  
  return bestMatch
}

function normalizeIncome(amount: string, modifier?: string): number {
  let value = parseFloat(amount.replace(/,/g, ''))
  
  if (modifier) {
    modifier = modifier.toLowerCase()
    if (modifier.includes('k') || modifier.includes('thousand')) {
      value *= 1000
    } else if (modifier.includes('m') || modifier.includes('million')) {
      value *= 1000000
    }
  }
  
  return value
}

export function extractDemographicInfo(text: string): ExtractedInfo {
  const info: ExtractedInfo = {
    location: {},
    confidence: 0
  }
  
  // Extract age
  for (const pattern of AGE_PATTERNS) {
    const match = text.match(pattern)
    if (match && match[1]) {
      info.age = parseInt(match[1])
      break
    }
  }

  // Extract state
  for (const pattern of STATE_PATTERNS) {
    const match = text.match(pattern)
    if (match && match[1]) {
      info.location.state = match[1]
      break
    }
  }

  // Extract marital status
  const maritalMatch = findBestMatch(text, MARITAL_STATUS_KEYWORDS)
  if (maritalMatch.confidence > 0) {
    info.maritalStatus = maritalMatch.value
  }

  // Extract education level
  const educationMatch = findBestMatch(text, EDUCATION_KEYWORDS)
  if (educationMatch.confidence > 0) {
    info.education = educationMatch.value
  }

  // Extract income
  for (const pattern of INCOME_PATTERNS) {
    const match = text.match(pattern)
    if (match && match[1]) {
      const modifier = match[2]
      info.income = normalizeIncome(match[1], modifier)
      break
    }
  }

  // Calculate overall confidence
  let confidencePoints = 0
  if (info.age) confidencePoints++
  if (info.location.state) confidencePoints++
  if (info.maritalStatus) confidencePoints++
  if (info.education) confidencePoints++
  if (info.income) confidencePoints++
  
  info.confidence = confidencePoints / 5 // Normalize to 0-1

  // Infer missing information based on context
  if (!info.education && info.age && info.age > 65) {
    info.education = 'High School' // Default for older generation
    info.confidence *= 0.8 // Reduce confidence for inferred data
  }

  if (!info.income && info.age) {
    if (info.age < 25) info.income = 30000
    else if (info.age < 35) info.income = 50000
    else if (info.age < 50) info.income = 75000
    else if (info.age < 65) info.income = 85000
    else info.income = 45000 // Retirement income
    info.confidence *= 0.8
  }

  if (!info.maritalStatus && info.age) {
    if (info.age < 25) info.maritalStatus = 'single'
    else if (info.age < 35) info.maritalStatus = 'married'
    else if (info.age > 75) info.maritalStatus = 'widowed'
    info.confidence *= 0.8
  }

  return info
}

export function inferDemographics(text: string): Demographics {
  const extracted = extractDemographicInfo(text)
  
  return {
    age: extracted.age || 35,
    maritalStatus: extracted.maritalStatus || 'Single',
    education: extracted.education || 'High School',
    income: extracted.income || 50000,
    location: {
      state: extracted.location.state || '',
      city: extracted.location.city || '',
      zipCode: extracted.location.zipCode || ''
    }
  }
} 