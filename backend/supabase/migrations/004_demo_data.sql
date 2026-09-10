-- OPTIONAL demo data. Register two demo users through the app first
-- (POST /api/v1/auth/profile after Supabase signup):
--   farmer@demo.com  -> role farmer, farm_name: 'Demo Farm', lat 18.5204, lng 73.8567
--   buyer@demo.com   -> role buyer, institution_name: 'Demo Hostel', same coords
do $$ declare f uuid; b uuid; v_onion uuid; v_potato uuid;
begin
  select id into f from farmers where farm_name = 'Demo Farm' limit 1;
  select id into b from buyers where institution_name = 'Demo Hostel' limit 1;
  select id into v_onion from products where name = 'onion';
  select id into v_potato from products where name = 'potato';

  if f is not null and b is not null and v_onion is not null and v_potato is not null then
    insert into listings (farmer_id, product_id, quantity_kg, price_per_kg, quality_grade, availability_date, delivery_option)
    values (f, v_onion, 500, 24.50, 'A', current_date + 7, 'farmer_delivery'),
           (f, v_potato, 300, 18.00, 'B', current_date + 5, 'buyer_pickup');

    insert into demands (buyer_id, product_id, quantity_kg, min_price, max_price, required_date, delivery_address)
    values (b, v_onion, 200, 20, 26, current_date + 10, 'Demo Hostel, Pune');

    insert into bulk_deals (farmer_id, product_id, quantity_kg, min_quantity_kg, base_price, closes_at)
    values (f, v_potato, 1000, 100, 16.50, now() + interval '7 days');
  end if;
end $$;

