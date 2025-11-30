import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { EntitiesView } from "@/components/entities-view"

export default async function EntitiesPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: entities } = await supabase.from("entities").select("*").order("created_at", { ascending: false })

  const { data: projects } = await supabase.from("projects").select("id, name, color").order("name")

  return <EntitiesView initialEntities={entities || []} projects={projects || []} />
}
