"use client"

import { useState, useEffect } from "react"
import { Save, Play, Trash2, Bell, BellOff } from "lucide-react"
import { Card, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import type { SavedQuery } from "@/lib/types/database"

interface SavedQueriesProps {
  userId: string
}

export function SavedQueries({ userId }: SavedQueriesProps) {
  const [queries, setQueries] = useState<SavedQuery[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadQueries()
  }, [userId])

  const loadQueries = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("saved_queries")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error
      setQueries(data || [])
    } catch (error) {
      console.error("Error loading saved queries:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleAlert = async (queryId: string, currentState: boolean) => {
    try {
      const { error } = await supabase.from("saved_queries").update({ alert_enabled: !currentState }).eq("id", queryId)

      if (error) throw error
      loadQueries()
    } catch (error) {
      console.error("Error toggling alert:", error)
    }
  }

  const deleteQuery = async (queryId: string) => {
    try {
      const { error } = await supabase.from("saved_queries").delete().eq("id", queryId)

      if (error) throw error
      loadQueries()
    } catch (error) {
      console.error("Error deleting query:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-20 bg-muted" />
          </Card>
        ))}
      </div>
    )
  }

  if (queries.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Save className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No saved queries</h3>
        <p className="text-muted-foreground">Save your searches to quickly access them later</p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {queries.map((query) => (
        <Card key={query.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{query.name}</h3>
                {query.description && <p className="text-sm text-muted-foreground">{query.description}</p>}
                <div className="flex items-center gap-2 mt-2">
                  {query.alert_enabled && (
                    <Badge variant="default" className="gap-1">
                      <Bell className="h-3 w-3" />
                      Alert active
                    </Badge>
                  )}
                  {query.last_run_at && (
                    <span className="text-xs text-muted-foreground">
                      Last run: {new Date(query.last_run_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <Play className="h-4 w-4 mr-1" />
                  Run
                </Button>
                <Button size="sm" variant="ghost" onClick={() => toggleAlert(query.id, query.alert_enabled)}>
                  {query.alert_enabled ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => deleteQuery(query.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
