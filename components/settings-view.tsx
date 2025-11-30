"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { User, Bell, Shield, Database, Zap } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface SettingsViewProps {
  user: any
  profile: any
}

export function SettingsView({ user, profile }: SettingsViewProps) {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createBrowserClient()
  const router = useRouter()

  const [settings, setSettings] = useState({
    fullName: profile?.full_name || "",
    email: user.email,
    notifications: true,
    aiAssistance: true,
    autoAnalysis: false,
    darkMode: true,
  })

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: settings.fullName,
        })
        .eq("id", user.id)

      if (error) throw error

      toast({
        title: "Settings saved",
        description: "Your preferences have been updated",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <div className="flex-1 space-y-6 p-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Zap className="h-4 w-4 mr-2" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="data">
            <Database className="h-4 w-4 mr-2" />
            Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={settings.fullName}
                onChange={(e) => setSettings({ ...settings, fullName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={settings.email} disabled />
              <p className="text-sm text-muted-foreground">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label>Account Created</Label>
              <p className="text-sm text-foreground">{new Date(user.created_at).toLocaleDateString()}</p>
            </div>

            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="mt-6">
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>AI Assistance</Label>
                <p className="text-sm text-muted-foreground">Enable AI-powered research suggestions</p>
              </div>
              <Switch
                checked={settings.aiAssistance}
                onCheckedChange={(checked) => setSettings({ ...settings, aiAssistance: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-Analysis</Label>
                <p className="text-sm text-muted-foreground">Automatically analyze new documents</p>
              </div>
              <Switch
                checked={settings.autoAnalysis}
                onCheckedChange={(checked) => setSettings({ ...settings, autoAnalysis: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Use dark theme for the interface</p>
              </div>
              <Switch
                checked={settings.darkMode}
                onCheckedChange={(checked) => setSettings({ ...settings, darkMode: checked })}
              />
            </div>

            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Preferences"}
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive updates via email</p>
              </div>
              <Switch
                checked={settings.notifications}
                onCheckedChange={(checked) => setSettings({ ...settings, notifications: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Analysis Complete</Label>
                <p className="text-sm text-muted-foreground">Notify when AI analysis finishes</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>New Connections Found</Label>
                <p className="text-sm text-muted-foreground">Alert when patterns are discovered</p>
              </div>
              <Switch defaultChecked />
            </div>

            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Notification Settings"}
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Change Password</h3>
              <p className="text-sm text-muted-foreground mb-4">Update your password to keep your account secure</p>
              <Button variant="outline">Change Password</Button>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">Two-Factor Authentication</h3>
              <p className="text-sm text-muted-foreground mb-4">Add an extra layer of security to your account</p>
              <Button variant="outline">Enable 2FA</Button>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-destructive mb-2">Sign Out</h3>
              <p className="text-sm text-muted-foreground mb-4">Sign out from this device</p>
              <Button variant="destructive" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="mt-6">
          <Card className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Export Data</h3>
              <p className="text-sm text-muted-foreground mb-4">Download all your research data</p>
              <div className="flex gap-2">
                <Button variant="outline">Export as JSON</Button>
                <Button variant="outline">Export as CSV</Button>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">Data Usage</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Documents</span>
                  <span className="text-foreground font-medium">{profile?.document_count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Projects</span>
                  <span className="text-foreground font-medium">{profile?.project_count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Storage Used</span>
                  <span className="text-foreground font-medium">--</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-destructive mb-2">Delete Account</h3>
              <p className="text-sm text-muted-foreground mb-4">Permanently delete your account and all data</p>
              <Button variant="destructive">Delete Account</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
