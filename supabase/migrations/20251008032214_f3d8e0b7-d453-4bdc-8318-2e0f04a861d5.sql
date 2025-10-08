-- Add INSERT policy to profiles table to prevent unauthorized profile creation
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);