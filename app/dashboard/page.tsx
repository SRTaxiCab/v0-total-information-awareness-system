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
    <div className="flex h-screen bg-background">
      <ProjectSidebar projects={projects || []} userId={data.user.id} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader user={data.user} profile={profile} />
        <main className="flex-1 overflow-y-auto p-6">
          <SearchInterface userId={data.user.id} projects={projects || []} />
        </main>
      </div>
      <AIAssistant userId={data.user.id} />
    </div>
  )
}
