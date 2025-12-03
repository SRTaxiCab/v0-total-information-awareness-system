import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TimelineView } from "@/components/timeline-view"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function TimelinePage() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/auth/login")
  }

  const { data: events } = await supabase
    .from("timeline_events")
    .select("*")
    .eq("user_id", user.id)
    .order("event_date", { ascending: true })

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Timeline</h1>
          <p className="text-muted-foreground">
            Visualize events chronologically and discover temporal patterns
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      <TimelineView events={events || []} userId={user.id} />
    </div>
  )
}
