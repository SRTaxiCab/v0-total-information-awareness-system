"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Building, MapPin, Tag, Search, Plus, TrendingUp } from "lucide-react"
import Link from "next/link"

interface EntitiesViewProps {
  initialEntities: any[]
  projects: any[]
}

export function EntitiesView({ initialEntities, projects }: EntitiesViewProps) {
  const [entities, setEntities] = useState(initialEntities)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")

  const getEntityIcon = (type: string) => {
    switch (type) {
      case "person":
        return <Users className="h-5 w-5" />
      case "organization":
        return <Building className="h-5 w-5" />
      case "location":
        return <MapPin className="h-5 w-5" />
      default:
        return <Tag className="h-5 w-5" />
    }
  }

  const getEntityColor = (type: string) => {
    switch (type) {
      case "person":
        return "text-blue-500"
      case "organization":
        return "text-purple-500"
      case "location":
        return "text-green-500"
      default:
        return "text-orange-500"
    }
  }

  const filteredEntities = entities.filter((entity) => {
    const matchesSearch =
      entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entity.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || entity.entity_type === typeFilter
    return matchesSearch && matchesType
  })

  const entityStats = {
    total: entities.length,
    people: entities.filter((e) => e.entity_type === "person").length,
    organizations: entities.filter((e) => e.entity_type === "organization").length,
    locations: entities.filter((e) => e.entity_type === "location").length,
    concepts: entities.filter((e) => e.entity_type === "concept").length,
  }

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Entity Registry</h1>
          <p className="text-muted-foreground mt-1">Track people, organizations, locations, and concepts</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Entity
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold text-foreground">{entityStats.total}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">People</p>
              <p className="text-2xl font-bold text-blue-500">{entityStats.people}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Organizations</p>
              <p className="text-2xl font-bold text-purple-500">{entityStats.organizations}</p>
            </div>
            <Building className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Locations</p>
              <p className="text-2xl font-bold text-green-500">{entityStats.locations}</p>
            </div>
            <MapPin className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Concepts</p>
              <p className="text-2xl font-bold text-orange-500">{entityStats.concepts}</p>
            </div>
            <Tag className="h-8 w-8 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search entities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="person">People</SelectItem>
            <SelectItem value="organization">Organizations</SelectItem>
            <SelectItem value="location">Locations</SelectItem>
            <SelectItem value="concept">Concepts</SelectItem>
            <SelectItem value="event">Events</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Entity Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredEntities.map((entity) => (
          <Link key={entity.id} href={`/dashboard/entity/${entity.id}`}>
            <Card className="p-6 hover:bg-accent transition-colors cursor-pointer h-full">
              <div className="flex items-start gap-4">
                <div className={`${getEntityColor(entity.entity_type)}`}>{getEntityIcon(entity.entity_type)}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{entity.name}</h3>
                  <Badge variant="outline" className="mt-1">
                    {entity.entity_type}
                  </Badge>
                  {entity.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{entity.description}</p>
                  )}
                  {entity.metadata?.role && (
                    <p className="text-xs text-muted-foreground mt-2">Role: {entity.metadata.role}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span>{entity.mentioned_in_documents?.length || 0} documents</span>
                    <span>{entity.related_entities?.length || 0} connections</span>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {filteredEntities.length === 0 && (
        <Card className="p-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No entities found</h3>
          <p className="text-muted-foreground mb-6">Start by adding entities or adjust your filters</p>
        </Card>
      )}
    </div>
  )
}
