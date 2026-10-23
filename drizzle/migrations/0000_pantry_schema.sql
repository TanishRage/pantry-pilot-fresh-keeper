CREATE TABLE public.pantry_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL CHECK (char_length(btrim(name)) BETWEEN 1 AND 60),
  quantity numeric NOT NULL CHECK (quantity >= 0.1 AND quantity <= 1000),
  unit text NOT NULL CHECK (unit IN ('g','kg','ml','l','pcs')),
  category text NOT NULL CHECK (category IN ('produce','dairy','meat','grains','pantry','frozen','other')),
  storage text NOT NULL CHECK (storage IN ('fridge','freezer','shelf')),
  added_at timestamptz NOT NULL DEFAULT now(),
  expires_at date,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','used','wasted')),
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','ai'))
);
CREATE INDEX pantry_items_user_idx ON public.pantry_items(user_id, status, expires_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pantry_items TO authenticated;
GRANT ALL ON public.pantry_items TO service_role;
ALTER TABLE public.pantry_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own select" ON public.pantry_items FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own insert" ON public.pantry_items FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "own update" ON public.pantry_items FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "own delete" ON public.pantry_items FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  plan jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meal_plans TO authenticated;
GRANT ALL ON public.meal_plans TO service_role;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own select" ON public.meal_plans FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own insert" ON public.meal_plans FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "own update" ON public.meal_plans FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "own delete" ON public.meal_plans FOR DELETE TO authenticated USING (user_id = auth.uid());