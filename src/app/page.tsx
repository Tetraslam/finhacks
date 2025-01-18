"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NaturalLanguageInput } from "@/components/create/natural-language-input"
import { DemographicForm } from "@/components/create/demographic-form"
import { DemographicInsights } from "@/components/DemographicInsights"
import { SpendingChart } from "@/components/SpendingChart"
import { LLMFeedback } from "@/components/LLMFeedback"
import { DayInLife } from "@/components/DayInLife"
import { ExportImport } from "@/components/ExportImport"
import { type Demographics, type ExportData } from "@/lib/schema"
import { type ValidationResult, validateDemographics } from "@/lib/census"
import { useToast } from "@/hooks/use-toast"
import { generatePersona } from "@/lib/persona"
import { WhatIfScenarios } from "@/components/WhatIfScenarios"
import { PriceProduct } from "@/components/PriceProduct"

export default function Home() {
  const [demographics, setDemographics] = useState<Demographics | null>(null)
  const [insights, setInsights] = useState<ValidationResult["insights"] | null>(null)
  const [prompt, setPrompt] = useState<string>("")
  const [submitted, setSubmitted] = useState(false)
  const [activeTab, setActiveTab] = useState("create")
  const { toast } = useToast()
  const [llmFeedback, setLLMFeedback] = useState<ExportData["llmFeedback"] | null>(null)
  const [lifestyleAnalysis, setLifestyleAnalysis] = useState<ExportData["lifestyleAnalysis"] | null>(null)
  const [spendingHabits, setSpendingHabits] = useState<ExportData["spendingHabits"] | null>(null)
  const [scenarioDemographics, setScenarioDemographics] = useState<Demographics | null>(null)
  const [scenarioInsights, setScenarioInsights] = useState<ValidationResult["insights"] | null>(null)

  const handleDemographicsGenerated = async (data: Demographics) => {
    setDemographics(data)
    setSubmitted(true)
    try {
      const validationResult = await validateDemographics(data)
      setInsights(validationResult.insights)
      const persona = generatePersona(data, {
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
      })
      setSpendingHabits(persona.spendingHabits)
    } catch (error) {
      console.error("Failed to validate demographics:", error)
      toast({
        title: "Error",
        description: "Failed to fetch demographic insights. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handlePromptChange = (newPrompt: string) => {
    setPrompt(newPrompt)
    setSubmitted(false)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  const handleImport = async (data: ExportData) => {
    setActiveTab("create")
    setDemographics(data.demographics)
    setInsights(data.censusInsights)
    setLLMFeedback(data.llmFeedback)
    setLifestyleAnalysis(data.lifestyleAnalysis)
    setSpendingHabits(data.spendingHabits)
    setSubmitted(true)
  }

  const handleScenarioGenerated = async (newDemographics: Demographics) => {
    setScenarioDemographics(newDemographics)
    try {
      const validationResult = await validateDemographics(newDemographics)
      setScenarioInsights(validationResult.insights)
    } catch (error) {
      console.error("Failed to validate scenario demographics:", error)
      toast({
        title: "Error",
        description: "Failed to analyze scenario. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <MainLayout>
      <div className="flex-1 space-y-4 p-4 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Digital Twin Analysis</h2>
        </div>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList>
            <TabsTrigger value="create">Create Twin</TabsTrigger>
            <TabsTrigger value="analyze">Analyze</TabsTrigger>
            <TabsTrigger value="scenarios">What-If</TabsTrigger>
            <TabsTrigger value="export">Export/Import</TabsTrigger>
            <TabsTrigger value="price">Price This Product</TabsTrigger>
          </TabsList>
          <TabsContent value="create" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Demographics</CardTitle>
                <CardDescription>
                  Create a digital twin by describing the target demographic in natural language or using the form below.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <NaturalLanguageInput 
                  onDemographicsGenerated={handleDemographicsGenerated}
                  demographics={demographics}
                  setDemographics={setDemographics}
                  onPromptChange={handlePromptChange}
                />
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or fill out the form manually
                    </span>
                  </div>
                </div>
                <DemographicForm 
                  initialData={demographics || undefined}
                  onSubmit={handleDemographicsGenerated}
                />
                {insights && (
                  <>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          Demographic Analysis
                        </span>
                      </div>
                    </div>
                    <DemographicInsights insights={insights} />
                    {demographics && insights && (
                      <>
                        <SpendingChart 
                          data={generatePersona(demographics, {
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
                          }).spendingHabits}
                        />
                        <LLMFeedback 
                          prompt={prompt}
                          demographics={demographics}
                          submitted={submitted}
                          onFeedbackGenerated={setLLMFeedback}
                        />
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="analyze" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analysis</CardTitle>
                <CardDescription>
                  Analyze the digital twin&apos;s lifestyle and behavior patterns.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {demographics && activeTab === "analyze" ? (
                  <div className="space-y-6">
                    <DayInLife 
                      demographics={demographics} 
                      onAnalysisGenerated={setLifestyleAnalysis}
                    />
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Create a digital twin first to see their daily schedule and lifestyle analysis.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="price" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Price Analysis</CardTitle>
                <CardDescription>
                  Analyze optimal pricing for products targeting this demographic.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {demographics && activeTab === "price" ? (
                  <div className="space-y-6">
                    <PriceProduct demographics={demographics} />
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Create a digital twin first to analyze product pricing for their demographic profile.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="scenarios" className="space-y-4">
            <div className="grid gap-4 grid-cols-2">
              <WhatIfScenarios 
                demographics={demographics}
                onScenarioGenerated={handleScenarioGenerated}
              />
              {scenarioDemographics && scenarioInsights && (
                <Card>
                  <CardHeader>
                    <CardTitle>Scenario Analysis</CardTitle>
                    <CardDescription>
                      Impact analysis of the selected scenario.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <DemographicInsights insights={scenarioInsights} />
                    {scenarioDemographics && scenarioInsights && (
                      <>
                        <SpendingChart 
                          data={generatePersona(scenarioDemographics, {
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
                          }).spendingHabits}
                        />
                        <LLMFeedback 
                          prompt={`Analyze this scenario: ${scenarioDemographics.age} year old ${scenarioDemographics.occupation} in ${scenarioDemographics.location.state}`}
                          demographics={scenarioDemographics}
                          submitted={true}
                        />
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          <TabsContent value="export" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Export/Import</CardTitle>
                <CardDescription>
                  Export the digital twin data or import a previously saved twin.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ExportImport 
                  demographics={demographics}
                  insights={insights}
                  llmFeedback={llmFeedback}
                  lifestyleAnalysis={lifestyleAnalysis}
                  spendingHabits={spendingHabits}
                  onImport={handleImport}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
    </div>
    </MainLayout>
  )
}
