import { Card } from "@/components/ui/card"
import { ValidationResult } from "@/lib/census"
import { 
  ChartBarIcon, 
  HomeIcon, 
  AcademicCapIcon, 
  UserGroupIcon, 
  MapPinIcon, 
  BanknotesIcon 
} from "@heroicons/react/24/outline"

interface DemographicInsightsProps {
  insights: ValidationResult["insights"]
  className?: string
}

interface InsightSectionProps {
  title: string
  icon: React.ReactNode
  insights: string[]
}

function InsightSection({ title, icon, insights }: InsightSectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5">{icon}</div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <ul className="space-y-1 text-sm text-muted-foreground">
        {insights.map((insight, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="block w-1.5 h-1.5 mt-1.5 rounded-full bg-primary" />
            <span>{insight}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function DemographicInsights({ insights, className = '' }: DemographicInsightsProps) {
  const sections = [
    {
      title: "Basic Demographics",
      icon: <ChartBarIcon className="w-5 h-5" />,
      insights: [
        insights.ageComparison,
        insights.incomeComparison,
        insights.educationComparison,
        insights.householdComparison,
        insights.maritalStatusComparison
      ].filter(Boolean)
    },
    {
      title: "Income Analysis",
      icon: <BanknotesIcon className="w-5 h-5" />,
      insights: [
        insights.incomePercentile,
        insights.incomeVsState,
        insights.monthlyIncome
      ].filter(Boolean)
    },
    {
      title: "Education Context",
      icon: <AcademicCapIcon className="w-5 h-5" />,
      insights: [
        insights.educationTrends,
        insights.educationVsIncome
      ].filter(Boolean)
    },
    {
      title: "Household Profile",
      icon: <HomeIcon className="w-5 h-5" />,
      insights: [
        insights.householdType,
        insights.householdVsMedian
      ].filter(Boolean)
    },
    {
      title: "Location Context",
      icon: <MapPinIcon className="w-5 h-5" />,
      insights: [
        insights.locationDemographics,
        insights.costOfLiving
      ].filter(Boolean)
    },
    {
      title: "Financial Planning",
      icon: <UserGroupIcon className="w-5 h-5" />,
      insights: [
        insights.suggestedSavings,
        insights.retirementProjections,
        insights.investmentPotential
      ].filter(Boolean)
    }
  ]

  return (
    <Card className={`p-6 grid gap-6 ${className}`}>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((section, index) => (
          <InsightSection
            key={index}
            title={section.title}
            icon={section.icon}
            insights={section.insights}
          />
        ))}
      </div>
    </Card>
  )
} 