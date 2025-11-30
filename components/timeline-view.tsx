"use client"

import { useState, useMemo } from "react"
import { Calendar, Plus, MapPin, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { TimelineEvent } from "./timeline-event"
import { AddEventDialog } from "./add-event-dialog"
import type { Project, TimelineEvent as TimelineEventType } from "@/lib/types/database"

interface TimelineViewProps {
  userId: string
  projects: Project[]
  initialEvents: TimelineEventType[]
}

type ViewMode = "chronological" | "grouped" | "compact"
type TimeFilter = "all" | "year" | "month" | "custom"

export function TimelineView({ userId, projects, initialEvents }: TimelineViewProps) {
  const [events, setEvents] = useState<TimelineEventType[]>(initialEvents)
  const [selectedProject, setSelectedProject] = useState<string>("all")
  const [viewMode, setViewMode] = useState<ViewMode>("chronological")
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  // Filter events by project
  const filteredEvents = useMemo(() => {
    return events.filter((event) => selectedProject === "all" || event.project_id === selectedProject)
  }, [events, selectedProject])

  // Group events by year and month
  const groupedEvents = useMemo(() => {
    const groups: Record<string, TimelineEventType[]> = {}

    filteredEvents.forEach((event) => {
      const date = new Date(event.event_date)
      const key =
        viewMode === "grouped"
          ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
          : date.getFullYear().toString()

      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(event)
    })

    return groups
  }, [filteredEvents, viewMode])

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey)
      } else {
        newSet.add(groupKey)
      }
      return newSet
    })
  }

  const formatGroupTitle = (groupKey: string) => {
    const [year, month] = groupKey.split("-")
    if (month) {
      const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      })
    }
    return year
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Timeline</h1>
          <p className="text-muted-foreground">Visualize and analyze events chronologically</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Event
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

        <Select value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="chronological">Chronological</SelectItem>
            <SelectItem value="grouped">Grouped by Month</SelectItem>
            <SelectItem value="compact">Compact View</SelectItem>
          </SelectContent>
        </Select>

        <Badge variant="secondary" className="gap-2">
          <Calendar className="h-3 w-3" />
          {filteredEvents.length} events
        </Badge>
      </div>

      {viewMode === "chronological" ? (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-6">
            {filteredEvents.map((event, index) => (
              <TimelineEvent
                key={event.id}
                event={event}
                isFirst={index === 0}
                isLast={index === filteredEvents.length - 1}
              />
            ))}

            {filteredEvents.length === 0 && (
              <Card className="p-12 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No events yet</h3>
                <p className="text-muted-foreground mb-4">Start building your timeline by adding events</p>
                <Button onClick={() => setShowAddDialog(true)}>Add First Event</Button>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.keys(groupedEvents)
            .sort()
            .reverse()
            .map((groupKey) => {
              const isExpanded = expandedGroups.has(groupKey)
              const groupEvents = groupedEvents[groupKey]

              return (
                <Card key={groupKey}>
                  <CardHeader className="cursor-pointer" onClick={() => toggleGroup(groupKey)}>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{formatGroupTitle(groupKey)}</CardTitle>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">{groupEvents.length} events</Badge>
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                    </div>
                  </CardHeader>
                  {isExpanded && (
                    <CardContent>
                      <div className="space-y-3">
                        {groupEvents.map((event) => (
                          <div key={event.id} className="p-4 rounded-lg border hover:bg-accent transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold">{event.title}</h4>
                                  {event.event_type && <Badge variant="outline">{event.event_type}</Badge>}
                                </div>
                                {event.description && (
                                  <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                                )}
                                {event.location && (
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    {event.location}
                                  </div>
                                )}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {new Date(event.event_date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              )
            })}
        </div>
      )}

      <AddEventDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        userId={userId}
        projects={projects}
        onEventAdded={(event) => setEvents([...events, event])}
      />
    </div>
  )
}
