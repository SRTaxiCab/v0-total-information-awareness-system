import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { url, projectId, tags } = await req.json()

    if (!url) {
      return new Response('URL is required', { status: 400 })
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return new Response('Invalid URL', { status: 400 })
    }

    // Fetch content from URL
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Sentinel Research Platform/1.0',
      },
    })

    if (!response.ok) {
      return new Response('Failed to fetch URL', { status: 400 })
    }

    const html = await response.text()

    // Basic HTML parsing to extract title and content
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : new URL(url).hostname

    // Remove HTML tags for basic content extraction
    const content = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 50000) // Limit content size

    // Determine content type
    const contentType = response.headers.get('content-type')?.includes('text/html')
      ? 'article'
      : 'document'

    // Insert document
    const { data: document, error: insertError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        project_id: projectId || null,
        title,
        content,
        content_type: contentType,
        source_url: url,
        source_type: 'url',
        tags: tags || [],
        metadata: {
          url,
          fetchedAt: new Date().toISOString(),
          contentType: response.headers.get('content-type'),
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
      content: document.content.substring(0, 500) + '...',
    })
  } catch (error) {
    console.error('URL ingestion error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
