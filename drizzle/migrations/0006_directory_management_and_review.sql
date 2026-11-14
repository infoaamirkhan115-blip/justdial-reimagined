CREATE TABLE public.directory_categories (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), parent_id uuid REFERENCES public.directory_categories(id), slug text NOT NULL UNIQUE, legacy_slug text NOT NULL DEFAULT '', name text NOT NULL, icon text NOT NULL DEFAULT 'Building2', description text NOT NULL DEFAULT '', group_name text NOT NULL DEFAULT '', aliases text[] NOT NULL DEFAULT '{}', fields jsonb NOT NULL DEFAULT '[]', cta_label text NOT NULL DEFAULT 'Send enquiry', position integer NOT NULL DEFAULT 0, active boolean NOT NULL DEFAULT true, public_visible boolean NOT NULL DEFAULT true);
GRANT SELECT ON public.directory_categories TO anon; GRANT SELECT,INSERT,UPDATE,DELETE ON public.directory_categories TO authenticated; GRANT ALL ON public.directory_categories TO service_role;
ALTER TABLE public.directory_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public categories" ON public.directory_categories FOR SELECT TO anon,authenticated USING (active AND public_visible);
CREATE POLICY "admin categories" ON public.directory_categories FOR ALL TO authenticated USING(public.has_role(auth.uid(),'admin')) WITH CHECK(public.has_role(auth.uid(),'admin'));
CREATE TABLE public.directory_locations (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), parent_id uuid REFERENCES public.directory_locations(id), kind text NOT NULL CHECK(kind IN ('city','locality','pincode')), name text NOT NULL, active boolean NOT NULL DEFAULT true, source_url text NOT NULL DEFAULT '', verified boolean NOT NULL DEFAULT false, UNIQUE(kind,name,parent_id));
GRANT SELECT ON public.directory_locations TO anon; GRANT SELECT,INSERT,UPDATE,DELETE ON public.directory_locations TO authenticated; GRANT ALL ON public.directory_locations TO service_role;
ALTER TABLE public.directory_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public locations" ON public.directory_locations FOR SELECT TO anon,authenticated USING(active);
CREATE POLICY "admin locations" ON public.directory_locations FOR ALL TO authenticated USING(public.has_role(auth.uid(),'admin')) WITH CHECK(public.has_role(auth.uid(),'admin'));
CREATE TABLE public.business_organizations (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, owner_id uuid NOT NULL);
GRANT SELECT,INSERT,UPDATE ON public.business_organizations TO authenticated; GRANT ALL ON public.business_organizations TO service_role;
ALTER TABLE public.business_organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "organization access" ON public.business_organizations FOR ALL TO authenticated USING(owner_id=auth.uid() OR public.has_role(auth.uid(),'admin')) WITH CHECK(owner_id=auth.uid() OR public.has_role(auth.uid(),'admin'));
ALTER TABLE public.businesses ADD COLUMN category_id uuid REFERENCES public.directory_categories(id), ADD COLUMN city_id uuid REFERENCES public.directory_locations(id), ADD COLUMN locality_id uuid REFERENCES public.directory_locations(id), ADD COLUMN pincode_id uuid REFERENCES public.directory_locations(id), ADD COLUMN organization_id uuid REFERENCES public.business_organizations(id), ADD COLUMN service_areas jsonb NOT NULL DEFAULT '[]', ADD COLUMN attributes jsonb NOT NULL DEFAULT '{}', ADD COLUMN coordinates jsonb NOT NULL DEFAULT '{}', ADD COLUMN structured_hours jsonb NOT NULL DEFAULT '[]', ADD COLUMN archived_at timestamptz, ADD COLUMN archive_status text, ADD COLUMN owner_feedback text NOT NULL DEFAULT '';
CREATE TABLE public.directory_staff_notes (business_id uuid PRIMARY KEY REFERENCES public.businesses(id), note text NOT NULL DEFAULT '', ownership_status text NOT NULL DEFAULT 'unverified', ownership_evidence text NOT NULL DEFAULT '');
GRANT SELECT,INSERT,UPDATE ON public.directory_staff_notes TO authenticated; GRANT ALL ON public.directory_staff_notes TO service_role;
ALTER TABLE public.directory_staff_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin private notes" ON public.directory_staff_notes FOR ALL TO authenticated USING(public.has_role(auth.uid(),'admin')) WITH CHECK(public.has_role(auth.uid(),'admin'));
INSERT INTO public.directory_staff_notes(business_id,note) SELECT id,admin_note FROM public.businesses WHERE admin_note IS NOT NULL;
UPDATE public.businesses SET admin_note=NULL WHERE admin_note IS NOT NULL;
COMMENT ON COLUMN public.businesses.admin_note IS 'DEPRECATED: migrated to private directory_staff_notes; use owner_feedback for public owner feedback';
CREATE TABLE public.directory_quality_issues (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), business_id uuid NOT NULL REFERENCES public.businesses(id), offering_id uuid REFERENCES public.business_offerings(id), fingerprint text NOT NULL UNIQUE, kind text NOT NULL, severity text NOT NULL CHECK(severity IN ('low','medium','high')), fields text[] NOT NULL DEFAULT '{}', summary text NOT NULL, assignee uuid REFERENCES public.profiles(id), status text NOT NULL DEFAULT 'open' CHECK(status IN ('open','in_progress','resolved','dismissed')), notes text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT,INSERT,UPDATE ON public.directory_quality_issues TO authenticated; GRANT ALL ON public.directory_quality_issues TO service_role;
ALTER TABLE public.directory_quality_issues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin quality" ON public.directory_quality_issues FOR ALL TO authenticated USING(public.has_role(auth.uid(),'admin')) WITH CHECK(public.has_role(auth.uid(),'admin'));
CREATE TABLE public.directory_audit (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), business_id uuid REFERENCES public.businesses(id), entity_id uuid, action text NOT NULL, actor_id uuid, before_data jsonb, after_data jsonb, note text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.directory_audit TO authenticated; GRANT ALL ON public.directory_audit TO service_role;
ALTER TABLE public.directory_audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin audit" ON public.directory_audit FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'admin'));
CREATE TABLE public.listing_change_requests (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), business_id uuid NOT NULL REFERENCES public.businesses(id), requester_id uuid NOT NULL, before_data jsonb NOT NULL, proposed_data jsonb NOT NULL, status text NOT NULL DEFAULT 'review' CHECK(status IN ('review','approved','rejected')), feedback text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now(), reviewed_at timestamptz);
GRANT SELECT ON public.listing_change_requests TO authenticated; GRANT ALL ON public.listing_change_requests TO service_role;
ALTER TABLE public.listing_change_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own change requests" ON public.listing_change_requests FOR SELECT TO authenticated USING(requester_id=auth.uid() OR public.has_role(auth.uid(),'admin'));
ALTER TABLE public.business_offerings ADD COLUMN review_state text NOT NULL DEFAULT 'draft' CHECK(review_state IN ('draft','review','published')), ADD COLUMN inclusions text NOT NULL DEFAULT '', ADD COLUMN exclusions text NOT NULL DEFAULT '', ADD COLUMN minimum_quantity numeric, ADD COLUMN minimum_area numeric, ADD COLUMN review_feedback text NOT NULL DEFAULT '';
UPDATE public.business_offerings SET review_state=CASE WHEN published THEN 'published' ELSE 'draft' END;
CREATE TABLE public.offering_revisions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), offering_id uuid NOT NULL REFERENCES public.business_offerings(id), actor_id uuid, before_data jsonb, after_data jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.offering_revisions TO authenticated; GRANT ALL ON public.offering_revisions TO service_role;
ALTER TABLE public.offering_revisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "offering history access" ON public.offering_revisions FOR SELECT TO authenticated USING(EXISTS(SELECT 1 FROM public.business_offerings o JOIN public.businesses b ON b.id=o.business_id WHERE o.id=offering_id AND (b.owner_id=auth.uid() OR public.has_role(auth.uid(),'admin'))));
CREATE TABLE public.directory_redirects (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), kind text NOT NULL CHECK(kind IN ('category','business')), from_key text NOT NULL, to_key text NOT NULL, UNIQUE(kind,from_key));
GRANT SELECT ON public.directory_redirects TO anon; GRANT SELECT,INSERT,UPDATE ON public.directory_redirects TO authenticated; GRANT ALL ON public.directory_redirects TO service_role;
ALTER TABLE public.directory_redirects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public redirects" ON public.directory_redirects FOR SELECT TO anon,authenticated USING(true);
CREATE POLICY "admin redirects" ON public.directory_redirects FOR ALL TO authenticated USING(public.has_role(auth.uid(),'admin')) WITH CHECK(public.has_role(auth.uid(),'admin'));
CREATE TABLE public.directory_import_batches (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), filename text NOT NULL, mapping jsonb NOT NULL DEFAULT '{}', rows jsonb NOT NULL, status text NOT NULL DEFAULT 'staged' CHECK(status IN ('staged','applied','reversed')), created_by uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), applied_at timestamptz, applied_ids uuid[] NOT NULL DEFAULT '{}');
GRANT SELECT,INSERT ON public.directory_import_batches TO authenticated; GRANT ALL ON public.directory_import_batches TO service_role;
ALTER TABLE public.directory_import_batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin imports read" ON public.directory_import_batches FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin imports stage" ON public.directory_import_batches FOR INSERT TO authenticated WITH CHECK(public.has_role(auth.uid(),'admin') AND created_by=auth.uid() AND status='staged' AND cardinality(applied_ids)=0);
CREATE OR REPLACE FUNCTION public.obvious_placeholder(t text) RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path=public AS $$ SELECT coalesce(t,'') ~* '(lorem ipsum|placeholder|development instructions|I[’'']ll add product|both dashboards|TODO:|test listing|dummy business|insert description|as an AI)' $$;
CREATE OR REPLACE FUNCTION public.guard_business() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE prior jsonb; proposed jsonb; key text; sensitive text[]:=ARRAY['name','category','sub','city','area','address','pincode','phone','whatsapp','email','website','description','photos','logo','services','category_id','city_id','locality_id','pincode_id','organization_id','attributes','coordinates','service_areas','structured_hours'];
BEGIN
 NEW.updated_at:=now();
 IF NEW.name='' OR length(NEW.name)>120 OR length(NEW.description)>10000 OR (NEW.pincode<>'' AND NEW.pincode !~ '^[0-9]{6}$') THEN RAISE EXCEPTION 'Invalid listing details'; END IF;
 IF NOT public.has_role(auth.uid(),'admin') THEN
 IF TG_OP='INSERT' THEN NEW.status:='pending'; NEW.plan:='free'; NEW.verified:=false; NEW.sponsored:=false; NEW.admin_note:=NULL; NEW.owner_feedback:=''; NEW.archived_at:=NULL;
 ELSE
 NEW.plan:=OLD.plan; NEW.verified:=OLD.verified; NEW.sponsored:=OLD.sponsored; NEW.admin_note:=OLD.admin_note; NEW.owner_id:=OLD.owner_id; NEW.owner_feedback:=OLD.owner_feedback;
 IF NEW.archived_at IS DISTINCT FROM OLD.archived_at THEN
   IF NEW.archived_at IS NOT NULL THEN NEW.archive_status:=OLD.status; NEW.status:='archived'; ELSE NEW.status:=coalesce(OLD.archive_status,'pending'); END IF;
 ELSE NEW.status:=CASE WHEN OLD.status='rejected' THEN 'pending' ELSE OLD.status END;
 IF OLD.status='approved' THEN
 prior:=to_jsonb(OLD); proposed:=to_jsonb(NEW);
 IF EXISTS(SELECT 1 FROM unnest(sensitive) k WHERE prior->k IS DISTINCT FROM proposed->k) THEN
 INSERT INTO public.listing_change_requests(business_id,requester_id,before_data,proposed_data) VALUES(OLD.id,auth.uid(),prior,proposed);
 FOREACH key IN ARRAY sensitive LOOP proposed:=jsonb_set(proposed,ARRAY[key],coalesce(prior->key,'null'::jsonb)); END LOOP;
 NEW:=jsonb_populate_record(NEW,proposed);
 END IF;
 END IF;
 END IF;
 END IF;
 END IF;
 IF NEW.archived_at IS NOT NULL THEN NEW.status:='archived'; END IF;
 RETURN NEW;
