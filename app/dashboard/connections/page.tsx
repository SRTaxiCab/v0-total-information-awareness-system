"use client"

import { useState, useEffect } from "react"
import { Network, Plus } from "lucide-react"
import { Card, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import type { Connection } from "@/lib/types/database"

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    loadConnections()
  }, [])

  const loadConnections = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("connections")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setConnections(data || [])
    } catch (error) {
      console.error("Error loading connections:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Connections</h1>
          <p className="text-muted-foreground">
            Visualize relationships between documents and entities
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Connection
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-20 bg-muted" />
            </Card>
          ))}
        </div>
      ) : connections.length === 0 ? (
        <Card className="p-12 text-center">
          <Network className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No connections yet</h3>
          <p className="text-muted-foreground">
            Create connections to map relationships in your research
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {connections.map((connection) => (
            <Card key={connection.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <Badge variant="outline">{connection.source_type}</Badge>
                    <span className="text-sm text-muted-foreground">→</span>
                    <Badge variant="outline">{connection.target_type}</Badge>
                    <Badge>{connection.connection_type}</Badge>
                    <div className="ml-auto flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        Strength: {Math.round(connection.strength * 100)}%
                      </span>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    View
                  </Button>
                </div>
                {connection.description && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {connection.description}
                  </p>
                )}
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
