-- Add CHECK constraint to enforce valid image_count values (4 or 6)
ALTER TABLE public.image_passwords 
ADD CONSTRAINT check_image_count 
CHECK (image_count IN (4, 6));

-- Add CHECK constraint to ensure image_sequence has exactly 1 element (the hash)
ALTER TABLE public.image_passwords 
ADD CONSTRAINT check_image_sequence_length 
CHECK (array_length(image_sequence, 1) = 1);

-- Add CHECK constraint to ensure selected_images count matches image_count
ALTER TABLE public.image_passwords 
ADD CONSTRAINT check_selected_images_match 
CHECK (array_length(selected_images, 1) = image_count);