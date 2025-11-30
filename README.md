# Sentinel - Total Information Awareness Platform

A comprehensive research intelligence platform designed for journalists, researchers, OSINT specialists, archivists, historians, and intelligence agencies. Built with Next.js 16, React 19, Supabase, and the Vercel AI SDK.

## Features

### Core Capabilities

- **Advanced Search & Query System**
  - Full-text search across all documents
  - Advanced filtering by content type, tags, projects, and dates
  - Save and reuse complex queries
  - Real-time search results

- **AI-Powered Analysis**
  - Integrated AI assistant for research guidance
  - Automated entity extraction (people, organizations, locations)
  - Pattern detection and connection discovery
  - Document summarization and analysis
  - Contextual research suggestions

- **Timeline Visualization**
  - Create and manage temporal event sequences
  - Multiple view modes (chronological, grouped, list)
  - Event linking to documents and entities
  - Timeline convergence mapping

- **Connection Mapping**
  - Visualize relationships between entities
  - Network graph view of connections
  - Strength-based relationship scoring
  - Discover hidden patterns and associations

- **Multi-Format Content Ingestion**
  - File upload support (PDF, TXT, images, documents)
  - URL/web scraping capability
  - Manual text entry
  - Automatic metadata extraction

- **Entity Registry**
  - Track people, organizations, locations, concepts, and events
  - Entity relationship management
  - Cross-reference with documents
  - Entity statistics and analytics

- **Archive & Retrieval**
  - Comprehensive document management
  - Analysis session tracking
  - Batch operations and export
  - Advanced filtering and search

### Project Management

- Organize research into projects
- Color-coded project identification
- Project-specific filtering across all views
- Project statistics and insights

### Data Security

- Row Level Security (RLS) on all tables
- User authentication with Supabase Auth
- Secure API endpoints
- Privacy-first architecture

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19 with Server Components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: Vercel AI SDK with GPT-4
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ 
- Supabase account
- Vercel account (optional, for deployment)

### Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Set up environment variables (see `.env.example`)

4. Run database migrations:
   - Execute scripts in `/scripts` folder in order
   - These create tables, triggers, and functions

5. Start development server:
   \`\`\`bash
   npm run dev
   \`\`\`

6. Open [http://localhost:3000](http://localhost:3000)

### Database Setup

The platform requires the following SQL scripts to be run in order:

1. `001_create_core_tables.sql` - Creates all database tables
2. `002_create_triggers.sql` - Sets up automated triggers
3. `003_create_search_functions.sql` - Enables full-text search

All scripts include Row Level Security (RLS) policies to ensure data privacy.

## Project Structure

\`\`\`
├── app/
│   ├── api/                  # API routes
│   │   ├── ai/              # AI endpoints (chat, analyze, suggest)
│   │   ├── ingest/          # Content ingestion endpoints
│   │   ├── export/          # Data export functionality
│   │   └── projects/        # Project management
│   ├── auth/                # Authentication pages
│   ├── dashboard/           # Main application views
│   │   ├── archive/         # Document archive
│   │   ├── connections/     # Connection mapping
│   │   ├── document/[id]/   # Document viewer
│   │   ├── entities/        # Entity registry
│   │   ├── ingest/          # Content ingestion UI
│   │   ├── settings/        # User settings
│   │   └── timeline/        # Timeline visualization
│   └── page.tsx             # Landing page
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   └── [feature-components] # Feature-specific components
├── lib/
│   ├── supabase/           # Supabase client setup
│   ├── types/              # TypeScript types
│   └── utils/              # Utility functions
└── scripts/                # Database migration scripts
\`\`\`

## Key Features Explained

### Search System
The search interface provides full-text search with PostgreSQL's powerful text search capabilities. Saved queries allow researchers to quickly re-run complex searches without rebuilding filters.

### AI Assistant
The integrated AI assistant helps researchers by:
- Answering questions about documents
- Extracting key information
- Finding connections between sources
- Suggesting research directions
- Analyzing document patterns

### Timeline Mapping
Timelines help visualize chronological sequences of events, making it easier to understand cause-and-effect relationships and identify temporal patterns in research.

### Entity System
The entity registry tracks all people, organizations, locations, and concepts mentioned across documents, enabling cross-referencing and relationship discovery.

### Connection Discovery
Automatically and manually create connections between documents, entities, and events. The system can suggest potential connections based on content analysis.

## API Endpoints

### AI Endpoints
- `POST /api/ai/chat` - Chat with AI assistant
- `POST /api/ai/analyze` - Analyze documents
- `POST /api/ai/suggest` - Get research suggestions

### Ingestion Endpoints
- `POST /api/ingest/upload` - Upload files
- `POST /api/ingest/url` - Ingest from URL
- `POST /api/ingest/text` - Manual text entry

### Data Management
- `POST /api/export` - Export data (JSON, CSV, Markdown)
- `GET/POST /api/projects` - Project management

## Security Considerations

This platform handles potentially sensitive research data. Security measures include:

- Row Level Security (RLS) on all database tables
- User authentication required for all operations
- Secure API endpoints with user verification
- No client-side storage of sensitive data
- Encrypted database connections

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

## Roadmap

Future enhancements planned:

- [ ] Advanced NLP for entity extraction
- [ ] Multi-language support
- [ ] Collaborative features (team workspaces)
- [ ] Advanced visualization options
- [ ] API integrations (social media, news sources)
- [ ] Mobile application
- [ ] Advanced export formats
- [ ] Automated report generation

## Acknowledgments

Built with:
- Next.js by Vercel
- Supabase for database and authentication
- OpenAI for AI capabilities
- shadcn/ui for beautiful components
- The open source community

---

**Sentinel** - Bringing clarity to complex information through intelligent analysis.
