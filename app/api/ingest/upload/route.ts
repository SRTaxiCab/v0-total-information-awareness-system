import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const projectId = formData.get('projectId') as string | null
    const tags = formData.get('tags') as string | null

    if (!file) {
      return new Response('File is required', { status: 400 })
    }

    // Read file content
    const buffer = await file.arrayBuffer()
    const content = Buffer.from(buffer).toString('utf-8')

    // Determine content type based on file extension
    const extension = file.name.split('.').pop()?.toLowerCase()
    let contentType = 'document'
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      contentType = 'image'
    } else if (['mp4', 'mov', 'avi'].includes(extension || '')) {
      contentType = 'video'
    } else if (['mp3', 'wav', 'ogg'].includes(extension || '')) {
      contentType = 'audio'
    } else if (['pdf', 'doc', 'docx'].includes(extension || '')) {
      contentType = 'document'
    } else if (['txt', 'md'].includes(extension || '')) {
      contentType = 'note'
    }

    // Insert document
    const { data: document, error: insertError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        project_id: projectId,
        title: file.name,
        content: content.substring(0, 50000), // Limit content size
        content_type: contentType,
        source_type: 'upload',
        tags: tags ? tags.split(',').map((t) => t.trim()) : [],
        metadata: {
          filename: file.name,
          size: file.size,
          type: file.type,
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
    console.error('Upload error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
