-- Ensure all required categories exist before updating or inserting articles
INSERT INTO public.categories (slug, name, description, icon) VALUES
  ('design',     'Design',              'Cards, posters, flyers & more',              '🎨'),
  ('ai',         'AI Generators',       'Names, captions, stories',                   '🪄'),
  ('pumpkin',    'Pumpkin',             'Templates, stencils, faces',                 '🎃'),
  ('party',      'Party',               'Planners & invitations',                     '🥳'),
  ('images',     'Images',              'Wallpapers & stickers',                      '🖼️'),
  ('printables', 'Printables',          'Coloring pages & activities',                '🖨️'),
  ('social',     'Social',              'Captions, hashtags, memes',                  '📱'),
  ('wishes',     'Wishes & Quotes',     'Messages that spark joy',                    '🌙'),
  ('ideas',      'Ideas & Inspiration', 'Costumes, themes, and creative ideas',       '💡'),
  ('history',    'History & Lore',      'Origins, traditions, and Halloween lore',    '📜'),
  ('safety',     'Safety & Tips',       'Trick-or-treating and family safety guides', '🛡️')
ON CONFLICT (slug) DO NOTHING;

-- Map articles category_id to valid category IDs based on article slugs
UPDATE public.articles a
SET category_id = c.id
FROM public.categories c
WHERE a.category_id IS NULL AND (
  (a.slug = 'best-halloween-costume-ideas-2026' AND c.slug = 'ideas') OR
  (a.slug = 'pumpkin-carving-guide' AND c.slug = 'pumpkin') OR
  (a.slug = 'halloween-party-planning-checklist' AND c.slug = 'party') OR
  (a.slug = 'history-of-halloween' AND c.slug = 'history') OR
  (a.slug = 'halloween-safety-tips-kids' AND c.slug = 'safety') OR
  (a.slug = 'diy-halloween-decorations' AND c.slug = 'design')
);
