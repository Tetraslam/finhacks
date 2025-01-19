"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Download, Upload, FileJson, FileText } from "lucide-react"
import { type Demographics, type ExportData } from "@/lib/schema"
import { validateDemographics } from "@/lib/census"
import { PDFDocument } from "./PDFExport"
import { pdf } from "@react-pdf/renderer"

interface ExportImportProps {
  demographics: Demographics | null
  insights: any // Will be replaced with proper type
  llmFeedback: any // Will be replaced with proper type
  lifestyleAnalysis: any // Will be replaced with proper type
  spendingHabits: any // Will be replaced with proper type
  onImport: (data: ExportData) => void
}

export function ExportImport({ 
  demographics, 
  insights,
  llmFeedback,
  lifestyleAnalysis,
  spendingHabits,
  onImport 
}: ExportImportProps) {
  const { toast } = useToast()
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false)

  const handleExportJSON = () => {
    if (!demographics) {
      toast({
        title: "No data to export",
        description: "Please create a digital twin first.",
        variant: "destructive",
      })
      return
    }

    const exportData: ExportData = {
      demographics,
      censusInsights: insights || "",
      llmFeedback: llmFeedback || {
        financialProfile: "",
        riskFactors: "",
        opportunities: "",
        behavioralInsights: "",
        recommendations: "",
      },
      lifestyleAnalysis: lifestyleAnalysis || {
        schedule: "",
        marketingInsights: "",
        financialInsights: "",
        locationInsights: "",
      },
      spendingHabits: spendingHabits || [],
      exportDate: new Date().toISOString(),
      version: "1.0.0"
    }

    console.log("Exporting data:", exportData)

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "digital-twin-full.json"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "Export successful",
      description: "Complete digital twin data has been exported to JSON.",
    })
  }

  const handleExportPDF = async () => {
    if (!demographics) {
      toast({
        title: "No data to export",
        description: "Please create a digital twin first.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsGeneratingPDF(true)
      
      const exportData: ExportData = {
        demographics,
        censusInsights: insights || {
          ageComparison: "",
          incomeComparison: "",
          educationComparison: "",
          householdComparison: "",
          maritalStatusComparison: "",
          incomePercentile: "",
          incomeVsState: "",
          monthlyIncome: "",
          educationTrends: "",
          educationVsIncome: "",
          householdType: "",
          householdVsMedian: "",
          locationDemographics: "",
          costOfLiving: "",
          suggestedSavings: "",
          retirementProjections: "",
          investmentPotential: "",
        },
        llmFeedback: llmFeedback || {
          financialProfile: "",
          riskFactors: "",
          opportunities: "",
          behavioralInsights: "",
          recommendations: "",
        },
        lifestyleAnalysis: lifestyleAnalysis || {
          schedule: "",
          marketingInsights: {
            shoppingHabits: [],
            brandPreferences: [],
            pricePoints: [],
            mediaConsumption: [],
            decisionFactors: []
          },
          financialInsights: {
            dailySpending: [],
            paymentMethods: [],
            financialGoals: [],
            investmentStyle: "",
            riskTolerance: ""
          },
          locationInsights: {
            frequentedLocations: [],
            commutePatterns: [],
            neighborhoodPreferences: []
          }
        },
        spendingHabits: spendingHabits || [],
        exportDate: new Date().toISOString(),
        version: "1.0.0"
      }

      console.log("Generating PDF with data:", exportData)

      // Create the PDF document with error boundary
      let pdfBlob: Blob | null = null
      try {
        pdfBlob = await pdf(React.createElement(PDFDocument, { data: exportData })).toBlob()
      } catch (pdfError) {
        console.error("PDF generation error:", pdfError)
        throw new Error("Failed to generate PDF document. Please try again.")
      }

      if (!pdfBlob) {
        throw new Error("Failed to generate PDF blob")
      }

      // Create and trigger download
      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `digital-twin-analysis-${exportData.demographics.age}yo-${exportData.demographics.occupation.toLowerCase()}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Export successful",
        description: "Digital twin analysis has been exported to PDF.",
      })
    } catch (error) {
      console.error("PDF generation error:", error)
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Failed to generate PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string
        const importedData = JSON.parse(content) as ExportData

        // Validate the imported data structure
        if (!importedData.demographics || !importedData.version) {
          throw new Error("Invalid digital twin data format")
        }

        // Re-run analysis to ensure data consistency
        const validationResult = await validateDemographics(importedData.demographics)
        
        // Merge the imported data with fresh analysis
        const mergedData: ExportData = {
          ...importedData,
          censusInsights: validationResult.insights,
          exportDate: new Date().toISOString(),
        }

        onImport(mergedData)
        toast({
          title: "Import successful",
          description: "Digital twin data has been imported and analysis refreshed.",
        })
      } catch (error) {
        console.error("Import error:", error)
        toast({
          title: "Import failed",
          description: "The selected file contains invalid data.",
          variant: "destructive",
        })
      }
    }

    reader.readAsText(file)
  }

  return (
    <div className="grid gap-4 grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Export</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleExportJSON}
            className="w-full"
            disabled={!demographics}
          >
            <FileJson className="h-4 w-4 mr-2" />
            Export as JSON
          </Button>
          <Button
            onClick={handleExportPDF}
            className="w-full"
            disabled={!demographics || isGeneratingPDF}
            variant="outline"
          >
            <FileText className="h-4 w-4 mr-2" />
            {isGeneratingPDF ? "Generating PDF..." : "Export as PDF"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Import</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="file"
            accept=".json"
            onChange={handleImport}
            ref={fileInputRef}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import from JSON
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 