"use client"

import { useState } from "react"
import { ChevronRight, Database, Clock, Network, Users, Upload, Archive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { Project } from "@/lib/types/database"
import Link from "next/link"
import { CreateProjectDialog } from "@/components/create-project-dialog"

interface ProjectSidebarProps {
  projects: Project[]
  userId: string
}

export function ProjectSidebar({ projects, userId }: ProjectSidebarProps) {
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  return (
    <aside className="w-64 border-r bg-card flex flex-col">
      <div className="p-4 border-b">
        <CreateProjectDialog />
      </div>

      <nav className="p-3 space-y-1 border-b">
        <Link href="/dashboard">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Database className="h-4 w-4" />
            All Documents
          </Button>
        </Link>
        <Link href="/dashboard/entities">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Users className="h-4 w-4" />
            Entities
          </Button>
        </Link>
        <Link href="/dashboard/ingest">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Upload className="h-4 w-4" />
            Ingest
          </Button>
        </Link>
        <Link href="/dashboard/timeline">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Clock className="h-4 w-4" />
            Timeline
          </Button>
        </Link>
        <Link href="/dashboard/connections">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Network className="h-4 w-4" />
            Connections
          </Button>
        </Link>
        <Link href="/dashboard/archive">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Archive className="h-4 w-4" />
            Archive
          </Button>
        </Link>
      </nav>

      <div className="p-3 flex-1">
        <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Projects</h3>
        <ScrollArea className="h-full">
          <div className="space-y-1">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => setSelectedProject(project.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                  selectedProject === project.id ? "bg-primary text-primary-foreground" : "hover:bg-accent",
                )}
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
                <span className="flex-1 text-left truncate">{project.title}</span>
                <ChevronRight className="h-4 w-4 opacity-50" />
              </button>
            ))}
            {projects.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No projects yet</p>}
          </div>
        </ScrollArea>
      </div>
    </aside>
  )
}
