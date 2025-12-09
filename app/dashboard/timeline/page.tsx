import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TimelineView } from "@/components/timeline-view"

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Timeline</h1>
        <p className="text-muted-foreground">Visualize events chronologically</p>
      </div>
      <TimelineView userId={data.user.id} projects={projects || []} initialEvents={events || []} />
    </div>
  )
}
