# Quick Start: Running Supabase Locally

Your Supabase local environment is now set up! Follow these steps to get started:

## ✅ What's Already Done

- ✅ Docker is installed and running
- ✅ Supabase CLI is installed (v2.58.5)
- ✅ Supabase has been initialized in your project
- ✅ Your database schema has been copied to migrations folder

## 🚀 Next Steps

### 1. Apply Your Database Schema

Run this command to reset the database and apply your schema:

```bash
supabase db reset
```

This will create all your tables (candidates, templates, company_settings) with sample data.

### 2. Create Your Local Environment File

Copy the template to create your local environment file:

```bash
Copy-Item .env.local.template .env.local
```

Or manually create `.env.local` with these contents:

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

### 3. Restart Your Dev Server

Stop your current dev server (Ctrl+C in the terminal running `npm run dev`) and restart it:

```bash
npm run dev
```

Your app will now connect to the local Supabase instance!

## 🎯 Important URLs

- **Your App**: http://localhost:5173 (or whatever port Vite uses)
- **Supabase Studio**: http://localhost:54323 (Database management UI)
- **Email Testing**: http://localhost:54324 (Inbucket - catches all emails)
- **API Endpoint**: http://127.0.0.1:54321

## 📋 Useful Commands

### Check if Supabase is running

```bash
supabase status
```

### Stop Supabase

```bash
supabase stop
```

### Start Supabase again

```bash
supabase start
```

### Reset database (reapply migrations)

```bash
supabase db reset
```

### View logs

```bash
supabase logs
```

## 🔄 Switching Between Local and Remote

### For Local Development

Use `.env.local`:

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### For Production

Use `.env` or `.env.production`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-key
```

## 🎨 Supabase Studio Features

Open http://localhost:54323 to access:

- **Table Editor**: View and edit your data
- **SQL Editor**: Run custom queries
- **Database**: Manage schema and migrations
- **Authentication**: Test auth flows
- **Storage**: Manage file uploads
- **Logs**: Debug your queries

## 💡 Tips

1. **Always run `supabase start` before starting your dev server**
2. **Use Supabase Studio** to inspect your data visually
3. **Test emails** using Inbucket at http://localhost:54324
4. **Keep Docker running** - Supabase needs it
5. **Your data persists** between restarts (unless you use `supabase stop --no-backup`)

## 🐛 Troubleshooting

### Supabase won't start

- Make sure Docker Desktop is running
- Check if ports 54321-54324 are available
- Try `supabase stop` then `supabase start`

### Can't connect to database

- Verify `.env.local` has the correct credentials
- Check that `supabase status` shows services running
- Restart your dev server

### Need to reset everything

```bash
supabase stop --no-backup
supabase start
supabase db reset
```

## 📚 More Information

See [LOCAL_SUPABASE_SETUP.md](./LOCAL_SUPABASE_SETUP.md) for detailed documentation.

---

**You're all set!** Run `supabase db reset` to apply your schema, then start developing! 🎉
