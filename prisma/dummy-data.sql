BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO homepage_settings (
  id, company_name, logo_url, logo_public_id, logo_alt_text,
  phone, email, address_line_1, address_line_2,
  privacy_policy_text, privacy_policy_url, footer_text
)
VALUES (
  1,
  'BIO CWT',
  'https://placehold.co/268x114/1E0C06/FFFFFF?text=BIO+CWT',
  'dummy/site/logo',
  'BIO CWT company logo',
  '+420 000 000 000',
  'info@biocwt.cz',
  'Na Plzeňce 1166/1',
  '150 00 Prague 5, Czech Republic',
  'Privacy Policy',
  '/privacy-policy',
  '© 2026 BIO CWT. All rights reserved.'
)
ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  address_line_1 = EXCLUDED.address_line_1,
  address_line_2 = EXCLUDED.address_line_2,
  privacy_policy_text = EXCLUDED.privacy_policy_text,
  privacy_policy_url = EXCLUDED.privacy_policy_url,
  footer_text = EXCLUDED.footer_text,
  updated_at = NOW();

INSERT INTO homepage_sections (
  id, section_key, section_type, title, subtitle, body,
  button_text, button_link, display_order, is_active
)
VALUES
  ('10000000-0000-4000-8000-000000000001', 'hero', 'hero',
   E'SOLID\nWOOD\nPRODUCTS', NULL,
   'Oak, beech, ash from 1700 CZK per m3', 'Order', '#contact', 0, TRUE),
  ('10000000-0000-4000-8000-000000000002', 'wood-types', 'product-grid',
   E'THE WOOD WE\nWORK WITH', NULL, NULL, NULL, NULL, 1, TRUE),
  ('10000000-0000-4000-8000-000000000003', 'our-work', 'gallery',
   'OUR WORK', NULL, NULL, NULL, NULL, 2, TRUE),
  ('10000000-0000-4000-8000-000000000004', 'advantages', 'list',
   E'ADVANTAGES\nWORKING WITH US', NULL, NULL,
   'Receive a consultation', '#contact', 3, TRUE),
  ('10000000-0000-4000-8000-000000000005', 'about', 'split',
   'ABOUT US', NULL,
   'BIO CWT - We manufacture solid wood products according to individual drawings. We make chairs, armchairs, wardrobes, beds and much more in our own workshop, equipped with all the necessary industrial equipment.',
   NULL, NULL, 4, TRUE),
  ('10000000-0000-4000-8000-000000000006', 'contact', 'contact',
   'ANY QUESTIONS?',
   'Write to us and we will be sure to answer all your questions and give you a comprehensive consultation.',
   NULL, 'Send', NULL, 5, TRUE)
ON CONFLICT (section_key) DO UPDATE SET
  section_type = EXCLUDED.section_type,
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  body = EXCLUDED.body,
  button_text = EXCLUDED.button_text,
  button_link = EXCLUDED.button_link,
  display_order = EXCLUDED.display_order,
  is_active = TRUE,
  updated_at = NOW();

INSERT INTO homepage_section_items (
  id, section_id, title, description, icon_name, display_order, is_active
)
VALUES
  ('20000000-0000-4000-8000-000000000001', (SELECT id FROM homepage_sections WHERE section_key = 'wood-types'), 'Oak',
   E'+ Durability\n+ Beautiful texture\n+ Water resistance\n- Expensive', NULL, 0, TRUE),
  ('20000000-0000-4000-8000-000000000002', (SELECT id FROM homepage_sections WHERE section_key = 'wood-types'), 'Beech',
   E'+ Durability\n+ Smooth texture\n- Hard to handle\n- Requires regular care', NULL, 1, TRUE),
  ('20000000-0000-4000-8000-000000000003', (SELECT id FROM homepage_sections WHERE section_key = 'wood-types'), 'Ash',
   E'+ Flexible and strong\n+ Attractive grain\n- Sensitive to moisture\n- Hard to handle', NULL, 2, TRUE),
  ('20000000-0000-4000-8000-000000000004', (SELECT id FROM homepage_sections WHERE section_key = 'advantages'), NULL,
   'In-house carpentry production', NULL, 0, TRUE),
  ('20000000-0000-4000-8000-000000000005', (SELECT id FROM homepage_sections WHERE section_key = 'advantages'), NULL,
   'We only treat wood with environmentally friendly and safe products', NULL, 1, TRUE),
  ('20000000-0000-4000-8000-000000000006', (SELECT id FROM homepage_sections WHERE section_key = 'advantages'), NULL,
   'Prices directly from the manufacturer with no extra charges', NULL, 2, TRUE),
  ('20000000-0000-4000-8000-000000000007', (SELECT id FROM homepage_sections WHERE section_key = 'contact'), 'Your name',
   'Enter your full name', 'name', 0, TRUE),
  ('20000000-0000-4000-8000-000000000008', (SELECT id FROM homepage_sections WHERE section_key = 'contact'), 'Your telephone number',
   'Enter your telephone number', 'phone', 1, TRUE),
  ('20000000-0000-4000-8000-000000000009', (SELECT id FROM homepage_sections WHERE section_key = 'contact'), 'Your question',
   'Describe the product or service you need', 'question', 2, TRUE)
