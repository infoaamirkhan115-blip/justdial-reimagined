CREATE OR REPLACE FUNCTION public.validate_directory_business_access() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(),'admin') THEN
 IF TG_OP='UPDATE' THEN NEW.archive_status:=OLD.archive_status; IF OLD.archived_at IS NULL AND NEW.archived_at IS NOT NULL THEN NEW.archive_status:=OLD.status; END IF; IF NEW.coordinates->>'status'='verified' AND NEW.coordinates IS DISTINCT FROM OLD.coordinates THEN RAISE EXCEPTION 'Only administrators can verify coordinates'; END IF;
 ELSE NEW.archive_status:=NULL; IF NEW.coordinates->>'status'='verified' THEN RAISE EXCEPTION 'Only administrators can verify coordinates'; END IF; END IF;
END IF;
IF NEW.organization_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.business_organizations WHERE id=NEW.organization_id AND (owner_id=NEW.owner_id OR public.has_role(auth.uid(),'admin'))) THEN RAISE EXCEPTION 'Organization belongs to another owner'; END IF;
IF NEW.coordinates->>'status'='verified' AND (coalesce(NEW.coordinates->>'source','')='' OR NEW.coordinates->>'latitude' IS NULL OR NEW.coordinates->>'longitude' IS NULL) THEN RAISE EXCEPTION 'Coordinate verification requires source and coordinates'; END IF;
RETURN NEW; END $$;
CREATE TRIGGER aa_directory_access BEFORE INSERT OR UPDATE ON public.businesses FOR EACH ROW EXECUTE FUNCTION public.validate_directory_business_access();
CREATE OR REPLACE FUNCTION public.validate_offering_content() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE p text; field jsonb; category_fields jsonb; specification jsonb; BEGIN
IF length(trim(NEW.name))<1 OR length(NEW.description)>3000 OR jsonb_typeof(NEW.pricing)<>'object' OR NEW.pricing->>'mode' NOT IN ('single','range','quantity','quote') THEN RAISE EXCEPTION 'Invalid catalogue details'; END IF;
FOREACH p IN ARRAY NEW.photos LOOP IF p !~* '^[0-9a-f-]{36}/[a-zA-Z0-9][a-zA-Z0-9._-]*\.(jpg|jpeg|png|webp)$' THEN RAISE EXCEPTION 'Invalid media reference'; END IF; IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(),'admin') AND split_part(p,'/',1)<>auth.uid()::text AND NOT (TG_OP='UPDATE' AND p=ANY(OLD.photos)) THEN RAISE EXCEPTION 'Media must belong to the uploader'; END IF; END LOOP;
IF cardinality(NEW.photos)>10 THEN RAISE EXCEPTION 'Maximum ten photos'; END IF;
SELECT c.fields INTO category_fields FROM public.businesses b JOIN public.directory_categories c ON c.id=b.category_id WHERE b.id=NEW.business_id;
IF NEW.review_state='published' AND current_setting('app.directory_merge',true) IS DISTINCT FROM 'true' THEN
FOR field IN SELECT value FROM jsonb_array_elements(coalesce(category_fields,'[]')) LOOP
 IF coalesce((field->>'required')::boolean,false) THEN SELECT value INTO specification FROM jsonb_array_elements(NEW.specifications) WHERE lower(value->>'name') IN (lower(field->>'key'),lower(field->>'label')) LIMIT 1; IF specification IS NULL OR coalesce(specification->>'value','')='' THEN RAISE EXCEPTION 'Required category specification missing: %',field->>'label'; END IF; END IF;
END LOOP;
END IF; RETURN NEW; END $$;
CREATE TRIGGER zz_offering_content BEFORE INSERT OR UPDATE ON public.business_offerings FOR EACH ROW EXECUTE FUNCTION public.validate_offering_content();