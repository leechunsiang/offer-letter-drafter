# Setup Checklist ✓

Use this checklist to ensure your database migration is complete and working properly.

## Pre-Setup
- [x] Supabase project created
- [x] Environment variables configured in `.env`
- [x] @supabase/supabase-js installed

## Database Setup
- [ ] Opened Supabase SQL Editor
- [ ] Copied contents of `supabase-schema.sql`
- [ ] Pasted into SQL Editor
- [ ] Clicked "Run" to execute
- [ ] Verified success message appeared

## Verification
- [ ] Checked Table Editor in Supabase
- [ ] Confirmed `candidates` table exists with 2 records
- [ ] Confirmed `templates` table exists with 1 record
- [ ] Confirmed `company_settings` table exists with 1 record
- [ ] Verified RLS is enabled on all tables

## Testing
- [ ] Started development server (`npm run dev`)
- [ ] Application loads without errors
- [ ] Dashboard shows correct statistics
- [ ] Candidates page displays 2 sample candidates
- [ ] Templates page shows 1 sample template
- [ ] Settings page loads company settings form

## Functionality Tests
- [ ] Added a new candidate successfully
- [ ] Candidate appears in the list immediately
- [ ] Updated candidate status works
- [ ] Generated offer letter PDF downloads
- [ ] Created a new template successfully
- [ ] Edited existing template and saved
- [ ] Updated company settings and saved
- [ ] Page refresh maintains all data

## Real-time Sync Test
- [ ] Opened application in two browser tabs
- [ ] Made a change in tab 1 (add candidate, edit template, etc.)
- [ ] Change appeared automatically in tab 2
- [ ] Tried changes in tab 2, appeared in tab 1

## Error Handling Test
- [ ] Application shows loading spinner on initial load
- [ ] Error messages display if database is unreachable
- [ ] Retry button works on error screen

## Advanced (Optional)
- [ ] Inspected browser console for any errors
- [ ] Checked Network tab for Supabase requests
- [ ] Verified real-time subscriptions are active
- [ ] Tested with slow network connection

---

## Troubleshooting

### Issue: "Failed to initialize" error
**Solution:**
1. Check `.env` file has correct credentials
2. Verify Supabase project is not paused
3. Confirm SQL schema was executed successfully

### Issue: No data appears
**Solution:**
1. Check browser console for errors
2. Verify tables exist in Supabase
3. Confirm sample data was seeded
4. Check RLS policies are created

### Issue: Real-time sync not working
**Solution:**
1. Verify real-time is enabled in Supabase project settings
2. Check browser console for subscription errors
3. Ensure both tabs use same Supabase project

### Issue: Cannot add new data
**Solution:**
1. Check RLS policies allow public access (for anon key)
2. Verify data passes validation rules
3. Check for unique constraint violations

---

## Success Criteria

Your setup is complete when:
- ✓ All checkboxes above are checked
- ✓ No errors in browser console
- ✓ Data persists after page refresh
- ✓ Real-time sync works between tabs
- ✓ CRUD operations work for all entities

## Getting Help

If you're stuck:
1. Check `DATABASE_SETUP.md` for detailed instructions
2. Review `MIGRATION_SUMMARY.md` for technical details
3. Read `QUICK_START.md` for quick reference
4. Check Supabase documentation at https://supabase.com/docs

---

**Once all items are checked, you're ready to use your database-powered Offer Letter Drafter!** 🎉