ON CONFLICT (id) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  display_order = EXCLUDED.display_order,
  is_active = TRUE,
  updated_at = NOW();

INSERT INTO homepage_section_images (
  id, section_id, image_url, image_public_id, alt_text,
  caption, display_order, is_primary, is_active
)
VALUES
  ('30000000-0000-4000-8000-000000000001', (SELECT id FROM homepage_sections WHERE section_key = 'hero'),
   'https://placehold.co/600x600/D9D9D9/777777?text=Furniture+Assembly', 'dummy/hero/1', 'Craftsman assembling solid wood furniture', NULL, 0, TRUE, TRUE),
  ('30000000-0000-4000-8000-000000000002', (SELECT id FROM homepage_sections WHERE section_key = 'hero'),
   'https://placehold.co/600x600/E8D4B5/777777?text=Wood+Staircase', 'dummy/hero/2', 'Modern spiral staircase made from wood', NULL, 1, FALSE, TRUE),
  ('30000000-0000-4000-8000-000000000003', (SELECT id FROM homepage_sections WHERE section_key = 'hero'),
   'https://placehold.co/600x600/F5F5F5/777777?text=Dining+Table', 'dummy/hero/3', 'Modern dining table made from solid wood', NULL, 2, FALSE, TRUE),
  ('30000000-0000-4000-8000-000000000004', (SELECT id FROM homepage_sections WHERE section_key = 'wood-types'),
   'https://placehold.co/600x600/A87C52/FFFFFF?text=Oak', 'dummy/materials/oak', 'Oak wood grain', 'Oak', 0, TRUE, TRUE),
  ('30000000-0000-4000-8000-000000000005', (SELECT id FROM homepage_sections WHERE section_key = 'wood-types'),
   'https://placehold.co/600x600/E2C49A/555555?text=Beech', 'dummy/materials/beech', 'Beech wood grain', 'Beech', 1, FALSE, TRUE),
  ('30000000-0000-4000-8000-000000000006', (SELECT id FROM homepage_sections WHERE section_key = 'wood-types'),
   'https://placehold.co/600x600/D8CCB8/555555?text=Ash', 'dummy/materials/ash', 'Ash wood grain', 'Ash', 2, FALSE, TRUE),
  ('30000000-0000-4000-8000-000000000007', (SELECT id FROM homepage_sections WHERE section_key = 'our-work'),
   'https://placehold.co/1200x800/8B5E3C/FFFFFF?text=Modern+Wood+Kitchen', 'dummy/gallery/1', 'Modern kitchen with solid wood cabinets', 'Kitchen project', 0, TRUE, TRUE),
  ('30000000-0000-4000-8000-000000000008', (SELECT id FROM homepage_sections WHERE section_key = 'our-work'),
   'https://placehold.co/1200x800/9C7654/FFFFFF?text=Custom+Staircase', 'dummy/gallery/2', 'Custom wooden staircase', 'Staircase project', 1, FALSE, TRUE),
  ('30000000-0000-4000-8000-000000000009', (SELECT id FROM homepage_sections WHERE section_key = 'our-work'),
   'https://placehold.co/1200x800/B68B63/FFFFFF?text=Dining+Furniture', 'dummy/gallery/3', 'Handcrafted dining-room furniture', 'Dining project', 2, FALSE, TRUE),
  ('30000000-0000-4000-8000-000000000010', (SELECT id FROM homepage_sections WHERE section_key = 'advantages'),
   'https://placehold.co/900x570/6F513D/FFFFFF?text=Wood+Workshop', 'dummy/advantages/1', 'Professional wood workshop', NULL, 0, TRUE, TRUE),
  ('30000000-0000-4000-8000-000000000011', (SELECT id FROM homepage_sections WHERE section_key = 'about'),
   'https://placehold.co/700x700/5F7A61/FFFFFF?text=Workshop+Carpenter', 'dummy/about/1', 'Carpenter working in a professional workshop', NULL, 0, TRUE, TRUE),
  ('30000000-0000-4000-8000-000000000012', (SELECT id FROM homepage_sections WHERE section_key = 'about'),
   'https://placehold.co/500x500/986A45/FFFFFF?text=Measuring+Wood', 'dummy/about/2', 'Craftsman measuring solid wood', NULL, 1, FALSE, TRUE),
  ('30000000-0000-4000-8000-000000000013', (SELECT id FROM homepage_sections WHERE section_key = 'about'),
   'https://placehold.co/500x500/A7774F/FFFFFF?text=Project+Planning', 'dummy/about/3', 'Carpenter preparing project plans', NULL, 2, FALSE, TRUE)
