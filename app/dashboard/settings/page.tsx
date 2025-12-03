import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { ProjectSidebar } from "@/components/project-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default async function SettingsPage() {
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
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground mt-2">Manage your account and preferences</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={data.user.email} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    defaultValue={profile?.full_name || ""}
                    placeholder="Your name"
                  />
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Database Statistics</CardTitle>
                <CardDescription>Overview of your research database</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Projects</p>
                    <p className="text-2xl font-bold">{projects?.length || 0}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Documents</p>
                    <p className="text-2xl font-bold">-</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Entities</p>
                    <p className="text-2xl font-bold">-</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Connections</p>
                    <p className="text-2xl font-bold">-</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Export</CardTitle>
                <CardDescription>Export your research data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Download all your documents, entities, and connections in various formats
                </p>
                <div className="flex gap-2">
                  <Button variant="outline">Export as JSON</Button>
                  <Button variant="outline">Export as CSV</Button>
                  <Button variant="outline">Export as Markdown</Button>
                </div>
              </CardContent>
            </Card>

            <Separator />

            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>Irreversible actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Delete Account</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
