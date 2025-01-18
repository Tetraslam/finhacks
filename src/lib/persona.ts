import { type Demographics } from "./schema"
import { type CensusDemographicData } from "./census"

interface PersonaTraits {
  lifestyle: string[]
  interests: string[]
  financialGoals: string[]
  challenges: string[]
  opportunities: string[]
  spendingHabits: {
    category: string
    percentage: number
    notes: string
  }[]
}

const LIFESTYLE_PATTERNS = {
  age: {
    young: {
      range: [18, 30],
      traits: ['active', 'social', 'tech-savvy', 'career-focused']
    },
    middleAge: {
      range: [31, 50],
      traits: ['family-oriented', 'career-established', 'health-conscious']
    },
    senior: {
      range: [51, 120],
      traits: ['retirement-focused', 'leisure-oriented', 'health-prioritizing']
    }
  },
  income: {
    low: {
      range: [0, 40000],
      traits: ['budget-conscious', 'value-seeking', 'practical']
    },
    middle: {
      range: [40001, 100000],
      traits: ['balanced-spending', 'saving-oriented', 'quality-focused']
    },
    high: {
      range: [100001, Infinity],
      traits: ['luxury-oriented', 'investment-focused', 'experience-seeking']
    }
  },
  education: {
    'Less than High School': ['practical-skills', 'hands-on-learning'],
    'High School': ['traditional-values', 'practical-minded'],
    'Some College': ['skill-developing', 'career-transitioning'],
    'Bachelor\'s Degree': ['professionally-oriented', 'career-focused'],
    'Master\'s Degree': ['academically-inclined', 'specialized-expertise']
  }
}

const SPENDING_CATEGORIES = {
  housing: {
    basePercentage: 30,
    modifiers: {
      income: { low: +5, high: -5 },
      age: { young: +5, senior: -5 }
    }
  },
  transportation: {
    basePercentage: 15,
    modifiers: {
      income: { low: +2, high: -2 },
      age: { young: +3, senior: -3 }
    }
  },
  food: {
    basePercentage: 12,
    modifiers: {
      income: { low: +3, high: -2 },
      age: { young: +2, senior: -1 }
    }
  },
  healthcare: {
    basePercentage: 8,
    modifiers: {
      income: { low: +2, high: -1 },
      age: { young: -3, senior: +5 }
    }
  },
  entertainment: {
    basePercentage: 10,
    modifiers: {
      income: { low: -3, high: +5 },
      age: { young: +5, senior: -3 }
    }
  },
  savings: {
    basePercentage: 15,
    modifiers: {
      income: { low: -5, high: +10 },
      age: { young: -2, senior: +5 }
    }
  },
  other: {
    basePercentage: 10,
    modifiers: {
      income: { low: -2, high: +3 },
      age: { young: +2, senior: -1 }
    }
  }
}

function getIncomeCategory(income: number): keyof typeof LIFESTYLE_PATTERNS.income {
  if (income <= 40000) return 'low'
  if (income <= 100000) return 'middle'
  return 'high'
}

function getAgeCategory(age: number): keyof typeof LIFESTYLE_PATTERNS.age {
  if (age <= 30) return 'young'
  if (age <= 50) return 'middleAge'
  return 'senior'
}

function calculateSpendingPercentage(
  category: keyof typeof SPENDING_CATEGORIES,
  demographics: Demographics
): { percentage: number; notes: string[] } {
  const config = SPENDING_CATEGORIES[category]
  let percentage = config.basePercentage
  const notes: string[] = []

  const incomeCategory = getIncomeCategory(demographics.income)
  const ageCategory = getAgeCategory(demographics.age)

  // Apply income modifiers
  if (config.modifiers.income) {
    const mod = config.modifiers.income[incomeCategory]
    if (mod) {
      percentage += mod
      notes.push(`${mod > 0 ? 'Increased' : 'Decreased'} due to ${incomeCategory} income`)
    }
  }

  // Apply age modifiers
  if (config.modifiers.age) {
    const mod = config.modifiers.age[ageCategory]
    if (mod) {
      percentage += mod
      notes.push(`${mod > 0 ? 'Increased' : 'Decreased'} due to ${ageCategory} age group`)
    }
  }

  return { percentage, notes }
}

export function generatePersona(demographics: Demographics, censusData: CensusDemographicData): PersonaTraits {
  const ageCategory = getAgeCategory(demographics.age)
  const incomeCategory = getIncomeCategory(demographics.income)
  
  const lifestyle = [
    ...LIFESTYLE_PATTERNS.age[ageCategory].traits,
    ...LIFESTYLE_PATTERNS.income[incomeCategory].traits,
    ...LIFESTYLE_PATTERNS.education[demographics.education]
  ]

  const interests = []
  const financialGoals = []
  const challenges = []
  const opportunities = []
  const spendingHabits = []

  // Generate interests based on demographics
  if (demographics.age < 30) {
    interests.push('social media', 'technology', 'entertainment')
    financialGoals.push('building credit', 'starting investments', 'career growth')
    challenges.push('student debt', 'building credit history', 'entry-level income')
    opportunities.push('high growth potential', 'tech-savvy advantage', 'time to compound investments')
  } else if (demographics.age < 50) {
    interests.push('home improvement', 'family activities', 'career development')
    financialGoals.push('retirement savings', 'college funds', 'mortgage management')
    challenges.push('work-life balance', 'family expenses', 'career advancement')
    opportunities.push('peak earning years', 'investment growth', 'career advancement')
  } else {
    interests.push('travel', 'health & wellness', 'hobbies')
    financialGoals.push('retirement planning', 'estate planning', 'healthcare savings')
    challenges.push('healthcare costs', 'fixed income management', 'market volatility')
    opportunities.push('retirement benefits', 'investment experience', 'time for leisure')
  }

  // Generate spending habits
  for (const [category, config] of Object.entries(SPENDING_CATEGORIES)) {
    const { percentage, notes } = calculateSpendingPercentage(
      category as keyof typeof SPENDING_CATEGORIES,
      demographics
    )
    spendingHabits.push({
      category,
      percentage,
      notes: notes.join('; ')
    })
  }

  return {
    lifestyle,
    interests,
    financialGoals,
    challenges,
    opportunities,
    spendingHabits
  }
} 