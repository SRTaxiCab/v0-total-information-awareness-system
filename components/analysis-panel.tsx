"use client"

import { useState } from "react"
import { Brain, Users, GitBranch, Clock, FileText, Loader2, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"

interface AnalysisPanelProps {
  projectId: string
  selectedDocuments: string[]
}

const ANALYSIS_TYPES = [
  {
    id: "extract_entities",
    title: "Extract Entities",
    description: "Identify people, organizations, locations, and events",
    icon: Users,
  },
  {
    id: "find_connections",
    title: "Find Connections",
    description: "Discover relationships and patterns in your research",
    icon: GitBranch,
  },
  {
    id: "timeline",
    title: "Build Timeline",
    description: "Extract temporal information and create event sequence",
    icon: Clock,
  },
  {
    id: "summarize",
    title: "Summarize",
    description: "Get a comprehensive summary of key findings",
    icon: FileText,
  },
]

export function AnalysisPanel({ projectId, selectedDocuments }: AnalysisPanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<Record<string, any>>({})
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set())

  const handleAnalysis = async (analysisType: string) => {
    if (selectedDocuments.length === 0) {
      alert("Please select documents to analyze")
      return
    }

    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentIds: selectedDocuments,
          analysisType,
          projectId,
        }),
      })

      const data = await response.json()
      setResults((prev) => ({ ...prev, [analysisType]: data.result }))
      setExpandedResults((prev) => new Set([...prev, analysisType]))
    } catch (error) {
      console.error("Analysis error:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const toggleResult = (analysisType: string) => {
    setExpandedResults((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(analysisType)) {
        newSet.delete(analysisType)
      } else {
        newSet.add(analysisType)
      }
      return newSet
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Analysis Tools
        </CardTitle>
        {selectedDocuments.length > 0 && (
          <Badge variant="secondary">{selectedDocuments.length} document(s) selected</Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {ANALYSIS_TYPES.map((analysis) => {
          const Icon = analysis.icon
          const hasResult = results[analysis.id]

          return (
            <div key={analysis.id}>
              <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent transition-colors">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium mb-1">{analysis.title}</h4>
                  <p className="text-sm text-muted-foreground">{analysis.description}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleAnalysis(analysis.id)}
                  disabled={isAnalyzing || selectedDocuments.length === 0}
                >
                  {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Run"}
                </Button>
              </div>

              {hasResult && (
                <Collapsible open={expandedResults.has(analysis.id)} onOpenChange={() => toggleResult(analysis.id)}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full mt-2 gap-2">
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          expandedResults.has(analysis.id) ? "rotate-180" : ""
                        }`}
                      />
                      View Results
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <Card className="mt-2 bg-muted/50">
                      <CardContent className="pt-4">
                        <pre className="text-xs whitespace-pre-wrap">{results[analysis.id]}</pre>
                      </CardContent>
                    </Card>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
