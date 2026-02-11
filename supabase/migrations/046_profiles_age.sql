-- Add date_of_birth for age display (optional)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
