import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { ProjectSidebar } from "@/components/project-sidebar"
import { TimelineView } from "@/components/timeline-view"
import { AIAssistant } from "@/components/ai-assistant"

export default async function TimelinePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", data.user.id)
    .order("updated_at", { ascending: false })

  const { data: events } = await supabase
    .from("timeline_events")
    .select("*")
    .eq("user_id", data.user.id)
    .order("event_date", { ascending: true })

  return (
    <div className="flex h-screen bg-background">
      <ProjectSidebar projects={projects || []} userId={data.user.id} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader user={data.user} />
        <main className="flex-1 overflow-y-auto p-6">
          <TimelineView userId={data.user.id} projects={projects || []} initialEvents={events || []} />
        </main>
      </div>
      <AIAssistant context={{ useDocuments: true }} />
    </div>
  )
}
