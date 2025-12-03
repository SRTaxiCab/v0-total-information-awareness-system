import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ConnectionsView } from "@/components/connections-view"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function ConnectionsPage() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/auth/login")
  }

  const { data: connections } = await supabase
    .from("connections")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const { data: entities } = await supabase
    .from("entities")
    .select("id, name, entity_type")
    .eq("user_id", user.id)

  const { data: documents } = await supabase
    .from("documents")
    .select("id, title")
    .eq("user_id", user.id)

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Connection Mapping</h1>
          <p className="text-muted-foreground">
            Visualize relationships and discover hidden patterns
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Connection
        </Button>
      </div>

      <ConnectionsView 
        connections={connections || []} 
        entities={entities || []}
        documents={documents || []}
        userId={user.id} 
      />
    </div>
  )
}
