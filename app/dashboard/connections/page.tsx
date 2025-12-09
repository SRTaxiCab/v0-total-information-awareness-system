import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ConnectionsView } from "@/components/connections-view"

export default async function ConnectionsPage() {
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

  const { data: entities } = await supabase
    .from("entities")
    .select("*")
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false })

  const { data: connections } = await supabase.from("connections").select("*").eq("user_id", data.user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Connection Mapping</h1>
        <p className="text-muted-foreground">Visualize relationships between entities and documents</p>
      </div>
      <ConnectionsView
        userId={data.user.id}
        projects={projects || []}
        initialEntities={entities || []}
        initialConnections={connections || []}
      />
    </div>
  )
}
