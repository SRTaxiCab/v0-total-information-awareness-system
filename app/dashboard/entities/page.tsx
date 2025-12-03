"use client"

import { useState, useEffect } from "react"
import { Users, Plus } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import type { Entity } from "@/lib/types/database"

export default function EntitiesPage() {
  const [entities, setEntities] = useState<Entity[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState("all")

  const supabase = createClient()

  useEffect(() => {
    loadEntities()
  }, [])

  const loadEntities = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("entities")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setEntities(data || [])
    } catch (error) {
      console.error("Error loading entities:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredEntities = filterType === "all" 
    ? entities 
    : entities.filter(e => e.entity_type === filterType)

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Entities</h1>
          <p className="text-muted-foreground">
            Track people, organizations, locations, and concepts
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Entity
        </Button>
      </div>

      <Tabs value={filterType} onValueChange={setFilterType}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="person">People</TabsTrigger>
          <TabsTrigger value="organization">Organizations</TabsTrigger>
          <TabsTrigger value="location">Locations</TabsTrigger>
          <TabsTrigger value="concept">Concepts</TabsTrigger>
          <TabsTrigger value="event">Events</TabsTrigger>
        </TabsList>

        <TabsContent value={filterType} className="mt-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="h-20 bg-muted" />
                </Card>
              ))}
            </div>
          ) : filteredEntities.length === 0 ? (
            <Card className="p-12 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No entities found</h3>
              <p className="text-muted-foreground">
                Add entities manually or extract them from documents
              </p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredEntities.map((entity) => (
                <Card key={entity.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Badge variant="outline" className="mb-2">
                          {entity.entity_type}
                        </Badge>
                        <h3 className="font-semibold text-lg mb-2">{entity.name}</h3>
                        {entity.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {entity.description}
                          </p>
                        )}
                        <div className="mt-3 text-xs text-muted-foreground">
                          {entity.related_documents?.length || 0} documents
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
