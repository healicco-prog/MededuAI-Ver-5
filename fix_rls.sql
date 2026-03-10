-- Fix infinite recursion in public.profiles policies

-- Drop the old recursive policies
DROP POLICY IF EXISTS "Super Admins have full access" ON public.profiles;
DROP POLICY IF EXISTS "Master Admins manage their institution" ON public.profiles;
DROP POLICY IF EXISTS "Institution Admins manage their institution" ON public.profiles;
DROP POLICY IF EXISTS "Department Admins manage their department" ON public.profiles;

-- Create a SECURITY DEFINER function to get the current user's role safely bypassing RLS
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS text
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
    SELECT role::text FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_auth_institution_id()
RETURNS uuid
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
    SELECT institution_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_auth_department_id()
RETURNS uuid
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
    SELECT department_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Apply the new non-recursive policies
CREATE POLICY "Super Admins have full access" ON public.profiles 
FOR ALL USING (public.get_auth_role() IN ('super_admin', 'superadmin', 'master_admin', 'masteradmin'));

CREATE POLICY "Institution Admins manage their institution" ON public.profiles 
FOR ALL USING (public.get_auth_role() IN ('institution_admin', 'instadmin') AND institution_id = public.get_auth_institution_id());

CREATE POLICY "Department Admins manage their department" ON public.profiles 
FOR ALL USING (public.get_auth_role() IN ('department_admin', 'deptadmin') AND department_id = public.get_auth_department_id() AND institution_id = public.get_auth_institution_id());