END $$;
CREATE OR REPLACE FUNCTION public.guard_offering_update() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
 NEW.updated_at:=now(); IF TG_OP='UPDATE' THEN NEW.business_id:=OLD.business_id; END IF;
 IF NOT public.has_role(auth.uid(),'admin') THEN NEW.review_feedback:=CASE WHEN TG_OP='UPDATE' THEN OLD.review_feedback ELSE '' END; IF NEW.published OR NEW.review_state='published' THEN NEW.review_state:='review'; END IF; END IF;
 IF NEW.review_state='published' AND public.obvious_placeholder(NEW.description) THEN RAISE EXCEPTION 'Development or placeholder content must be corrected before publication'; END IF;
 NEW.published:=(NEW.review_state='published');
 IF NEW.minimum_area<0 OR NEW.minimum_quantity<0 THEN RAISE EXCEPTION 'Minimum values must not be negative'; END IF;
 RETURN NEW; END $$;
CREATE OR REPLACE FUNCTION public.capture_directory_history() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
 IF TG_TABLE_NAME='business_offerings' THEN INSERT INTO public.offering_revisions(offering_id,actor_id,before_data,after_data) VALUES(NEW.id,auth.uid(),CASE WHEN TG_OP='UPDATE' THEN to_jsonb(OLD) ELSE NULL END,to_jsonb(NEW));
 ELSE INSERT INTO public.directory_audit(business_id,entity_id,action,actor_id,before_data,after_data) VALUES(NEW.id,NEW.id,lower(TG_OP),auth.uid(),CASE WHEN TG_OP='UPDATE' THEN to_jsonb(OLD) ELSE NULL END,to_jsonb(NEW)); END IF; RETURN NEW; END $$;
