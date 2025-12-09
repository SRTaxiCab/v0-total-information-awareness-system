import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SearchInterface } from "@/components/search-interface"
import { DashboardHeader } from "@/components/dashboard-header"
import { ProjectSidebar } from "@/components/project-sidebar"
import { AIAssistant } from "@/components/ai-assistant"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", data.user.id)
    .order("updated_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Search and analyze your research documents</p>
      </div>
      <SearchInterface userId={data.user.id} projects={projects || []} />
    </div>
  )
}
