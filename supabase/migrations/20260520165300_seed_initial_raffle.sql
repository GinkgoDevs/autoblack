-- Initial raffle, ticket packs, and number pool.
-- Adjust prices/dates before applying in production if needed.

insert into public.raffles (
  slug,
  title,
  description,
  draw_at,
  status
)
values (
  'triple-sorteo-vehiculos-2026',
  'Triple sorteo de vehiculos 2026',
  'Pack de cursos Autoblack con chances para participar por vehiculos y premios.',
  '2026-06-10 22:00:00-03',
  'active'
)
on conflict (slug) do update
set
  title = excluded.title,
  description = excluded.description,
  draw_at = excluded.draw_at,
  status = excluded.status;

insert into public.ticket_packs (
  slug,
  name,
  description,
  chances,
  price_cents,
  currency,
  badge,
  active,
  display_order
)
values
  (
    'pack-1-chance',
    'Pack 1 chance',
    'Incluye acceso al pack de cursos y 1 chance para el sorteo.',
    1,
    500000,
    'ARS',
    null,
    true,
    10
  ),
  (
    'pack-3-chances',
    'Pack 3 chances',
    'Incluye acceso al pack de cursos y 3 chances para el sorteo.',
    3,
    1200000,
    'ARS',
    'POPULAR',
    true,
    20
  ),
  (
    'pack-10-chances',
    'Pack 10 chances',
    'Incluye acceso al pack de cursos y 10 chances para el sorteo.',
    10,
    3500000,
    'ARS',
    null,
    true,
    30
  ),
  (
    'pack-20-chances',
    'Pack 20 chances',
    'Incluye acceso al pack de cursos y 20 chances para el sorteo.',
    20,
    6000000,
    'ARS',
    'MEJOR VALOR',
    true,
    40
  ),
  (
    'pack-100-chances',
    'Pack 100 chances',
    'Incluye acceso al pack de cursos y 100 chances para el sorteo.',
    100,
    25000000,
    'ARS',
    null,
    true,
    50
  )
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  chances = excluded.chances,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  badge = excluded.badge,
  active = excluded.active,
  display_order = excluded.display_order;

select public.create_raffle_numbers(
  (
    select id
    from public.raffles
    where slug = 'triple-sorteo-vehiculos-2026'
  ),
  0,
  9999,
  4
);
