# Sentinel Platform - Setup Guide

## Quick Start

The application is now **production-ready** and running! Follow these steps to get started:

### 1. Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- An OpenAI API key (for AI features)

### 2. Environment Configuration

The `.env.local` file has been created with placeholder values. You need to replace them with your actual credentials:

```bash
# Edit .env.local and add your credentials:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

#### Getting Supabase Credentials

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Create a new project (or use existing)
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### Getting OpenAI API Key

1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy it to `OPENAI_API_KEY`

### 3. Database Setup

You need to run the SQL migration scripts in your Supabase project:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the scripts in order:
   - `scripts/001_create_core_tables.sql` - Creates all database tables
   - `scripts/002_create_triggers.sql` - Sets up automated triggers
   - `scripts/003_create_search_functions.sql` - Enables full-text search

**Important:** Run each script completely before moving to the next one.

### 4. Start the Application

The development server is already running at:
- **Local:** http://localhost:3000
- **Network:** http://192.168.6.52:3000

If you need to restart it:

```bash
pnpm run dev
```

### 5. Access the Application

1. Open http://localhost:3000 in your browser
2. Click **"Get Started"** or **"Sign Up"**
3. Create an account with email and password
4. Start using the platform!

## Available Scripts

```bash
# Development server
pnpm run dev

# Production build
pnpm run build

# Start production server
pnpm run start

# Run linting
pnpm run lint

# Type checking
npx tsc --noEmit
```

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main application
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── [features]        # Feature components
├── lib/                   # Utilities and helpers
│   ├── supabase/         # Supabase client setup
│   └── types/            # TypeScript types
├── scripts/              # Database migration scripts
└── public/               # Static assets
```

## Features

### Core Capabilities

- **Advanced Search** - Full-text search across all documents
- **AI Assistant** - Integrated AI for research guidance
- **Timeline Visualization** - Create temporal event sequences
- **Connection Mapping** - Visualize entity relationships
- **Multi-Format Ingestion** - Upload files, scrape URLs, manual entry
- **Entity Registry** - Track people, organizations, locations
- **Archive & Retrieval** - Comprehensive document management

### Technology Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19 with Server Components
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **AI:** Vercel AI SDK with OpenAI
- **Styling:** Tailwind CSS v4
- **Components:** shadcn/ui
- **Language:** TypeScript

## Troubleshooting

### Build Issues

If you encounter build errors:

```bash
# Clean and rebuild
rm -rf .next
pnpm run build
```

### Database Connection Issues

1. Verify your Supabase credentials in `.env.local`
2. Ensure your Supabase project is active
3. Check that all SQL scripts have been run

### Authentication Issues

1. Verify Supabase URL and anon key are correct
2. Check that the `profiles` table exists in your database
3. Ensure Row Level Security (RLS) policies are enabled

### AI Features Not Working

1. Verify your OpenAI API key is correct
2. Check that you have credits in your OpenAI account
3. Review API logs in the browser console

## Production Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`
5. Deploy!

### Deploy to Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS Amplify
- Self-hosted with Docker

## Security Notes

- Never commit `.env.local` to version control
- Keep your API keys secure
- Row Level Security (RLS) is enabled on all database tables
- All API routes require authentication

## Next Steps

1. **Create Your First Project** - Organize your research
2. **Ingest Content** - Upload documents or scrape URLs
3. **Use AI Assistant** - Ask questions about your research
4. **Build Timelines** - Map events chronologically
5. **Discover Connections** - Visualize relationships

## Support

For issues or questions:
- Check the [README.md](./README.md) for detailed documentation
- Review [DOCUMENTATION.md](./DOCUMENTATION.md) for user guide
- Open an issue on GitHub

---

**Sentinel** - Your Total Information Awareness Platform is ready to use! 🚀
