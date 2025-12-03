import { createClient } from "@/lib/supabase/server"

export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { data: projects, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return new Response("Failed to fetch projects", { status: 500 })
    }

    return Response.json({ projects })
  } catch (error) {
    console.error("Projects GET Error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { name, description, color } = await req.json()

    if (!name) {
      return new Response("Project name is required", { status: 400 })
    }

    const { data: project, error } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        name,
        description: description || null,
        color: color || "#3b82f6",
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return new Response("Failed to create project", { status: 500 })
    }

    return Response.json({ project })
  } catch (error) {
    console.error("Projects POST Error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { id, name, description, color } = await req.json()

    if (!id) {
      return new Response("Project ID is required", { status: 400 })
    }

    const updates: any = { updated_at: new Date().toISOString() }
    if (name) updates.name = name
    if (description !== undefined) updates.description = description
    if (color) updates.color = color

    const { data: project, error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return new Response("Failed to update project", { status: 500 })
    }

    return Response.json({ project })
  } catch (error) {
    console.error("Projects PATCH Error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return new Response("Project ID is required", { status: 400 })
    }

    const { error } = await supabase.from("projects").delete().eq("id", id).eq("user_id", user.id)

    if (error) {
      console.error("Database error:", error)
      return new Response("Failed to delete project", { status: 500 })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error("Projects DELETE Error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
