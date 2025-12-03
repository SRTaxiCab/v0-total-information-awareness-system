import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { title, content, contentType, projectId, tags, sourceUrl } = await req.json()

    if (!title || !content) {
      return new Response('Title and content are required', { status: 400 })
    }

    // Insert document
    const { data: document, error: insertError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        project_id: projectId || null,
        title,
        content: content.substring(0, 50000),
        content_type: contentType || 'note',
        source_url: sourceUrl || null,
        source_type: 'manual',
        tags: tags || [],
        metadata: {
          createdManually: true,
          contentLength: content.length,
        },
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return new Response('Failed to save document', { status: 500 })
    }

    return Response.json({
      documentId: document.id,
      title: document.title,
      contentType: document.content_type,
    })
  } catch (error) {
    console.error('Text ingestion error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
