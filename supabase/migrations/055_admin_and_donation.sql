-- Admin role and donation feature
-- 1) Admin: add is_admin to profiles, set farrukh215@gmail.com as admin
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Set farrukh215@gmail.com as admin (if user exists at migration time)
DO $$
DECLARE
  admin_uid UUID;
BEGIN
  SELECT id INTO admin_uid FROM auth.users WHERE email = 'farrukh215@gmail.com' LIMIT 1;
  IF admin_uid IS NOT NULL THEN
    UPDATE public.profiles SET is_admin = TRUE WHERE user_id = admin_uid;
    IF NOT FOUND THEN
      INSERT INTO public.profiles (user_id, display_name, is_admin)
      VALUES (admin_uid, 'Admin', TRUE);
    END IF;
  END IF;
END $$;

-- Trigger: when farrukh215@gmail.com signs up, set is_admin
CREATE OR REPLACE FUNCTION public.set_admin_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email = 'farrukh215@gmail.com' THEN
    UPDATE public.profiles SET is_admin = TRUE WHERE user_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_set_admin_on_signup ON auth.users;
CREATE TRIGGER trigger_set_admin_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_admin_on_signup();

-- 2) Donation categories (min 8)
CREATE TABLE IF NOT EXISTS public.donation_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT,
  sort_order INT DEFAULT 0
);

INSERT INTO public.donation_categories (slug, name, icon, sort_order) VALUES
  ('medical', 'Medical & Health', '🏥', 1),
  ('education', 'Education', '📚', 2),
  ('food', 'Food & Essentials', '🍽️', 3),
  ('housing', 'Housing & Shelter', '🏠', 4),
  ('orphans', 'Orphans & Children', '👶', 5),
  ('elderly', 'Elderly Care', '👴', 6),
  ('disaster', 'Disaster Relief', '🌪️', 7),
  ('general', 'General Donation', '💝', 8)
ON CONFLICT (slug) DO NOTHING;

-- 3) Donation requests (needy people, require 5+ proof images, admin verified)
CREATE TABLE IF NOT EXISTS public.donation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.donation_categories(id),
  title TEXT NOT NULL,
  description TEXT,
  amount_requested DECIMAL(12,2),
  proof_images TEXT[] DEFAULT '{}',
  bank_account_details JSONB,
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_donation_requests_author ON public.donation_requests(author_id);
CREATE INDEX idx_donation_requests_category ON public.donation_requests(category_id);
CREATE INDEX idx_donation_requests_verified ON public.donation_requests(verified) WHERE verified = TRUE;
CREATE INDEX idx_donation_requests_created ON public.donation_requests(created_at DESC);

-- 4) Donations (contributions from donors)
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.donation_requests(id) ON DELETE CASCADE,
  donor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  payment_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_donations_request ON public.donations(request_id);
CREATE INDEX idx_donations_donor ON public.donations(donor_id);
CREATE INDEX idx_donations_status ON public.donations(status);

-- RLS
ALTER TABLE public.donation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "donation_requests_select_verified" ON public.donation_requests
  FOR SELECT USING (verified = TRUE);

CREATE POLICY "donation_requests_insert_own" ON public.donation_requests
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "donation_requests_update_own" ON public.donation_requests
  FOR UPDATE USING (auth.uid() = author_id);

-- Admin can select all (including unverified) and update verification
CREATE POLICY "donation_requests_admin_select" ON public.donation_requests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "donation_requests_admin_update" ON public.donation_requests
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "donations_select_all" ON public.donations FOR SELECT USING (true);
CREATE POLICY "donations_insert_auth" ON public.donations FOR INSERT WITH CHECK (auth.uid() = donor_id);