ON CONFLICT (id) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  image_url = EXCLUDED.image_url,
  image_public_id = EXCLUDED.image_public_id,
  alt_text = EXCLUDED.alt_text,
  caption = EXCLUDED.caption,
  display_order = EXCLUDED.display_order,
  is_primary = EXCLUDED.is_primary,
  is_active = TRUE,
  updated_at = NOW();

INSERT INTO services (
  id, name, slug, short_description, description,
  image_url, image_public_id, image_alt_text, display_order, is_active
)
VALUES
  ('40000000-0000-4000-8000-000000000001', 'Custom Furniture', 'custom-furniture',
   'Furniture manufactured to your measurements.', 'Design and manufacture of tables, chairs, cabinets, beds, and other custom solid-wood furniture.',
   'https://placehold.co/900x600/7A5235/FFFFFF?text=Custom+Furniture', 'dummy/services/furniture', 'Custom solid wood furniture', 0, TRUE),
  ('40000000-0000-4000-8000-000000000002', 'Interior Carpentry', 'interior-carpentry',
   'Professional carpentry for residential interiors.', 'Wooden stairs, wall panels, built-in storage, doors, and other interior carpentry solutions.',
   'https://placehold.co/900x600/8C674A/FFFFFF?text=Interior+Carpentry', 'dummy/services/carpentry', 'Interior carpentry project', 1, TRUE)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  image_public_id = EXCLUDED.image_public_id,
  image_alt_text = EXCLUDED.image_alt_text,
  display_order = EXCLUDED.display_order,
  is_active = TRUE,
  updated_at = NOW();

INSERT INTO products (
  id, name, slug, short_description, description,
  base_price, currency, price_unit, display_order, is_active
)
VALUES
  ('50000000-0000-4000-8000-000000000001', 'Oak Boards', 'oak-boards',
   'Durable oak boards for furniture and interiors.', 'Kiln-dried oak boards available in several dimensions.', 1700.00, 'CZK', 'm3', 0, TRUE),
  ('50000000-0000-4000-8000-000000000002', 'Beech Boards', 'beech-boards',
   'Smooth and versatile beech boards.', 'Quality beech timber suitable for furniture and joinery.', 1100.00, 'CZK', 'm3', 1, TRUE),
  ('50000000-0000-4000-8000-000000000003', 'Ash Boards', 'ash-boards',
   'Strong ash boards with an attractive grain.', 'Flexible ash timber for furniture and specialist joinery.', 1500.00, 'CZK', 'm3', 2, TRUE)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  base_price = EXCLUDED.base_price,
  currency = EXCLUDED.currency,
  price_unit = EXCLUDED.price_unit,
  display_order = EXCLUDED.display_order,
  is_active = TRUE,
  updated_at = NOW();

