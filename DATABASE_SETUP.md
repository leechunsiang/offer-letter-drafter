# Database Setup Instructions

This application uses Supabase as its database. Follow these steps to set up the database schema.

## Prerequisites

- A Supabase project already created
- Access to the Supabase SQL Editor

## Setup Steps

### 1. Navigate to Supabase SQL Editor

1. Go to your Supabase project dashboard at https://supabase.com/dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"

### 2. Run the Schema Migration

Copy the entire contents of `supabase-schema.sql` file and paste it into the SQL Editor, then click "Run" or press Ctrl+Enter.

This will create:
- **candidates** table - Stores candidate information
- **templates** table - Stores offer letter templates
- **company_settings** table - Stores company configuration
- All necessary indexes for performance
- Row Level Security policies
- Triggers for auto-updating timestamps
- Sample seed data (2 candidates, 1 template, 1 settings record)

### 3. Verify the Setup

After running the script, verify the tables were created:

1. In Supabase dashboard, go to "Table Editor"
2. You should see three tables: `candidates`, `templates`, and `company_settings`
3. Each table should have the sample data populated

### 4. Environment Variables

Make sure your `.env` file has the correct Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

These are already configured in your project.

## Database Schema Overview

### candidates
- `id` - UUID primary key
- `name` - Candidate's full name
- `email` - Candidate's email (unique)
- `role` - Job position
- `status` - 'Pending' or 'Generated'
- `offer_date` - Date of the offer
- `created_at`, `updated_at` - Timestamps

### templates
- `id` - UUID primary key
- `name` - Template name (unique)
- `content` - Template content with {{variable}} placeholders
- `created_at`, `updated_at` - Timestamps

### company_settings
- `id` - UUID primary key
- `company_name`, `company_address`, `company_website`, `company_phone` - Company info
- `logo_url` - Company logo (base64 or URL)
- `primary_color` - Brand color (hex)
- `sender_name`, `sender_email` - Email configuration
- `created_at`, `updated_at` - Timestamps

## Real-time Synchronization

The application automatically subscribes to database changes using Supabase's real-time features. Any changes made to the data will be immediately reflected across all open browser tabs/windows.

## Security

Row Level Security (RLS) is enabled on all tables with public access policies for this single-tenant application. All operations are performed using the anon key.

## Troubleshooting

If you encounter any issues:

1. Check that the SQL script ran without errors in the SQL Editor
2. Verify your environment variables are correct
3. Check the browser console for any connection errors
4. Make sure your Supabase project is active and not paused
