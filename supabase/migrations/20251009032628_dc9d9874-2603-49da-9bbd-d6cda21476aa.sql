-- Add column to store the actual image URLs for login
ALTER TABLE public.image_passwords 
ADD COLUMN IF NOT EXISTS selected_images text[] NOT NULL DEFAULT '{}';

-- Update the column to store both the hash and the actual URLs
COMMENT ON COLUMN public.image_passwords.image_sequence IS 'Stores the hash of the selected image sequence for verification';
COMMENT ON COLUMN public.image_passwords.selected_images IS 'Stores the actual image URLs to display during login';