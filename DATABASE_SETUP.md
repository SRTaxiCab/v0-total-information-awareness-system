# Database Setup Guide

## Overview

Sentinel requires a PostgreSQL database with specific tables, triggers, and functions. This guide will help you set up your Supabase database.

## Prerequisites

- A Supabase project (create one at [app.supabase.com](https://app.supabase.com))
- Access to the SQL Editor in your Supabase dashboard

## Setup Steps

### Step 1: Access SQL Editor

1. Log in to your Supabase dashboard
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run Migration Scripts

Execute the following scripts **in order**. Each script must complete successfully before running the next one.

#### Script 1: Create Core Tables

**File:** `scripts/001_create_core_tables.sql`

This script creates:
- `profiles` - User profiles
- `projects` - Research projects
- `documents` - All content/documents
- `timeline_events` - Temporal events
- `entities` - People, organizations, locations
- `connections` - Relationships between entities
- `ai_interactions` - AI chat history
- `saved_queries` - Saved searches
- `analysis_sessions` - Analysis history

**How to run:**
1. Copy the entire contents of `scripts/001_create_core_tables.sql`
2. Paste into the SQL Editor
3. Click **Run** or press `Ctrl+Enter`
4. Wait for "Success" message

#### Script 2: Create Triggers

**File:** `scripts/002_create_triggers.sql`

This script creates automated triggers for:
- Updating `updated_at` timestamps
- Creating user profiles on signup
- Maintaining data consistency

**How to run:**
1. Copy the entire contents of `scripts/002_create_triggers.sql`
2. Paste into the SQL Editor
3. Click **Run**
4. Wait for "Success" message

#### Script 3: Create Search Functions

**File:** `scripts/003_create_search_functions.sql`

This script creates:
- Full-text search functions
- Search indexes for performance
- Advanced query capabilities

**How to run:**
1. Copy the entire contents of `scripts/003_create_search_functions.sql`
2. Paste into the SQL Editor
3. Click **Run**
4. Wait for "Success" message

### Step 3: Verify Setup

After running all scripts, verify your setup:

1. Go to **Table Editor** in Supabase
2. You should see these tables:
   - profiles
   - projects
   - documents
   - timeline_events
   - entities
   - connections
   - ai_interactions
   - saved_queries
   - analysis_sessions

3. Check that Row Level Security (RLS) is enabled:
   - Click on any table
   - Look for the RLS badge (should show "Enabled")

### Step 4: Test Authentication

1. Go to **Authentication** → **Policies** in Supabase
2. Verify that policies exist for each table
3. These policies ensure users can only access their own data

## Database Schema Overview

### Core Tables

#### profiles
Stores user profile information
- `id` (UUID, primary key)
- `email` (text)
- `full_name` (text)
- `avatar_url` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### projects
Research projects for organizing work
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key)
- `title` (text)
- `description` (text)
- `color` (text)
- `status` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### documents
All ingested content
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key)
- `project_id` (UUID, foreign key)
- `title` (text)
- `content` (text)
- `content_type` (text)
- `source_url` (text)
- `tags` (text array)
- `metadata` (jsonb)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### timeline_events
Temporal events for timeline visualization
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key)
- `project_id` (UUID, foreign key)
- `title` (text)
- `description` (text)
- `event_date` (timestamp)
- `event_type` (text)
- `related_documents` (UUID array)
- `related_entities` (UUID array)
- `created_at` (timestamp)

#### entities
People, organizations, locations, concepts
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key)
- `project_id` (UUID, foreign key)
- `name` (text)
- `entity_type` (text)
- `description` (text)
- `aliases` (text array)
- `metadata` (jsonb)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### connections
Relationships between entities and documents
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key)
- `project_id` (UUID, foreign key)
- `source_id` (UUID)
- `source_type` (text)
- `target_id` (UUID)
- `target_type` (text)
- `connection_type` (text)
- `strength` (integer)
- `description` (text)
- `created_at` (timestamp)

## Row Level Security (RLS)

All tables have RLS policies that ensure:
- Users can only read their own data
- Users can only insert/update/delete their own data
- Data isolation between users

## Troubleshooting

### Script Execution Errors

**Error: "relation already exists"**
- The table already exists. You can skip this script or drop the table first.

**Error: "permission denied"**
- Ensure you're logged in as the project owner
- Check that you have the correct permissions

**Error: "syntax error"**
- Ensure you copied the entire script
- Check for any missing characters

### Missing Tables

If tables are missing after running scripts:
1. Check the SQL Editor for error messages
2. Re-run the script that creates the missing table
3. Verify you're in the correct Supabase project

### RLS Issues

If you can't access data after authentication:
1. Go to **Authentication** → **Policies**
2. Verify policies exist for the table
3. Check that policies allow SELECT, INSERT, UPDATE, DELETE
4. Ensure the policy uses `auth.uid()` correctly

### Performance Issues

If queries are slow:
1. Verify indexes were created (Script 3)
2. Check the **Database** → **Indexes** section
3. Consider adding custom indexes for your use case

## Advanced Configuration

### Custom Indexes

For better performance with large datasets:

```sql
-- Index for document search
CREATE INDEX idx_documents_content_search 
ON documents USING gin(to_tsvector('english', content));

-- Index for entity lookups
CREATE INDEX idx_entities_name 
ON entities(name);

-- Index for timeline queries
CREATE INDEX idx_timeline_events_date 
ON timeline_events(event_date DESC);
```

### Backup and Restore

Supabase automatically backs up your database. To create manual backups:

1. Go to **Database** → **Backups**
2. Click **Create Backup**
3. Download the backup file

## Next Steps

After completing database setup:

1. Update your `.env.local` file with Supabase credentials
2. Start the application: `pnpm run dev`
3. Create your first user account
4. Start using Sentinel!

## Support

If you encounter issues:
- Check Supabase logs in the dashboard
- Review the SQL scripts for errors
- Consult the [Supabase documentation](https://supabase.com/docs)
- Open an issue on GitHub

---

Your database is now ready for Sentinel! 🎉
