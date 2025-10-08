-- Add DELETE policies for profiles and image_passwords tables (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can delete own profile'
  ) THEN
    CREATE POLICY "Users can delete own profile"
    ON public.profiles
    FOR DELETE
    USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'image_passwords' 
    AND policyname = 'Users can delete own password'
  ) THEN
    CREATE POLICY "Users can delete own password"
    ON public.image_passwords
    FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create password hashing helper function
CREATE OR REPLACE FUNCTION public.hash_image_sequence(sequence text[])
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN encode(digest(array_to_string(sequence, ','), 'sha256'), 'hex');
END;
$$;