CREATE TRIGGER business_history AFTER INSERT OR UPDATE ON public.businesses FOR EACH ROW EXECUTE FUNCTION public.capture_directory_history();
CREATE TRIGGER offering_history AFTER INSERT OR UPDATE ON public.business_offerings FOR EACH ROW EXECUTE FUNCTION public.capture_directory_history();
CREATE OR REPLACE FUNCTION public.guard_category() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
 IF NEW.slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' OR NEW.name='' OR jsonb_typeof(NEW.fields)<>'array' THEN RAISE EXCEPTION 'Invalid category'; END IF;
 IF NEW.parent_id=NEW.id OR EXISTS(WITH RECURSIVE chain AS (SELECT id,parent_id FROM public.directory_categories WHERE id=NEW.parent_id UNION SELECT c.id,c.parent_id FROM public.directory_categories c JOIN chain p ON c.id=p.parent_id) SELECT 1 FROM chain WHERE id=NEW.id) THEN RAISE EXCEPTION 'Category hierarchy cannot contain a cycle'; END IF;
 IF TG_OP='UPDATE' AND OLD.slug<>NEW.slug THEN INSERT INTO public.directory_redirects(kind,from_key,to_key) VALUES('category',OLD.slug,NEW.slug) ON CONFLICT(kind,from_key) DO UPDATE SET to_key=EXCLUDED.to_key; UPDATE public.directory_redirects SET to_key=NEW.slug WHERE kind='category' AND to_key=OLD.slug; END IF; RETURN NEW; END $$;
