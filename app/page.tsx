import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-primary" />
            <span className="text-xl font-semibold">Sentinel</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="container flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-8 py-20 text-center">
          <div className="max-w-3xl space-y-4">
            <h1 className="text-balance text-5xl font-bold tracking-tight md:text-6xl">
              Total Information Awareness for Research Intelligence
            </h1>
            <p className="text-pretty text-xl text-muted-foreground">
              Advanced platform for journalists, researchers, OSINT specialists, archivists, historians, and
              intelligence agencies. Search, analyze, connect, and discover insights across all information formats.
            </p>
          </div>

          <div className="flex gap-4">
            <Link href="/auth/sign-up">
              <Button size="lg">Start Researching</Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline">
                Login
              </Button>
            </Link>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="space-y-2">
              <div className="mx-auto h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl">
                🔍
              </div>
              <h3 className="font-semibold">Multi-Format Search</h3>
              <p className="text-sm text-muted-foreground">
                Query across documents, media, timelines, and entities with intelligent semantic search
              </p>
            </div>
            <div className="space-y-2">
              <div className="mx-auto h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl">
                🧠
              </div>
              <h3 className="font-semibold">AI-Powered Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Discover hidden patterns, connections, and insights with integrated artificial intelligence
              </p>
            </div>
            <div className="space-y-2">
              <div className="mx-auto h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl">
                📊
              </div>
              <h3 className="font-semibold">Timeline Mapping</h3>
              <p className="text-sm text-muted-foreground">
                Visualize events, track convergence points, and map temporal relationships
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
