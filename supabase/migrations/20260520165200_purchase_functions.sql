-- Server-side helpers for admin flows.
-- These functions should be called from Next.js server routes with the
-- Supabase service role key.

create or replace function public.create_raffle_numbers(
  p_raffle_id uuid,
  p_start integer default 0,
  p_end integer default 9999,
  p_width integer default 4
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inserted integer;
begin
  if p_raffle_id is null then
    raise exception 'p_raffle_id is required';
  end if;

  if p_start < 0 or p_end < p_start then
    raise exception 'invalid number range';
  end if;

  if p_width < 1 then
    raise exception 'p_width must be greater than zero';
  end if;

  insert into public.raffle_numbers (raffle_id, number, status)
  select
    p_raffle_id,
    lpad(value::text, p_width, '0'),
    'available'::public.raffle_number_status
  from generate_series(p_start, p_end) as value
  on conflict (raffle_id, number) do nothing;

  get diagnostics v_inserted = row_count;

  return v_inserted;
end;
$$;

create or replace function public.approve_purchase(
  p_purchase_id uuid,
  p_admin_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_purchase public.purchases%rowtype;
  v_number_ids uuid[];
  v_numbers text[];
begin
  if p_purchase_id is null then
    raise exception 'p_purchase_id is required';
  end if;

  perform pg_advisory_xact_lock(hashtext(p_purchase_id::text));

  select *
  into v_purchase
  from public.purchases
  where id = p_purchase_id
  for update;

  if not found then
    raise exception 'purchase not found';
  end if;

  if v_purchase.status = 'paid' then
    return jsonb_build_object(
      'ok', true,
      'alreadyApproved', true,
      'purchaseId', v_purchase.id,
      'purchaseCode', v_purchase.purchase_code,
      'email', v_purchase.customer_email,
      'name', v_purchase.customer_name,
      'numbers', to_jsonb(v_purchase.assigned_numbers)
    );
  end if;

  if v_purchase.status in ('cancelled', 'rejected') then
    raise exception 'purchase cannot be approved because status is %', v_purchase.status;
  end if;

  select
    coalesce(array_agg(id order by number), '{}'::uuid[]),
    coalesce(array_agg(number order by number), '{}'::text[])
  into v_number_ids, v_numbers
  from (
    select id, number
    from public.raffle_numbers
    where raffle_id = v_purchase.raffle_id
      and status = 'available'
    order by number
    limit v_purchase.quantity
    for update skip locked
  ) available_numbers;

  if cardinality(v_number_ids) < v_purchase.quantity then
    raise exception 'not enough available raffle numbers';
  end if;

  update public.raffle_numbers
  set
    status = 'sold',
    purchase_id = v_purchase.id,
    assigned_at = now()
  where id = any(v_number_ids);

  update public.purchases
  set
    status = 'paid',
    assigned_numbers = v_numbers,
    paid_at = now(),
    admin_notes = coalesce(p_admin_notes, admin_notes)
  where id = v_purchase.id
  returning * into v_purchase;

  return jsonb_build_object(
    'ok', true,
    'purchaseId', v_purchase.id,
    'purchaseCode', v_purchase.purchase_code,
    'email', v_purchase.customer_email,
    'name', v_purchase.customer_name,
    'numbers', to_jsonb(v_numbers),
    'status', v_purchase.status
  );
end;
$$;

create or replace function public.cancel_purchase(
  p_purchase_id uuid,
  p_admin_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_purchase public.purchases%rowtype;
begin
  if p_purchase_id is null then
    raise exception 'p_purchase_id is required';
  end if;

  select *
  into v_purchase
  from public.purchases
  where id = p_purchase_id
  for update;

  if not found then
    raise exception 'purchase not found';
  end if;

  if v_purchase.status = 'paid' then
    raise exception 'paid purchases cannot be cancelled by this function';
  end if;

  update public.purchases
  set
    status = 'cancelled',
    cancelled_at = now(),
    admin_notes = coalesce(p_admin_notes, admin_notes)
  where id = p_purchase_id
  returning * into v_purchase;

  return jsonb_build_object(
    'ok', true,
    'purchaseId', v_purchase.id,
    'purchaseCode', v_purchase.purchase_code,
    'status', v_purchase.status
  );
end;
$$;

create or replace function public.reject_purchase(
  p_purchase_id uuid,
  p_admin_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_purchase public.purchases%rowtype;
begin
  if p_purchase_id is null then
    raise exception 'p_purchase_id is required';
  end if;

  select *
  into v_purchase
  from public.purchases
  where id = p_purchase_id
  for update;

  if not found then
    raise exception 'purchase not found';
  end if;

  if v_purchase.status = 'paid' then
    raise exception 'paid purchases cannot be rejected';
  end if;

  update public.purchases
  set
    status = 'rejected',
    rejected_at = now(),
    admin_notes = coalesce(p_admin_notes, admin_notes)
  where id = p_purchase_id
  returning * into v_purchase;

  return jsonb_build_object(
    'ok', true,
    'purchaseId', v_purchase.id,
    'purchaseCode', v_purchase.purchase_code,
    'status', v_purchase.status
  );
end;
$$;

create or replace function public.record_email_event(
  p_purchase_id uuid,
  p_recipient_email text,
  p_event_type text,
  p_status public.email_event_status,
  p_subject text default null,
  p_resend_id text default null,
  p_error_message text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event_id uuid;
begin
  insert into public.email_events (
    purchase_id,
    recipient_email,
    event_type,
    status,
    subject,
    resend_id,
    error_message,
    sent_at
  )
  values (
    p_purchase_id,
    p_recipient_email,
    p_event_type,
    p_status,
    p_subject,
    p_resend_id,
    p_error_message,
    case when p_status = 'sent' then now() else null end
  )
  returning id into v_event_id;

  return v_event_id;
end;
$$;

revoke all on function public.create_raffle_numbers(uuid, integer, integer, integer) from public;
revoke all on function public.approve_purchase(uuid, text) from public;
revoke all on function public.cancel_purchase(uuid, text) from public;
revoke all on function public.reject_purchase(uuid, text) from public;
revoke all on function public.record_email_event(uuid, text, text, public.email_event_status, text, text, text) from public;

grant execute on function public.create_raffle_numbers(uuid, integer, integer, integer) to service_role;
grant execute on function public.approve_purchase(uuid, text) to service_role;
grant execute on function public.cancel_purchase(uuid, text) to service_role;
grant execute on function public.reject_purchase(uuid, text) to service_role;
grant execute on function public.record_email_event(uuid, text, text, public.email_event_status, text, text, text) to service_role;
