"use client"

import { Calendar, MapPin, Tag } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { TimelineEvent as TimelineEventType } from "@/lib/types/database"

interface TimelineEventProps {
  event: TimelineEventType
  isFirst: boolean
  isLast: boolean
}

export function TimelineEvent({ event, isFirst, isLast }: TimelineEventProps) {
  const date = new Date(event.event_date)

  return (
    <div className="relative pl-20">
      {/* Timeline dot */}
      <div className="absolute left-8 top-6 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background z-10" />

      {/* Date badge */}
      <div className="absolute left-0 top-6 -translate-y-1/2">
        <Badge variant="secondary" className="gap-1">
          <Calendar className="h-3 w-3" />
          {date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </Badge>
      </div>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold">{event.title}</h3>
            {event.event_type && <Badge variant="outline">{event.event_type}</Badge>}
          </div>

          {event.description && <p className="text-muted-foreground mb-3">{event.description}</p>}

          <div className="flex items-center gap-4 text-sm">
            {event.location && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {event.location}
              </div>
            )}

            {event.tags && event.tags.length > 0 && (
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <div className="flex gap-1">
                  {event.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {event.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{event.tags.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>

          {event.end_date && (
            <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
              Duration: {date.toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
