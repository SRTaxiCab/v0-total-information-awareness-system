# Sentinel Platform Documentation

## User Guide

### Getting Started

1. **Sign Up**: Create an account using email and password
2. **Create a Project**: Organize your research into projects
3. **Ingest Content**: Add documents via upload, URL, or manual entry
4. **Search & Analyze**: Use the search interface to find information
5. **Build Timelines**: Map events chronologically
6. **Discover Connections**: Visualize relationships between entities

### Dashboard Overview

The main dashboard provides quick access to:
- Document search and filtering
- Recent documents
- Project list
- Quick actions (ingest, analyze, export)

### Search Interface

**Basic Search**
- Enter keywords in the search bar
- Results show matching documents with highlights
- Click on any result to view full document

**Advanced Filters**
- Filter by content type (article, email, report, etc.)
- Filter by date range
- Filter by project
- Filter by tags
- Combine multiple filters for precise results

**Saved Queries**
- Save frequently used search combinations
- Access saved queries from the sidebar
- Share queries with team members (future feature)

### Content Ingestion

**Upload Files**
- Drag and drop or click to select files
- Supported formats: PDF, TXT, DOC, DOCX, images
- Automatically extracts metadata
- Assign to project and add tags

**Import from URL**
- Paste any web URL
- System scrapes and stores content
- Preserves source attribution
- Automatically detects content type

**Manual Entry**
- Directly type or paste content
- Useful for notes, transcripts, etc.
- Add custom metadata
- Rich text formatting supported

### AI Assistant

**Chat Interface**
- Ask questions about your research
- Get summaries of documents
- Request analysis of patterns
- Receive research suggestions

**Analysis Tools**
- Entity Extraction: Automatically identify people, organizations, locations
- Connection Finding: Discover relationships between documents
- Timeline Building: Extract dates and events
- Summarization: Generate document summaries

**Best Practices**
- Be specific in your questions
- Reference document titles when relevant
- Use analysis tools before manual review
- Review AI suggestions critically

### Timeline Creation

**Adding Events**
- Click "Add Event" button
- Enter date, title, and description
- Link to relevant documents
- Assign type (event, meeting, publication, etc.)

**Timeline Views**
- Chronological: Linear timeline view
- Grouped: Events grouped by time period
- List: Simple list view with filters

**Timeline Features**
- Zoom in/out for different time scales
- Filter by event type
- Search within timeline
- Export timeline data

### Entity Management

**Entity Types**
- People: Individuals mentioned in research
- Organizations: Companies, agencies, groups
- Locations: Places, addresses, regions
- Concepts: Ideas, topics, themes
- Events: Specific occurrences

**Entity Features**
- View all documents mentioning entity
- See connections to other entities
- Track entity relationships
- Edit entity information

### Connection Mapping

**Creating Connections**
- Link documents to documents
- Link documents to entities
- Link entities to entities
- Specify connection type and strength

**Connection Types**
- Related: General relationship
- References: One cites the other
- Contradicts: Conflicting information
- Supports: Corroborating evidence
- Custom types available

**Visualization**
- Network graph view
- Node size indicates importance
- Edge thickness shows strength
- Color coding by type

### Archive & Export

**Archive View**
- Browse all documents
- Filter by project, status, date
- Bulk operations
- Document statistics

**Export Options**
- JSON: Complete data export
- CSV: Spreadsheet format
- Markdown: Readable text format
- Select specific documents or all

**Batch Operations**
- Select multiple documents
- Bulk tag assignment
- Bulk project assignment
- Bulk deletion

## Developer Guide

### Architecture Overview

Sentinel is built on a modern stack:
- **Frontend**: Next.js 16 with React Server Components
- **Backend**: Next.js API routes
- **Database**: Supabase (PostgreSQL)
- **AI**: Vercel AI SDK

### Database Schema

