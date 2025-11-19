# Quick Start Guide

## 🚀 Getting Started with Database Integration

Your Offer Letter Drafter application has been successfully migrated from hard-coded data to a Supabase database! Follow these simple steps to get everything working.

## Step 1: Set Up the Database (One-time setup)

### Option A: Using Supabase Dashboard (Recommended)

1. Open your Supabase project dashboard at [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Navigate to **SQL Editor** from the left sidebar
3. Click **"New Query"**
4. Open the `supabase-schema.sql` file from this project
5. Copy all the contents and paste into the SQL Editor
6. Click **"Run"** or press `Ctrl+Enter`
7. Wait for the success message

That's it! Your database is now ready with:
- ✅ All tables created (candidates, templates, company_settings)
- ✅ Sample data seeded (2 candidates, 1 template)
- ✅ Security policies enabled
- ✅ Real-time subscriptions configured

### Option B: Manual Table Creation

If you prefer to create tables manually, refer to `DATABASE_SETUP.md` for detailed instructions.

## Step 2: Verify the Setup

1. In Supabase dashboard, go to **Table Editor**
2. You should see three tables:
   - `candidates` (with 2 sample records)
   - `templates` (with 1 sample record)
   - `company_settings` (with 1 empty record)

## Step 3: Start the Application

```bash
npm install  # If you haven't already
npm run dev
```

The application will automatically:
- Connect to your Supabase database
- Load all data from the database
- Enable real-time synchronization
- Show loading states while fetching data

## What Changed?

### Before ✗
- Data was hard-coded in the Zustand store
- Data was lost on page refresh
- No synchronization between browser tabs
- Limited to 2 candidates and 1 template

### After ✓
- Data is stored in Supabase database
- Data persists across sessions
- Real-time sync between all open tabs
- Unlimited candidates and templates
- Professional data validation
- Loading and error states

## Testing Real-time Sync

1. Open the application in two browser tabs
2. In tab 1, add a new candidate
3. Watch it appear instantly in tab 2! ⚡

## Features Available

### Candidates Page
- ✓ Add new candidates
- ✓ View all candidates
- ✓ Update candidate status
- ✓ Generate offer letters
- ✓ Preview offers before generating

### Templates Page
- ✓ Create new templates
- ✓ Edit existing templates
- ✓ Use variables like {{name}}, {{role}}, {{offerDate}}
- ✓ Save changes with real-time updates

### Settings Page
- ✓ Configure company information
- ✓ Upload company logo
- ✓ Set brand colors
- ✓ Configure email settings

### Dashboard
- ✓ View total candidates
- ✓ See generated offers count
- ✓ Track pending actions

## Troubleshooting

### "Failed to initialize" error
- Check your `.env` file has correct Supabase credentials
- Verify your Supabase project is active (not paused)
- Make sure you ran the SQL schema script

### Data not appearing
- Check browser console for errors
- Verify tables were created in Supabase
- Confirm Row Level Security policies are active

### Real-time sync not working
- Ensure you're using the same Supabase project in both tabs
- Check that real-time is enabled in your Supabase project settings
- Look for subscription errors in browser console

## Need Help?

Refer to these files for more information:
- `DATABASE_SETUP.md` - Detailed database setup instructions
- `MIGRATION_SUMMARY.md` - Technical details about what changed
- `supabase-schema.sql` - The complete database schema

## Environment Variables

Your `.env` file should have:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

These are already configured for your project! ✓

---

**That's it! You're ready to use your database-powered Offer Letter Drafter! 🎉**
