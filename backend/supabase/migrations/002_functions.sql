-- updated_at touch trigger
create or replace function fn_touch_updated_at() returns trigger as $$ begin new.updated_at = now(); return new; end;
 $$ language plpgsql;

do $$ declare t text; begin
  for t in select tablename from pg_tables where schemaname='public'
  loop
    if exists (select 1 from information_schema.columns where table_schema='public' and table_name=t and column_name='updated_at') then
      execute format('drop trigger if exists trg_%s_touch on public.%I;', t, t);
      execute format('create trigger trg_%s_touch before update on public.%I for each row execute function fn_touch_updated_at();', t, t);
    end if;
  end loop;
end $$;

-- ORDER CREATION (critical operation) - one atomic transaction.
-- Server-side price, server-side totals, inventory guard, auto rollback on any failure.
create or replace function fn_create_order(p_buyer_id uuid, p_delivery_address text, p_items jsonb)
returns jsonb language plpgsql security definer as $$ declare
  v_order_id uuid; v_item jsonb; v_listing record;
  v_qty numeric; v_price numeric; v_subtotal numeric;
  v_total numeric := 0; v_farmer_id uuid; v_first boolean := true;
begin
  if p_items is null or jsonb_array_length(p_items) = 0 then raise exception 'INVALID_ITEMS'; end if;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := (v_item->>'quantity_kg')::numeric;
    if v_qty is null or v_qty <= 0 then raise exception 'INVALID_QUANTITY'; end if;

    select * into v_listing from listings where id = (v_item->>'listing_id')::uuid for update;
    if v_listing is null then raise exception 'LISTING_NOT_FOUND'; end if;
    if v_listing.status <> 'active' then raise exception 'LISTING_INACTIVE'; end if;
    if v_listing.quantity_kg < v_qty then raise exception 'INSUFFICIENT_QUANTITY'; end if;

    v_price := v_listing.price_per_kg;              -- server-side price, never client
    v_subtotal := round(v_price * v_qty, 2);        -- server-side subtotal
    v_total := v_total + v_subtotal;                -- server-side total

    if v_first then v_farmer_id := v_listing.farmer_id; v_first := false;
    elsif v_listing.farmer_id <> v_farmer_id then raise exception 'MULTIPLE_FARMERS'; end if;
  end loop;

  insert into orders (buyer_id, farmer_id, total_amount, status, payment_status)
  values (p_buyer_id, v_farmer_id, v_total, 'pending', 'pending')
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    select * into v_listing from listings where id = (v_item->>'listing_id')::uuid for update;
    v_qty := (v_item->>'quantity_kg')::numeric;
    v_price := v_listing.price_per_kg;

    insert into order_items (order_id, listing_id, product_id, quantity_kg, price_per_kg, subtotal)
    values (v_order_id, v_listing.id, v_listing.product_id, v_qty, v_price, round(v_price * v_qty, 2));

    update listings
       set quantity_kg = quantity_kg - v_qty,
           status = case when quantity_kg - v_qty <= 0 then 'sold_out' else status end
     where id = v_listing.id;
  end loop;

  insert into payments (order_id, amount, payment_method, status)
  values (v_order_id, v_total, 'mock', 'pending');

  insert into deliveries (order_id, delivery_address, status)
  values (v_order_id, p_delivery_address, 'pending');

  insert into farmer_earnings (farmer_id, order_id, gross_amount, platform_fee, net_amount)
  values (v_farmer_id, v_order_id, v_total, round(v_total * 0.02, 2), round(v_total * 0.98, 2));

  return jsonb_build_object('order_id', v_order_id, 'total_amount', v_total, 'farmer_id', v_farmer_id);
end; $$;

-- Restock on reject/cancel
create or replace function fn_restock_order(p_order_id uuid) returns void
language plpgsql security definer as $$ begin
  update listings l
     set quantity_kg = l.quantity_kg + oi.quantity_kg,
         status = case when l.status = 'sold_out' then 'active' else l.status end
    from order_items oi
   where oi.order_id = p_order_id and oi.listing_id = l.id;
end; $$;

-- Automatic expiry (listings / demands / bulk deals)
create or replace function fn_expire_entities() returns void
language sql security definer as $$   update listings set status = 'expired' where status = 'active' and availability_date < current_date;
  update demands set status = 'closed' where status = 'open' and required_date < current_date;
  update bulk_deals set status = 'closed' where status = 'open' and closes_at < now();
 $$;

