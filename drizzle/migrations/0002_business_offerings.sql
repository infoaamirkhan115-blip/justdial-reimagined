CREATE TABLE public.business_offerings (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
 kind text NOT NULL DEFAULT 'service' CHECK (kind IN ('product','service')),
 name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
 category text NOT NULL DEFAULT '',
 business_type text NOT NULL DEFAULT '',
 description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 3000),
 photos text[] NOT NULL DEFAULT '{}',
 pricing jsonb NOT NULL DEFAULT '{}',
 specifications jsonb NOT NULL DEFAULT '[]',
 product_details jsonb NOT NULL DEFAULT '{}',
 published boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.business_offerings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_offerings TO authenticated;
GRANT ALL ON public.business_offerings TO service_role;
ALTER TABLE public.business_offerings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public published offerings" ON public.business_offerings FOR SELECT TO anon, authenticated USING (published AND EXISTS (SELECT 1 FROM public.businesses b WHERE b.id=business_id AND b.status='approved'));
CREATE POLICY "manage business offerings" ON public.business_offerings FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id=business_id AND (b.owner_id=auth.uid() OR public.has_role(auth.uid(),'admin')))) WITH CHECK (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id=business_id AND (b.owner_id=auth.uid() OR public.has_role(auth.uid(),'admin'))));
CREATE INDEX business_offerings_business_idx ON public.business_offerings(business_id);
CREATE OR REPLACE FUNCTION public.guard_offering_update() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN NEW.updated_at=now(); IF TG_OP='UPDATE' THEN NEW.business_id=OLD.business_id; END IF; RETURN NEW; END; $$;
CREATE TRIGGER guard_offering_update BEFORE UPDATE ON public.business_offerings FOR EACH ROW EXECUTE FUNCTION public.guard_offering_update();