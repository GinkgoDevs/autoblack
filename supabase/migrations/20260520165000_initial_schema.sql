-- Initial schema for Autoblack raffle purchases.
-- This schema is designed to be used from Next.js server routes with the
-- Supabase service role key. Public clients should not write directly.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'raffle_status') then
    create type public.raffle_status as enum ('draft', 'active', 'finished', 'cancelled');
  end if;

  if not exists (select 1 from pg_type where typname = 'purchase_status') then
    create type public.purchase_status as enum ('pending', 'paid', 'cancelled', 'rejected');
  end if;

  if not exists (select 1 from pg_type where typname = 'raffle_number_status') then
    create type public.raffle_number_status as enum ('available', 'reserved', 'sold');
  end if;

  if not exists (select 1 from pg_type where typname = 'email_event_status') then
    create type public.email_event_status as enum ('queued', 'sent', 'failed');
  end if;
end $$;

create table if not exists public.raffles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  draw_at timestamptz,
  status public.raffle_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint raffles_slug_not_empty check (length(trim(slug)) > 0),
  constraint raffles_title_not_empty check (length(trim(title)) > 0)
);

create table if not exists public.ticket_packs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  chances integer not null,
  price_cents integer not null,
  currency text not null default 'ARS',
  badge text,
  active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ticket_packs_slug_not_empty check (length(trim(slug)) > 0),
  constraint ticket_packs_name_not_empty check (length(trim(name)) > 0),
  constraint ticket_packs_chances_positive check (chances > 0),
  constraint ticket_packs_price_positive check (price_cents > 0),
  constraint ticket_packs_currency_not_empty check (length(trim(currency)) = 3)
);

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  purchase_code text not null unique default ('AB-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  raffle_id uuid not null references public.raffles(id) on delete restrict,
  ticket_pack_id uuid references public.ticket_packs(id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  customer_dni text,
  pack_name text not null,
  quantity integer not null,
  amount_cents integer not null,
  currency text not null default 'ARS',
  status public.purchase_status not null default 'pending',
  transfer_reference text,
  receipt_bucket text,
  receipt_path text,
  receipt_original_name text,
  receipt_mime_type text,
  customer_notes text,
  admin_notes text,
  assigned_numbers text[] not null default '{}',
  paid_at timestamptz,
  cancelled_at timestamptz,
  rejected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint purchases_customer_name_not_empty check (length(trim(customer_name)) > 0),
  constraint purchases_customer_email_valid check (customer_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  constraint purchases_customer_phone_not_empty check (length(trim(customer_phone)) > 0),
  constraint purchases_pack_name_not_empty check (length(trim(pack_name)) > 0),
  constraint purchases_quantity_positive check (quantity > 0),
  constraint purchases_amount_positive check (amount_cents > 0),
  constraint purchases_currency_not_empty check (length(trim(currency)) = 3),
  constraint purchases_paid_has_numbers check (
    status <> 'paid'
    or (
      paid_at is not null
      and array_length(assigned_numbers, 1) = quantity
    )
  )
);

create table if not exists public.raffle_numbers (
  id uuid primary key default gen_random_uuid(),
  raffle_id uuid not null references public.raffles(id) on delete cascade,
  number text not null,
  status public.raffle_number_status not null default 'available',
  purchase_id uuid references public.purchases(id) on delete set null,
  assigned_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint raffle_numbers_number_not_empty check (length(trim(number)) > 0),
  constraint raffle_numbers_assignment_consistent check (
    (
      status = 'available'
      and purchase_id is null
      and assigned_at is null
    )
    or (
      status in ('reserved', 'sold')
      and purchase_id is not null
    )
  ),
  constraint raffle_numbers_unique_per_raffle unique (raffle_id, number)
);

create table if not exists public.email_events (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid references public.purchases(id) on delete set null,
  recipient_email text not null,
  event_type text not null,
  status public.email_event_status not null default 'queued',
  subject text,
  resend_id text,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  constraint email_events_recipient_email_valid check (recipient_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  constraint email_events_event_type_not_empty check (length(trim(event_type)) > 0)
);

create index if not exists raffles_status_idx on public.raffles(status);
create index if not exists ticket_packs_active_order_idx on public.ticket_packs(active, display_order);
create index if not exists purchases_status_created_at_idx on public.purchases(status, created_at desc);
create index if not exists purchases_customer_email_idx on public.purchases(lower(customer_email));
create index if not exists purchases_raffle_id_idx on public.purchases(raffle_id);
create index if not exists raffle_numbers_raffle_status_idx on public.raffle_numbers(raffle_id, status, number);
create index if not exists raffle_numbers_purchase_id_idx on public.raffle_numbers(purchase_id);
create index if not exists email_events_purchase_id_idx on public.email_events(purchase_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_raffles_updated_at on public.raffles;
create trigger set_raffles_updated_at
before update on public.raffles
for each row execute function public.set_updated_at();

drop trigger if exists set_ticket_packs_updated_at on public.ticket_packs;
create trigger set_ticket_packs_updated_at
before update on public.ticket_packs
for each row execute function public.set_updated_at();

drop trigger if exists set_purchases_updated_at on public.purchases;
create trigger set_purchases_updated_at
before update on public.purchases
for each row execute function public.set_updated_at();

drop trigger if exists set_raffle_numbers_updated_at on public.raffle_numbers;
create trigger set_raffle_numbers_updated_at
before update on public.raffle_numbers
for each row execute function public.set_updated_at();

alter table public.raffles enable row level security;
alter table public.ticket_packs enable row level security;
alter table public.purchases enable row level security;
alter table public.raffle_numbers enable row level security;
alter table public.email_events enable row level security;
