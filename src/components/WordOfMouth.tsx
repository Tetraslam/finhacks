"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type Demographics } from "@/lib/schema"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Users, Network, MessageSquare, Target, Megaphone } from "lucide-react"
import { motion } from "framer-motion"
import dynamic from "next/dynamic"

// Import ForceGraph dynamically to fix SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false })

interface WordOfMouthProps {
  demographics: Demographics
  cache: {[key: string]: SocialGraphData}
}

interface SocialGraphData {
  socialGraph: {
    nodes: Array<{
      id: string
      label: string
      type: "primary" | "secondary" | "tertiary"
      influence: number
      category: string
      description: string
    }>
    edges: Array<{
      source: string
      target: string
      strength: number
      type: "frequent" | "occasional" | "rare"
      context: string
    }>
  }
  recommendations: {
    networkGrowth: string[]
    influencerStrategy: string[]
    contentStrategy: string[]
    channelStrategy: string[]
    engagementTactics: string[]
  }
  metrics: {
    networkSize: number
    avgInfluence: number
    keyConnectors: string[]
    reachPotential: number
    virality: number
  }
}

export function WordOfMouth({ demographics, cache }: WordOfMouthProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [data, setData] = React.useState<SocialGraphData | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const { toast } = useToast()

  const generateSocialGraph = React.useCallback(async () => {
    if (!demographics) return

    // Create a cache key based on demographics
    const cacheKey = JSON.stringify(demographics)

    // Check if we have cached results
    if (cache[cacheKey]) {
      setData(cache[cacheKey])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/social-graph', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(demographics),
      })

      if (!response.ok) {
        throw new Error('Failed to generate social graph')
      }

      const newData = await response.json()
      
      // Cache the results
      cache[cacheKey] = newData

      setData(newData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast({
        title: "Error",
        description: "Failed to generate social graph. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [demographics, toast, cache])

  React.useEffect(() => {
    if (demographics) {
      const cacheKey = JSON.stringify(demographics)
      if (!cache[cacheKey]) {
        generateSocialGraph()
      } else {
        setData(cache[cacheKey])
      }
    }
  }, [demographics, generateSocialGraph])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    )
  }

  if (!data) return null

  const graphData = {
    nodes: data.socialGraph.nodes.map(node => ({
      ...node,
      val: node.influence * 2, // Size based on influence
      color: node.type === 'primary' 
        ? 'hsl(var(--primary))' 
        : node.type === 'secondary'
          ? 'hsl(var(--secondary))'
          : 'hsl(var(--muted-foreground))'
    })),
    links: data.socialGraph.edges.map(edge => ({
      ...edge,
      width: edge.strength,
      color: edge.type === 'frequent'
        ? 'hsla(var(--primary), 0.5)'
        : edge.type === 'occasional'
          ? 'hsla(var(--secondary), 0.3)'
          : 'hsla(var(--muted-foreground), 0.2)'
    }))
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-2">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Social Network Graph</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[500px] w-full border border-border rounded-lg overflow-hidden">
              <ForceGraph2D
                graphData={graphData}
                nodeLabel="label"
                nodeRelSize={6}
                linkWidth={link => (link as any).width / 2}
                linkDirectionalParticles={3}
                linkDirectionalParticleSpeed={0.005}
                backgroundColor="transparent"
                nodeCanvasObject={(node, ctx, globalScale) => {
                  const label = node.label as string
                  const fontSize = 12/globalScale
                  ctx.font = `${fontSize}px var(--font-display)`
                  ctx.fillStyle = node.color as string
                  ctx.fillText(label, (node.x || 0) + 8, (node.y || 0))
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              Network Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Network Size</span>
                  <span className="font-numeric">{data.metrics.networkSize}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Average Influence</span>
                  <span className="font-numeric">{data.metrics.avgInfluence.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Reach Potential</span>
                  <span className="font-numeric">{data.metrics.reachPotential}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Virality Score</span>
                  <span className="font-numeric">{data.metrics.virality.toFixed(1)}</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Key Connectors</h4>
                <ul className="list-disc pl-4 space-y-1">
                  {data.metrics.keyConnectors.map((connector, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="text-sm text-muted-foreground"
                    >
                      {connector}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Network Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-4 space-y-2">
              {data.recommendations.networkGrowth.map((rec, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-sm text-muted-foreground"
                >
                  {rec}
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Influencer Strategy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-4 space-y-2">
              {data.recommendations.influencerStrategy.map((rec, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-sm text-muted-foreground"
                >
                  {rec}
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Content Strategy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-4 space-y-2">
              {data.recommendations.contentStrategy.map((rec, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-sm text-muted-foreground"
                >
                  {rec}
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              Channel Strategy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-4 space-y-2">
              {data.recommendations.channelStrategy.map((rec, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-sm text-muted-foreground"
                >
                  {rec}
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 