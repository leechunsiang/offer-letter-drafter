-- =====================================================
-- ACCESS KEY SYSTEM & USER PROFILES
-- =====================================================

-- 1. Create access_keys table
CREATE TABLE IF NOT EXISTS public.access_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'user')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed an owner key (user can change this in Supabase)
INSERT INTO public.access_keys (key, role) 
VALUES ('OWNER-2026', 'owner')
ON CONFLICT (key) DO NOTHING;

-- 2. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('owner', 'admin', 'user')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Set up RLS Policy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- 3. Function to handle new user creation and role assignment
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    signup_key TEXT;
    assigned_role TEXT := 'user';
BEGIN
    -- Extract access_key from metadata
    signup_key := NEW.raw_user_meta_data->>'access_key';
    
    -- Check if key matches an entry in access_keys
    IF signup_key IS NOT NULL THEN
        SELECT role INTO assigned_role 
        FROM public.access_keys 
        WHERE key = signup_key;
    END IF;

    -- Default to 'user' if no match or no key provided
    IF assigned_role IS NULL THEN
        assigned_role := 'user';
    END IF;

    -- Insert into profiles
    INSERT INTO public.profiles (id, email, role)
    VALUES (NEW.id, NEW.email, assigned_role);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
