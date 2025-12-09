# Sentinel Setup Checklist

Use this checklist to ensure your Sentinel platform is fully configured and ready to use.

## ✅ Completed

- [x] Install Node.js dependencies
- [x] Configure TypeScript
- [x] Build application successfully
- [x] Start development server
- [x] Create environment file templates

## 🔧 Configuration Required

### 1. Environment Variables

- [ ] Get Supabase Project URL
  - Go to: https://app.supabase.com
  - Navigate to: Settings → API
  - Copy: Project URL
  - Paste into `.env.local` as `NEXT_PUBLIC_SUPABASE_URL`

- [ ] Get Supabase Anon Key
  - Same location as above
  - Copy: anon/public key
  - Paste into `.env.local` as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

- [ ] Get OpenAI API Key
  - Go to: https://platform.openai.com/api-keys
  - Create new key
  - Paste into `.env.local` as `OPENAI_API_KEY`

### 2. Database Setup

- [ ] Run `scripts/001_create_core_tables.sql` in Supabase SQL Editor
- [ ] Run `scripts/002_create_triggers.sql` in Supabase SQL Editor
- [ ] Run `scripts/003_create_search_functions.sql` in Supabase SQL Editor
- [ ] Verify all tables exist in Table Editor
- [ ] Verify RLS is enabled on all tables

### 3. Application Testing

- [ ] Open http://localhost:3000 in browser
- [ ] Landing page loads without errors
- [ ] Click "Sign Up" and create test account
- [ ] Verify email confirmation (if enabled)
- [ ] Log in successfully
- [ ] Dashboard loads correctly
- [ ] Create a test project
- [ ] Test document upload/ingestion
- [ ] Test AI assistant (requires OpenAI key)
- [ ] Test timeline view
- [ ] Test connections view
- [ ] Test entity registry
- [ ] Test search functionality

## 📋 Optional Enhancements

- [ ] Set up custom domain
- [ ] Configure email templates in Supabase
- [ ] Enable social authentication (Google, GitHub, etc.)
- [ ] Set up monitoring and analytics
- [ ] Configure backup strategy
- [ ] Set up CI/CD pipeline
- [ ] Add custom branding/logo
- [ ] Configure rate limiting
- [ ] Set up error tracking (Sentry, etc.)

## 🚀 Deployment

### Vercel (Recommended)

- [ ] Push code to GitHub
- [ ] Connect repository to Vercel
- [ ] Add environment variables in Vercel dashboard
- [ ] Deploy to production
- [ ] Test production deployment
- [ ] Configure custom domain (optional)

### Other Platforms

- [ ] Choose deployment platform
- [ ] Configure build settings
- [ ] Add environment variables
- [ ] Deploy application
- [ ] Test production deployment

## 📚 Documentation Review

- [ ] Read [README.md](./README.md) - Project overview
- [ ] Read [SETUP.md](./SETUP.md) - Setup instructions
- [ ] Read [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Database guide
- [ ] Read [DOCUMENTATION.md](./DOCUMENTATION.md) - User guide

## 🔒 Security Checklist

- [ ] Verify `.env.local` is in `.gitignore`
- [ ] Confirm RLS policies are active
- [ ] Test that users can't access other users' data
- [ ] Review API endpoint security
- [ ] Enable 2FA on Supabase account
- [ ] Enable 2FA on OpenAI account
- [ ] Set up API key rotation schedule
- [ ] Review Supabase security settings

## 🎯 Ready to Use!

Once all items in "Configuration Required" are checked:

✅ Your Sentinel platform is ready for production use!

## Need Help?

- 📖 Check [SETUP.md](./SETUP.md) for detailed instructions
- 🗄️ Check [DATABASE_SETUP.md](./DATABASE_SETUP.md) for database issues
- 📚 Check [DOCUMENTATION.md](./DOCUMENTATION.md) for usage guide
- 🐛 Open an issue on GitHub for bugs
- 💬 Check Supabase documentation for database questions

---

**Current Status:** Development server running at http://localhost:3000

**Next Step:** Configure environment variables in `.env.local`
