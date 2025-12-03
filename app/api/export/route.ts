import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { format, projectId, documentIds } = await req.json()

    if (!format || !['json', 'csv', 'markdown'].includes(format)) {
      return new Response('Invalid format. Use json, csv, or markdown', { status: 400 })
    }

    // Build query
    let query = supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)

    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    if (documentIds && documentIds.length > 0) {
      query = query.in('id', documentIds)
    }

    const { data: documents, error: fetchError } = await query.order('created_at', { ascending: false })

    if (fetchError) {
      console.error('Fetch error:', fetchError)
      return new Response('Failed to fetch documents', { status: 500 })
    }

    if (!documents || documents.length === 0) {
      return new Response('No documents found', { status: 404 })
    }

    let content: string
    let contentType: string
    let filename: string

    switch (format) {
      case 'json':
        content = JSON.stringify(documents, null, 2)
        contentType = 'application/json'
        filename = `sentinel-export-${Date.now()}.json`
        break

      case 'csv':
        const headers = ['ID', 'Title', 'Content Type', 'Source Type', 'Tags', 'Created At', 'Content']
        const rows = documents.map((doc) => [
          doc.id,
          doc.title,
          doc.content_type,
          doc.source_type,
          doc.tags.join('; '),
          doc.created_at,
          doc.content.replace(/"/g, '""').substring(0, 1000),
        ])
        content = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
        contentType = 'text/csv'
        filename = `sentinel-export-${Date.now()}.csv`
        break

      case 'markdown':
        content = documents
          .map(
            (doc) => `# ${doc.title}

**Type:** ${doc.content_type}  
**Source:** ${doc.source_type}  
**Tags:** ${doc.tags.join(', ')}  
**Created:** ${new Date(doc.created_at).toLocaleDateString()}  
${doc.source_url ? `**URL:** ${doc.source_url}  ` : ''}

---

${doc.content}

---

`
          )
          .join('\n\n')
        contentType = 'text/markdown'
        filename = `sentinel-export-${Date.now()}.md`
        break

      default:
        return new Response('Invalid format', { status: 400 })
    }

    return new Response(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
