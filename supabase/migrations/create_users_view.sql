-- Create a view to expose user emails from auth.users
-- This allows the application to fetch user emails without directly accessing auth.users
CREATE OR REPLACE VIEW public.users AS
SELECT 
  id,
  email,
  created_at
FROM auth.users;

-- Grant SELECT permission to authenticated users
GRANT SELECT ON public.users TO authenticated;

-- Add a comment explaining the view
COMMENT ON VIEW public.users IS 'Public view of auth.users to allow applications to access user email addresses';
