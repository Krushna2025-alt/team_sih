-- KrishiLink initial schema
create extension if not exists pgcrypto;

create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text,
  email text,
  role text not null check (role in ('farmer','buyer','admin')),
  language_preference text not null default 'en' check (language_preference in ('en','hi','mr')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table farmers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users(id) on delete cascade,
  farm_name text not null,
  location text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  reliability_score numeric(3,2) check (reliability_score between 0 and 5),
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((latitude is null) = (longitude is null))
);

create table buyers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users(id) on delete cascade,
  institution_name text not null,
  institution_type text not null default 'other',
  location text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  reliability_score numeric(3,2) check (reliability_score between 0 and 5),
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((latitude is null) = (longitude is null))
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  name_en text, name_hi text, name_mr text
);

create table products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id),
  name text not null unique,
  unit text not null default 'kg',
  created_at timestamptz not null default now()
);

create table listings (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid not null references farmers(id) on delete cascade,
  product_id uuid not null references products(id),
  quantity_kg numeric(12,2) not null check (quantity_kg > 0),
  price_per_kg numeric(10,2) not null check (price_per_kg >= 0),
  quality_grade text not null check (quality_grade in ('A','B','C')),
  availability_date date not null,
  delivery_option text not null default 'farmer_delivery' check (delivery_option in ('farmer_delivery','buyer_pickup')),
  status text not null default 'active' check (status in ('active','inactive','sold_out','expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table product_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  image_url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table demands (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references buyers(id) on delete cascade,
  product_id uuid not null references products(id),
  quantity_kg numeric(12,2) not null check (quantity_kg > 0),
  min_price numeric(10,2) check (min_price >= 0),
  max_price numeric(10,2) check (max_price >= 0),
  required_date date not null,
  delivery_address text,
  notes text,
  status text not null default 'open' check (status in ('open','closed','fulfilled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (min_price is null or max_price is null or max_price >= min_price)
);

create table bulk_deals (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid not null references farmers(id) on delete cascade,
  product_id uuid not null references products(id),
  quantity_kg numeric(12,2) not null check (quantity_kg > 0),
  min_quantity_kg numeric(12,2) not null check (min_quantity_kg >= 50),
  base_price numeric(10,2) not null check (base_price >= 0),
  closes_at timestamptz not null,
  status text not null default 'open' check (status in ('open','closed','awarded','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (min_quantity_kg <= quantity_kg)
);

create table bulk_offers (
  id uuid primary key default gen_random_uuid(),
  bulk_deal_id uuid not null references bulk_deals(id) on delete cascade,
  buyer_id uuid not null references buyers(id) on delete cascade,
  offered_quantity numeric(12,2) not null check (offered_quantity > 0),
  offered_price numeric(10,2) not null check (offered_price >= 0),
  delivery_date date,
  smart_score numeric(5,2),
  score_reasons jsonb not null default '[]',
  status text not null default 'pending' check (status in ('pending','accepted','rejected','withdrawn')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (bulk_deal_id, buyer_id)
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references buyers(id),
  farmer_id uuid not null references farmers(id),
  total_amount numeric(12,2) not null check (total_amount >= 0),
  status text not null default 'pending' check (status in ('pending','confirmed','dispatched','delivered','rejected','cancelled')),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  listing_id uuid references listings(id),
  product_id uuid not null references products(id),
  quantity_kg numeric(12,2) not null check (quantity_kg > 0),
  price_per_kg numeric(10,2) not null check (price_per_kg >= 0),
  subtotal numeric(12,2) not null check (subtotal >= 0)
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  amount numeric(12,2) not null check (amount >= 0),
  payment_method text not null default 'mock',
  gateway_reference text,
  status text not null default 'pending' check (status in ('pending','paid','failed')),
  created_at timestamptz not null default now()
);
-- NOTE: never store card numbers / UPI credentials / payment secrets.

create table deliveries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references orders(id) on delete cascade,
  pickup_address text,
  delivery_address text,
  status text not null default 'pending' check (status in ('pending','dispatched','delivered')),
  estimated_delivery date,
  actual_delivery timestamptz,
  created_at timestamptz not null default now()
);

create table ratings (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  rater_id uuid not null references users(id) on delete cascade,
  rated_id uuid not null references users(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (order_id, rater_id),
  check (rater_id <> rated_id)
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table farmer_earnings (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid not null references farmers(id),
  order_id uuid not null unique references orders(id),
  gross_amount numeric(12,2) not null check (gross_amount >= 0),
  platform_fee numeric(12,2) not null default 0 check (platform_fee >= 0),
  net_amount numeric(12,2) not null check (net_amount >= 0),
  created_at timestamptz not null default now()
);

create table disputes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  raised_by uuid not null references users(id),
  reason text not null,
  status text not null default 'open' check (status in ('open','resolved','rejected')),
  resolution text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references users(id),
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_listings_product on listings(product_id);
create index idx_listings_status on listings(status);
create index idx_listings_availability on listings(availability_date);
create index idx_farmers_location on farmers(latitude, longitude);
create index idx_demands_product on demands(product_id);
create index idx_demands_required_date on demands(required_date);
create index idx_orders_buyer on orders(buyer_id);
create index idx_orders_farmer on orders(farmer_id);
create index idx_orders_status on orders(status);
create index idx_notifications_user on notifications(user_id, is_read);
create index idx_bulk_offers_deal on bulk_offers(bulk_deal_id);

-- Enable RLS everywhere. Backend uses the service role (server-only);
-- direct anon-key access from the frontend is blocked.
do $$ declare t text; begin
  for t in select tablename from pg_tables where schemaname = 'public'
  loop execute format('alter table public.%I enable row level security;', t);
  end loop;
end $$;

