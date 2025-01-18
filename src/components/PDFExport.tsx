"use client"

import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer"
import { type ExportData } from "@/lib/schema"

// Use system fonts instead of loading from Google
Font.register({
  family: "Helvetica",
  fonts: [
    {
      src: "Helvetica",
    },
    {
      src: "Helvetica-Bold",
      fontWeight: "bold",
    },
  ]
})

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 8,
    color: "#1a1a1a",
  },
  subtitle: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
    color: "#2563eb",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 5,
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  label: {
    width: "40%",
    fontSize: 12,
    color: "#4b5563",
  },
  value: {
    flex: 1,
    fontSize: 12,
    color: "#1f2937",
  },
  insights: {
    marginTop: 10,
    fontSize: 12,
    color: "#1f2937",
    lineHeight: 1.5,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 10,
    color: "#9ca3af",
    textAlign: "center",
  },
  subsection: {
    marginTop: 10,
    marginBottom: 15,
  },
  subheader: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 5,
    fontWeight: "medium",
  },
})

interface PDFExportProps {
  data: ExportData
}

export function PDFDocument({ data }: PDFExportProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Helper to render sections only if they have content
  const renderSection = (title: string, content: string | null | undefined) => {
    if (!content) return null
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.insights}>{content}</Text>
      </View>
    )
  }

  // Helper to render census insights
  const renderCensusInsights = () => {
    if (!data.censusInsights) return null
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Census Analysis</Text>
        
        {/* Demographics Comparison */}
        <View style={styles.subsection}>
          <Text style={styles.subheader}>Demographics</Text>
          <Text style={styles.insights}>{data.censusInsights.ageComparison}</Text>
          <Text style={styles.insights}>{data.censusInsights.incomeComparison}</Text>
          <Text style={styles.insights}>{data.censusInsights.educationComparison}</Text>
          <Text style={styles.insights}>{data.censusInsights.householdComparison}</Text>
          <Text style={styles.insights}>{data.censusInsights.maritalStatusComparison}</Text>
        </View>

        {/* Income Analysis */}
        <View style={styles.subsection}>
          <Text style={styles.subheader}>Income Analysis</Text>
          <Text style={styles.insights}>{data.censusInsights.incomePercentile}</Text>
          <Text style={styles.insights}>{data.censusInsights.incomeVsState}</Text>
          <Text style={styles.insights}>{data.censusInsights.monthlyIncome}</Text>
        </View>

        {/* Education & Household */}
        <View style={styles.subsection}>
          <Text style={styles.subheader}>Education & Household</Text>
          <Text style={styles.insights}>{data.censusInsights.educationTrends}</Text>
          <Text style={styles.insights}>{data.censusInsights.educationVsIncome}</Text>
          <Text style={styles.insights}>{data.censusInsights.householdType}</Text>
          <Text style={styles.insights}>{data.censusInsights.householdVsMedian}</Text>
        </View>

        {/* Location & Financial */}
        <View style={styles.subsection}>
          <Text style={styles.subheader}>Location & Financial</Text>
          <Text style={styles.insights}>{data.censusInsights.locationDemographics}</Text>
          <Text style={styles.insights}>{data.censusInsights.costOfLiving}</Text>
          <Text style={styles.insights}>{data.censusInsights.suggestedSavings}</Text>
          <Text style={styles.insights}>{data.censusInsights.retirementProjections}</Text>
          <Text style={styles.insights}>{data.censusInsights.investmentPotential}</Text>
        </View>
      </View>
    )
  }

  // Helper to render spending habits if they exist
  const renderSpendingHabits = () => {
    if (!data.spendingHabits?.length) return null
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Spending Analysis</Text>
        {data.spendingHabits.map((habit, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.label}>{habit.category}:</Text>
            <Text style={styles.value}>
              {formatCurrency(habit.amount)} ({habit.percentage}%)
            </Text>
          </View>
        ))}
      </View>
    )
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Digital Twin Analysis Report</Text>
          <Text style={styles.subtitle}>Generated on {formatDate(data.exportDate)}</Text>
        </View>

        {/* Demographics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Demographics</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Age:</Text>
            <Text style={styles.value}>{data.demographics.age} years</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Income:</Text>
            <Text style={styles.value}>{formatCurrency(data.demographics.income)}/year</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Location:</Text>
            <Text style={styles.value}>
              {data.demographics.location.city}, {data.demographics.location.state} {data.demographics.location.zipCode}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Education:</Text>
            <Text style={styles.value}>{data.demographics.education}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Occupation:</Text>
            <Text style={styles.value}>{data.demographics.occupation}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Household Size:</Text>
            <Text style={styles.value}>{data.demographics.householdSize}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Marital Status:</Text>
            <Text style={styles.value}>{data.demographics.maritalStatus}</Text>
          </View>
        </View>

        {/* Render structured census insights */}
        {renderCensusInsights()}

        {data.llmFeedback && (
          <>
            {renderSection("Financial Profile", data.llmFeedback.financialProfile)}
            {renderSection("Risk Factors", data.llmFeedback.riskFactors)}
            {renderSection("Opportunities", data.llmFeedback.opportunities)}
            {renderSection("Behavioral Insights", data.llmFeedback.behavioralInsights)}
            {renderSection("Recommendations", data.llmFeedback.recommendations)}
          </>
        )}

        {data.lifestyleAnalysis && (
          <>
            {renderSection("Daily Schedule", data.lifestyleAnalysis.schedule)}
            {renderSection("Marketing Insights", data.lifestyleAnalysis.marketingInsights)}
            {renderSection("Financial Insights", data.lifestyleAnalysis.financialInsights)}
            {renderSection("Location Insights", data.lifestyleAnalysis.locationInsights)}
          </>
        )}

        {renderSpendingHabits()}

        {/* Footer */}
        <Text style={styles.footer}>
          Report Version {data.version} • Generated by ProsperouSSS Digital Twin Analysis
        </Text>
      </Page>
    </Document>
  )
} 