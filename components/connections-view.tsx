"use client"

import { useState } from "react"
import { Network, Plus, Users, Building, MapPin, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { Project, Entity, Connection } from "@/lib/types/database"

interface ConnectionsViewProps {
  userId: string
  projects: Project[]
  initialEntities: Entity[]
  initialConnections: Connection[]
}

const ENTITY_ICONS = {
  person: Users,
  organization: Building,
  location: MapPin,
  event: Network,
  concept: Lightbulb,
}

export function ConnectionsView({ userId, projects, initialEntities, initialConnections }: ConnectionsViewProps) {
  const [entities, setEntities] = useState<Entity[]>(initialEntities)
  const [connections, setConnections] = useState<Connection[]>(initialConnections)
  const [selectedProject, setSelectedProject] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")

  const filteredEntities = entities.filter(
    (entity) =>
      (selectedProject === "all" || entity.project_id === selectedProject) &&
      (selectedType === "all" || entity.entity_type === selectedType),
  )

  const getEntityConnections = (entityId: string) => {
    return connections.filter(
      (conn) =>
        (conn.source_id === entityId && conn.source_type === "entity") ||
        (conn.target_id === entityId && conn.target_type === "entity"),
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Connections & Entities</h1>
          <p className="text-muted-foreground">Map relationships and discover patterns in your research</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Entity
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="person">People</SelectItem>
            <SelectItem value="organization">Organizations</SelectItem>
            <SelectItem value="location">Locations</SelectItem>
            <SelectItem value="event">Events</SelectItem>
            <SelectItem value="concept">Concepts</SelectItem>
          </SelectContent>
        </Select>

        <Badge variant="secondary" className="gap-2">
          <Network className="h-3 w-3" />
          {filteredEntities.length} entities
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEntities.map((entity) => {
          const Icon = ENTITY_ICONS[entity.entity_type as keyof typeof ENTITY_ICONS]
          const entityConnections = getEntityConnections(entity.id)

          return (
            <Card key={entity.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{entity.name}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {entity.entity_type}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {entity.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{entity.description}</p>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{entityConnections.length} connections</span>
                  {entity.tags && entity.tags.length > 0 && (
                    <div className="flex gap-1">
                      {entity.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}

        {filteredEntities.length === 0 && (
          <Card className="col-span-full p-12 text-center">
            <Network className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No entities yet</h3>
            <p className="text-muted-foreground mb-4">Start mapping connections by adding entities</p>
            <Button>Add First Entity</Button>
          </Card>
        )}
      </div>
    </div>
  )
}
