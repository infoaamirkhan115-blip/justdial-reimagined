CREATE TABLE public.favourites (user_id uuid NOT NULL, business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE, created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(user_id,business_id));
GRANT SELECT,INSERT,DELETE ON public.favourites TO authenticated;
GRANT ALL ON public.favourites TO service_role;
ALTER TABLE public.favourites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own favourites" ON public.favourites FOR SELECT TO authenticated USING (user_id=auth.uid());
CREATE POLICY "save own approved favourites" ON public.favourites FOR INSERT TO authenticated WITH CHECK (user_id=auth.uid() AND EXISTS(SELECT 1 FROM public.businesses b WHERE b.id=business_id AND b.status='approved'));
CREATE POLICY "remove own favourites" ON public.favourites FOR DELETE TO authenticated USING (user_id=auth.uid());
CREATE FUNCTION public.validate_directory_enquiry() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
IF length(trim(NEW.name)) < 1 OR length(NEW.name)>100 OR NEW.phone !~ '^[6-9][0-9]{9}$' OR length(NEW.message)>1000 OR NEW.status<>'new' THEN RAISE EXCEPTION 'Invalid enquiry'; END IF;
PERFORM pg_advisory_xact_lock(hashtextextended(NEW.phone,0));
IF (SELECT count(*) FROM public.leads WHERE phone=NEW.phone AND created_at>now()-interval '10 minutes')>=3 THEN RAISE EXCEPTION 'Please wait before sending another enquiry'; END IF;
RETURN NEW; END $$;
CREATE TRIGGER validate_directory_enquiry BEFORE INSERT ON public.leads FOR EACH ROW EXECUTE FUNCTION public.validate_directory_enquiry();