INSERT INTO product_features (id, product_id, label, feature_type, display_order)
VALUES
  ('60000000-0000-4000-8000-000000000001', (SELECT id FROM products WHERE slug = 'oak-boards'), 'Durability', 'benefit', 0),
  ('60000000-0000-4000-8000-000000000002', (SELECT id FROM products WHERE slug = 'oak-boards'), 'Beautiful texture', 'benefit', 1),
  ('60000000-0000-4000-8000-000000000003', (SELECT id FROM products WHERE slug = 'oak-boards'), 'Premium price', 'drawback', 2),
  ('60000000-0000-4000-8000-000000000004', (SELECT id FROM products WHERE slug = 'beech-boards'), 'Smooth finish', 'benefit', 0),
  ('60000000-0000-4000-8000-000000000005', (SELECT id FROM products WHERE slug = 'ash-boards'), 'Flexible and strong', 'benefit', 0)
ON CONFLICT (id) DO UPDATE SET
  product_id = EXCLUDED.product_id,
  label = EXCLUDED.label,
  feature_type = EXCLUDED.feature_type,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

INSERT INTO price_lists (
  id, product_id, list_name, item_name, length_mm, width_mm,
  thickness_mm, volume_m3, price_per_m3, price_per_piece,
  currency, display_order, is_active
)
VALUES
  ('70000000-0000-4000-8000-000000000001', (SELECT id FROM products WHERE slug = 'beech-boards'), 'Beech boards', 'Beech premium', 1000, 300, 40, 0.0120, 1100, 462.00, 'CZK', 0, TRUE),
  ('70000000-0000-4000-8000-000000000002', (SELECT id FROM products WHERE slug = 'beech-boards'), 'Beech boards', NULL, 1100, 300, 40, 0.0132, 1100, 508.20, 'CZK', 1, TRUE),
  ('70000000-0000-4000-8000-000000000003', (SELECT id FROM products WHERE slug = 'beech-boards'), 'Beech boards', NULL, 800, 300, 40, 0.0096, 1100, 369.60, 'CZK', 2, TRUE),
  ('70000000-0000-4000-8000-000000000004', (SELECT id FROM products WHERE slug = 'beech-boards'), 'Beech boards', NULL, 900, 300, 40, 0.0108, 1100, 415.80, 'CZK', 3, TRUE),
  ('70000000-0000-4000-8000-000000000005', (SELECT id FROM products WHERE slug = 'beech-boards'), 'Beech zinc', 'Beech zinc', 3000, 400, 20, 0.0240, 1000, 840.00, 'CZK', 4, TRUE),
  ('70000000-0000-4000-8000-000000000006', (SELECT id FROM products WHERE slug = 'beech-boards'), 'Beech zinc', NULL, 4000, 300, 20, 0.0240, 1000, 840.00, 'CZK', 5, TRUE),
  ('70000000-0000-4000-8000-000000000007', (SELECT id FROM products WHERE slug = 'beech-boards'), 'Beech zinc', NULL, 4000, 400, 20, 0.0320, 1000, 1120.00, 'CZK', 6, TRUE)
ON CONFLICT (id) DO UPDATE SET
  product_id = EXCLUDED.product_id,
  list_name = EXCLUDED.list_name,
  item_name = EXCLUDED.item_name,
  length_mm = EXCLUDED.length_mm,
  width_mm = EXCLUDED.width_mm,
  thickness_mm = EXCLUDED.thickness_mm,
  volume_m3 = EXCLUDED.volume_m3,
  price_per_m3 = EXCLUDED.price_per_m3,
  price_per_piece = EXCLUDED.price_per_piece,
  display_order = EXCLUDED.display_order,
  is_active = TRUE,
  updated_at = NOW();

INSERT INTO contact_messages (id, name, phone, email, message, status)
VALUES
  ('80000000-0000-4000-8000-000000000001', 'Jan Novak', '+420 111 222 333', 'jan@example.com', 'I would like a quotation for a custom oak dining table.', 'NEW'),
  ('80000000-0000-4000-8000-000000000002', 'Petra Svobodova', '+420 444 555 666', 'petra@example.com', 'Do you manufacture custom wooden staircases?', 'READ')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  message = EXCLUDED.message,
  status = EXCLUDED.status;

COMMIT;
