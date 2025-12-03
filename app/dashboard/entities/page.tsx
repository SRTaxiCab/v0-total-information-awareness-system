import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { EntitiesView } from "@/components/entities-view"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function EntitiesPage() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/auth/login")
  }

  const { data: entities } = await supabase
    .from("entities")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Entity Registry</h1>
          <p className="text-muted-foreground">
            Track people, organizations, locations, and concepts across your research
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Entity
        </Button>
      </div>

      <EntitiesView entities={entities || []} userId={user.id} />
    </div>
  )
}
