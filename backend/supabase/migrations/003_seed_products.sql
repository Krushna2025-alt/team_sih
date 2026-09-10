insert into categories (name, name_en, name_hi, name_mr) values
  ('vegetables', 'Vegetables', 'sabziyan', 'bhaajya'),
  ('grains', 'Grains', 'anaaj', 'dhaanya')
on conflict (name) do nothing;

insert into products (category_id, name, unit)
select c.id, v.name, 'kg'
from (values
  ('vegetables','onion'), ('vegetables','potato'), ('vegetables','tomato'),
  ('grains','wheat'), ('grains','rice')
) as v(cat, name)
join categories c on c.name = v.cat
on conflict (name) do nothing;

