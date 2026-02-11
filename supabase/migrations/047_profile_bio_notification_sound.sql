-- Profile bio (about) and custom notification sound preference
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notification_sound TEXT DEFAULT 'default' CHECK (notification_sound IN ('default', 'chime', 'bell', 'pop', 'ding'));
