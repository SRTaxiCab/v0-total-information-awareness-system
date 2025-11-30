import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SettingsView } from "@/components/settings-view"

export default async function SettingsPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return <SettingsView user={user} profile={profile} />
}
