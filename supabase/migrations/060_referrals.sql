-- Referral / invite: "Friend ko bulao, dono ko benefit"
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  invitee_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(invitee_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(code);
CREATE INDEX IF NOT EXISTS idx_referrals_inviter ON public.referrals(inviter_id);

-- Referral codes per user (one active code per user)
CREATE TABLE IF NOT EXISTS public.referral_codes (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "referrals_select_own" ON public.referrals FOR SELECT USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);
CREATE POLICY "referrals_insert_own" ON public.referrals FOR INSERT WITH CHECK (auth.uid() = inviter_id);
CREATE POLICY "referrals_update_own" ON public.referrals FOR UPDATE USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

CREATE POLICY "referral_codes_select_own" ON public.referral_codes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "referral_codes_insert_own" ON public.referral_codes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "referral_codes_update_own" ON public.referral_codes FOR UPDATE USING (auth.uid() = user_id);