CREATE TRIGGER category_guard BEFORE INSERT OR UPDATE ON public.directory_categories FOR EACH ROW EXECUTE FUNCTION public.guard_category();
CREATE OR REPLACE FUNCTION public.review_listing_change(request_id uuid, approve boolean, feedback_text text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE r public.listing_change_requests; b public.businesses; patch jsonb; BEGIN
 IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
 SELECT * INTO r FROM public.listing_change_requests WHERE id=request_id AND status='review' FOR UPDATE; IF NOT FOUND THEN RAISE EXCEPTION 'Request unavailable'; END IF;
 SELECT * INTO b FROM public.businesses WHERE id=r.business_id FOR UPDATE;
 IF approve THEN
 IF b.updated_at>(r.before_data->>'updated_at')::timestamptz AND EXISTS(SELECT 1 FROM jsonb_each(r.proposed_data) p WHERE r.before_data->p.key IS DISTINCT FROM p.value AND to_jsonb(b)->p.key IS DISTINCT FROM r.before_data->p.key AND p.key NOT IN ('updated_at')) THEN RAISE EXCEPTION 'Listing changed since this request; review the conflict'; END IF;
 patch:=r.proposed_data; b:=jsonb_populate_record(b,patch); UPDATE public.businesses SET name=b.name,category=b.category,sub=b.sub,city=b.city,area=b.area,address=b.address,pincode=b.pincode,phone=b.phone,whatsapp=b.whatsapp,email=b.email,website=b.website,description=b.description,photos=b.photos,logo=b.logo,services=b.services,category_id=b.category_id,city_id=b.city_id,locality_id=b.locality_id,pincode_id=b.pincode_id,attributes=b.attributes,coordinates=b.coordinates,service_areas=b.service_areas,structured_hours=b.structured_hours,organization_id=b.organization_id,owner_feedback=feedback_text WHERE id=r.business_id;
 END IF;
 UPDATE public.listing_change_requests SET status=CASE WHEN approve THEN 'approved' ELSE 'rejected' END,feedback=feedback_text,reviewed_at=now() WHERE id=request_id;
 INSERT INTO public.directory_audit(business_id,entity_id,action,actor_id,note,before_data,after_data) VALUES(r.business_id,r.id,CASE WHEN approve THEN 'change_approved' ELSE 'change_rejected' END,auth.uid(),feedback_text,r.before_data,r.proposed_data);
 END $$;
GRANT EXECUTE ON FUNCTION public.review_listing_change(uuid,boolean,text) TO authenticated; REVOKE EXECUTE ON FUNCTION public.review_listing_change(uuid,boolean,text) FROM anon,PUBLIC;
CREATE OR REPLACE FUNCTION public.merge_directory_businesses(source_id uuid,target_id uuid,reason text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE s public.businesses; t public.businesses; BEGIN
 IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF; IF source_id=target_id OR length(trim(reason))<5 THEN RAISE EXCEPTION 'Choose distinct listings and record a reason'; END IF;
 SELECT * INTO s FROM public.businesses WHERE id=source_id FOR UPDATE; SELECT * INTO t FROM public.businesses WHERE id=target_id FOR UPDATE;
 IF s.id IS NULL OR t.id IS NULL OR s.archived_at IS NOT NULL OR t.archived_at IS NOT NULL THEN RAISE EXCEPTION 'Listings unavailable'; END IF;
 UPDATE public.reviews SET business_id=target_id WHERE business_id=source_id; UPDATE public.leads SET business_id=target_id WHERE business_id=source_id;
 ALTER TABLE public.business_offerings DISABLE TRIGGER USER;
 UPDATE public.business_offerings SET business_id=target_id WHERE business_id=source_id;
 ALTER TABLE public.business_offerings ENABLE TRIGGER USER;
 INSERT INTO public.favourites(user_id,business_id) SELECT user_id,target_id FROM public.favourites WHERE business_id=source_id ON CONFLICT DO NOTHING;
 UPDATE public.directory_quality_issues SET business_id=target_id WHERE business_id=source_id;
 UPDATE public.listing_change_requests SET business_id=target_id WHERE business_id=source_id;
 INSERT INTO public.directory_redirects(kind,from_key,to_key) VALUES('business',source_id::text,target_id::text) ON CONFLICT(kind,from_key) DO UPDATE SET to_key=EXCLUDED.to_key;
 UPDATE public.directory_redirects SET to_key=target_id::text WHERE kind='business' AND to_key=source_id::text;
 UPDATE public.businesses SET archive_status=status,archived_at=now(),status='archived' WHERE id=source_id;
 INSERT INTO public.directory_audit(business_id,entity_id,action,actor_id,before_data,after_data,note) VALUES(target_id,source_id,'merge',auth.uid(),to_jsonb(s),to_jsonb(t),reason);
 END $$;
GRANT EXECUTE ON FUNCTION public.merge_directory_businesses(uuid,uuid,text) TO authenticated; REVOKE EXECUTE ON FUNCTION public.merge_directory_businesses(uuid,uuid,text) FROM anon,PUBLIC;
REVOKE DELETE ON public.businesses FROM authenticated;
CREATE OR REPLACE FUNCTION public.track_quality_issue() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
 IF TG_OP='UPDATE' AND NEW.status IN ('resolved','dismissed') AND length(trim(NEW.notes))<3 THEN RAISE EXCEPTION 'Record a resolution reason'; END IF;
 NEW.updated_at:=now(); INSERT INTO public.directory_audit(business_id,entity_id,action,actor_id,before_data,after_data,note) VALUES(NEW.business_id,NEW.id,'quality_'||NEW.status,auth.uid(),CASE WHEN TG_OP='UPDATE' THEN to_jsonb(OLD) ELSE NULL END,to_jsonb(NEW),NEW.notes); RETURN NEW; END $$;
CREATE TRIGGER quality_history BEFORE INSERT OR UPDATE ON public.directory_quality_issues FOR EACH ROW EXECUTE FUNCTION public.track_quality_issue();