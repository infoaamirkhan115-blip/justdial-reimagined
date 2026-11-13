create type public.app_role as enum ('admin', 'business_owner', 'user');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  created_at timestamptz not null default now()
);
grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select, insert, delete on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "own roles read" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "admin add roles" on public.user_roles for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "admin remove roles" on public.user_roles for delete to authenticated using (public.has_role(auth.uid(), 'admin') and user_id <> auth.uid());

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), new.email);
  insert into public.user_roles (user_id, role) values (new.id, 'business_owner');
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  name text not null,
  category text not null,
  sub text not null default '',
  city text not null,
  area text not null default '',
  address text not null default '',
  phone text not null default '',
  description text not null default '',
  hours text not null default '10:00 am – 8:00 pm',
  price text not null default '',
  tags text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending','approved','rejected','suspended')),
  plan text not null default 'free' check (plan in ('free','premium','platinum')),
  requested_plan text check (requested_plan in ('premium','platinum')),
  verified boolean not null default false,
  sponsored boolean not null default false,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.businesses to anon;
grant select, insert, update, delete on public.businesses to authenticated;
grant all on public.businesses to service_role;
alter table public.businesses enable row level security;
create policy "public approved" on public.businesses for select to anon, authenticated using (status = 'approved');
create policy "owner reads own" on public.businesses for select to authenticated using (owner_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "owner inserts" on public.businesses for insert to authenticated with check (owner_id = auth.uid());
create policy "owner or admin updates" on public.businesses for update to authenticated using (owner_id = auth.uid() or public.has_role(auth.uid(),'admin')) with check (owner_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "owner or admin deletes" on public.businesses for delete to authenticated using (owner_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create or replace function public.guard_business()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  new.updated_at := now();
  if public.has_role(auth.uid(), 'admin') then return new; end if;
  if tg_op = 'INSERT' then
    new.status := 'pending'; new.plan := 'free'; new.verified := false; new.sponsored := false; new.admin_note := null;
  else
    new.status := case when old.status = 'rejected' then 'pending' else old.status end;
    new.plan := old.plan; new.verified := old.verified; new.sponsored := old.sponsored; new.admin_note := old.admin_note; new.owner_id := old.owner_id;
  end if;
  return new;
end; $$;
create trigger guard_business before insert or update on public.businesses for each row execute function public.guard_business();

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  phone text not null check (phone ~ '^[6-9][0-9]{9}$'),
  message text not null default '' check (char_length(message) <= 1000),
  status text not null default 'new' check (status in ('new','contacted','won','lost')),
  created_at timestamptz not null default now()
);
grant insert on public.leads to anon;
grant select, insert, update, delete on public.leads to authenticated;
grant all on public.leads to service_role;
alter table public.leads enable row level security;
create policy "anyone can enquire approved" on public.leads for insert to anon, authenticated with check (exists (select 1 from public.businesses b where b.id = business_id and b.status = 'approved'));
create policy "owner/admin read leads" on public.leads for select to authenticated using (public.has_role(auth.uid(),'admin') or exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()));
create policy "owner/admin update leads" on public.leads for update to authenticated using (public.has_role(auth.uid(),'admin') or exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()));
create policy "admin delete leads" on public.leads for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid,
  name text not null check (char_length(name) between 1 and 80),
  rating int not null check (rating between 1 and 5),
  text text not null check (char_length(text) between 10 and 2000),
  status text not null default 'published' check (status in ('published','hidden')),
  owner_reply text,
  created_at timestamptz not null default now()
);
grant select, insert on public.reviews to anon;
grant select, insert, update, delete on public.reviews to authenticated;
grant all on public.reviews to service_role;
alter table public.reviews enable row level security;
create policy "public published reviews" on public.reviews for select to anon, authenticated using (status = 'published' and exists (select 1 from public.businesses b where b.id = business_id and b.status='approved'));
create policy "owner/admin read reviews" on public.reviews for select to authenticated using (public.has_role(auth.uid(),'admin') or exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()));
create policy "anyone writes review" on public.reviews for insert to anon, authenticated with check (status = 'published' and owner_reply is null and exists (select 1 from public.businesses b where b.id = business_id and b.status='approved'));
create policy "owner/admin update reviews" on public.reviews for update to authenticated using (public.has_role(auth.uid(),'admin') or exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()));
create policy "admin delete reviews" on public.reviews for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create or replace function public.guard_review()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if public.has_role(auth.uid(), 'admin') then return new; end if;
  new.status := old.status; new.rating := old.rating; new.text := old.text; new.name := old.name; new.business_id := old.business_id;
  return new;
end; $$;
create trigger guard_review before update on public.reviews for each row execute function public.guard_review();