# Running Supabase Locally - Complete Guide

This guide will help you set up and run Supabase locally for the Offer Letter Drafter application.

## Prerequisites

✅ **Docker** - Required to run Supabase services (already installed: Docker version 28.5.2)
✅ **Supabase CLI** - Already installed (version 2.58.5)

## Step-by-Step Setup

### Step 1: Initialize Supabase in Your Project

Run this command to initialize Supabase in your project directory:

```bash
supabase init
```

This will create a `supabase` folder with the necessary configuration files.

### Step 2: Start Supabase Locally

Start all Supabase services (PostgreSQL, Auth, Storage, etc.) with:

```bash
supabase start
```

> **Note**: The first time you run this, it will download Docker images which may take a few minutes.

After starting, you'll see output with important URLs and keys:

```
API URL: http://localhost:54321
GraphQL URL: http://localhost:54321/graphql/v1
DB URL: postgresql://postgres:postgres@localhost:54322/postgres
Studio URL: http://localhost:54323
Inbucket URL: http://localhost:54324
JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Apply Your Database Schema

You have a `supabase-schema.sql` file with your database schema. Apply it to your local database:

```bash
supabase db reset
```

Or manually run the SQL:

```bash
psql postgresql://postgres:postgres@localhost:54322/postgres -f supabase-schema.sql
```

Alternatively, you can:

1. Open Supabase Studio at http://localhost:54323
2. Go to SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Run the query

### Step 4: Update Your Environment Variables

Create or update your `.env` file with the local Supabase credentials:

```env
# Local Supabase Configuration
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=<your-local-anon-key-from-step-2>
```

> **Important**: Replace `<your-local-anon-key-from-step-2>` with the actual `anon key` shown when you ran `supabase start`.

### Step 5: Restart Your Development Server

Stop your current dev server (Ctrl+C) and restart it:

```bash
npm run dev
```

Your application will now connect to the local Supabase instance!

## Useful Commands

### Check Supabase Status

```bash
supabase status
```

### Stop Supabase

```bash
supabase stop
```

### Stop and Remove All Data

```bash
supabase stop --no-backup
```

### Reset Database (Reapply Migrations)

```bash
supabase db reset
```

### Access Supabase Studio

Open your browser to: http://localhost:54323

This is your local Supabase dashboard where you can:

- View and edit tables
- Run SQL queries
- Manage authentication
- View logs
- Test APIs

### View Database Logs

```bash
supabase db logs
```

### Access Local Email Testing (Inbucket)

Open: http://localhost:54324

This catches all emails sent by your local Supabase instance (useful for testing auth emails).

## Migration Workflow

### Creating Migrations

When you make schema changes, create a migration file:

```bash
supabase migration new <migration_name>
```

This creates a new SQL file in `supabase/migrations/` where you can write your schema changes.

### Applying Migrations

```bash
supabase db reset
```

This will apply all migrations in order.

## Switching Between Local and Remote

### For Local Development

Update `.env`:

```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=<local-anon-key>
```

### For Production/Remote

Update `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=<remote-anon-key>
```

> **Tip**: You can create `.env.local` for local development and `.env.production` for production, then copy the appropriate one to `.env` as needed.

## Troubleshooting

### Docker Not Running

Make sure Docker Desktop is running before starting Supabase:

```bash
docker --version
```

### Port Conflicts

If ports 54321-54324 are already in use, you can customize them in `supabase/config.toml`.

### Reset Everything

If something goes wrong, you can completely reset:

```bash
supabase stop --no-backup
supabase start
supabase db reset
```

### Check Logs

View logs for debugging:

```bash
supabase logs
```

## Benefits of Local Development

✅ **Faster Development** - No network latency
✅ **Offline Work** - Work without internet connection
✅ **Free** - No usage limits or costs
✅ **Safe Testing** - Experiment without affecting production data
✅ **Database Migrations** - Test migrations before deploying
✅ **Email Testing** - Test auth emails with Inbucket

## Next Steps

1. Run `supabase init` to initialize
2. Run `supabase start` to start local services
3. Apply your schema using the Studio or CLI
4. Update your `.env` file with local credentials
5. Start developing!

## Additional Resources

- [Supabase Local Development Docs](https://supabase.com/docs/guides/cli/local-development)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli/introduction)
- [Database Migrations Guide](https://supabase.com/docs/guides/cli/managing-environments)