**Core Tables**
- `profiles`: User profiles
- `projects`: Research projects
- `documents`: All content
- `timeline_events`: Temporal events
- `entities`: People, places, organizations
- `connections`: Relationships
- `ai_interactions`: AI chat history
- `saved_queries`: Saved searches
- `analysis_sessions`: Analysis history

### API Reference

**Authentication**
All API endpoints require authentication via Supabase Auth.

**AI Chat**
\`\`\`typescript
POST /api/ai/chat
Body: {
  message: string
  projectId?: string
  documentIds?: string[]
}
Response: {
  response: string
  suggestions?: string[]
}
\`\`\`

**Document Analysis**
\`\`\`typescript
POST /api/ai/analyze
Body: {
  documentId: string
  analysisType: 'entities' | 'connections' | 'timeline' | 'summary' | 'full'
}
Response: {
  entities?: Entity[]
  connections?: Connection[]
  events?: TimelineEvent[]
  summary?: string
}
\`\`\`

**Content Ingestion**
\`\`\`typescript
POST /api/ingest/upload
Body: FormData with file
Response: {
  documentId: string
  title: string
}

POST /api/ingest/url
Body: {
  url: string
  projectId?: string
  tags?: string[]
}
Response: {
  documentId: string
  title: string
  content: string
}
\`\`\`

### Component Library

The platform uses shadcn/ui components. All components are fully typed with TypeScript and support dark mode.

**Key Components**
- `SearchInterface`: Main search UI
- `AIAssistant`: AI chat interface
- `TimelineView`: Timeline visualization
- `ConnectionsView`: Network graph
- `DocumentViewer`: Full document display
- `ProjectSidebar`: Navigation sidebar

### Extending the Platform

**Adding New Content Types**
1. Update `content_type` enum in database
2. Add processing logic in ingestion endpoints
3. Update UI filters

**Custom Analysis**
1. Create new endpoint in `/api/ai/`
2. Implement analysis logic
3. Add UI trigger in components

**New Visualizations**
1. Create component in `/components/`
2. Add database queries as needed
3. Integrate into dashboard

## Best Practices

### For Researchers

1. **Organize with Projects**: Create separate projects for different investigations
2. **Tag Consistently**: Use standardized tags across your research
3. **Document Sources**: Always include source URLs when ingesting
4. **Regular Backups**: Export your data periodically
5. **Review AI Output**: Always verify AI-generated insights

### For Developers

1. **Type Safety**: Use TypeScript types throughout
2. **RLS Policies**: Ensure all queries respect Row Level Security
3. **Error Handling**: Implement comprehensive error handling
4. **Performance**: Use React Server Components for data fetching
5. **Testing**: Test all new features thoroughly

## Troubleshooting

### Common Issues

**Search Not Working**
- Check database indexes are created
- Verify RLS policies allow read access
- Ensure search function is defined

**AI Assistant Slow**
- Large context can slow responses
- Consider limiting document scope
- Use caching where possible

**Upload Failures**
- Check file size limits
- Verify file format support
- Ensure network connectivity

**Authentication Issues**
- Verify Supabase credentials
- Check email confirmation
- Reset password if needed

## FAQ

**Q: How much data can I store?**
A: Depends on your Supabase plan. Free tier provides 500MB.

**Q: Can I collaborate with others?**
A: Team features are planned for future release.

**Q: Is my data encrypted?**
A: Yes, all connections use TLS and data is encrypted at rest.

**Q: Can I use my own AI models?**
A: Currently uses OpenAI via Vercel AI SDK. Custom models support planned.

**Q: How do I delete my account?**
A: Go to Settings > Data > Delete Account

## Glossary

- **Entity**: A person, organization, location, or concept tracked in research
- **Connection**: A relationship between documents or entities
- **Project**: A collection of related documents and research
- **Timeline**: A chronological sequence of events
- **Ingestion**: The process of adding content to the platform
- **Analysis Session**: A saved AI analysis workflow
- **RLS**: Row Level Security - database security feature

---

For additional support, please refer to the README or open an issue on GitHub.
