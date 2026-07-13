
-- Categories
INSERT INTO public.categories (slug, name, description, icon) VALUES
  ('design',     'Design',           'Cards, posters, flyers & more',   '🎨'),
  ('ai',         'AI Generators',    'Names, captions, stories',        '🪄'),
  ('pumpkin',    'Pumpkin',          'Templates, stencils, faces',      '🎃'),
  ('party',      'Party',            'Planners & invitations',          '🥳'),
  ('images',     'Images',           'Wallpapers & stickers',           '🖼️'),
  ('printables', 'Printables',       'Coloring pages & activities',     '🖨️'),
  ('social',     'Social',           'Captions, hashtags, memes',       '📱'),
  ('wishes',     'Wishes & Quotes',  'Messages that spark joy',         '🌙')
ON CONFLICT (slug) DO NOTHING;

-- Tools
INSERT INTO public.tools (slug, title, description, icon, category_id, status, featured, popular, is_new, published_at)
SELECT v.slug, v.title, v.description, v.icon,
       (SELECT id FROM public.categories c WHERE c.slug = v.cat_slug),
       'published'::content_status, v.featured, v.popular, v.is_new, now()
FROM (VALUES
  ('halloween-card-maker',       'Halloween Card Maker',       'Design spooky greeting cards in seconds.',       '🎃', 'design',      true,  true,  false),
  ('invitation-maker',           'Invitation Maker',           'Craft party invitations guests can''t resist.',  '💌', 'design',      true,  false, false),
  ('poster-maker',               'Poster Maker',               'Bold Halloween posters for any event.',          '🖼️', 'design',     false, true,  false),
  ('banner-maker',               'Banner Maker',               'Web & social banners with a Halloween twist.',   '🏴', 'design',      false, false, false),
  ('flyer-maker',                'Flyer Maker',                'Print-ready flyers for parties and events.',     '📄', 'design',      false, false, false),
  ('logo-maker',                 'Logo Maker',                 'Instant Halloween-themed logos.',                '👻', 'design',      false, false, false),
  ('costume-generator',          'Costume Generator',          'AI-powered costume ideas tailored to you.',      '🧙', 'ai',          true,  false, true),
  ('name-generator',             'Name Generator',             'Spooky names for characters, pets, parties.',    '🪦', 'ai',          false, true,  false),
  ('caption-generator',          'Caption Generator',          'Instagram-ready Halloween captions.',            '📝', 'ai',          false, false, false),
  ('quote-generator',            'Quote Generator',            'Chilling quotes for cards and posts.',           '💀', 'ai',          false, false, false),
  ('wish-generator',             'Wish Generator',             'Send heartfelt Halloween wishes.',               '🌙', 'wishes',      false, false, false),
  ('message-generator',          'Message Generator',          'Custom Halloween messages.',                     '✉️', 'wishes',      false, false, false),
  ('party-planner',              'Party Planner',              'Plan the ultimate Halloween bash.',              '🥳', 'party',       true,  false, false),
  ('party-name-generator',       'Party Name Generator',       'Name your Halloween party.',                     '🎉', 'party',       false, false, false),
  ('pumpkin-carving-generator',  'Pumpkin Carving Generator',  'AI-generated carving patterns.',                 '🎃', 'pumpkin',     false, true,  true),
  ('pumpkin-template-generator', 'Pumpkin Template Generator', 'Printable pumpkin stencils.',                    '🕸️', 'pumpkin',    false, false, false),
  ('pumpkin-face-generator',     'Pumpkin Face Generator',     'Design custom pumpkin faces.',                   '😈', 'pumpkin',     false, false, false),
  ('wallpaper-generator',        'Wallpaper Generator',        'Halloween wallpapers for every device.',         '📱', 'images',      false, false, false),
  ('coloring-pages-generator',   'Coloring Pages Generator',   'Printable Halloween coloring pages.',            '🖍️', 'printables', false, false, false),
  ('hashtag-generator',          'Hashtag Generator',          'Trending Halloween hashtags.',                   '#️⃣', 'social',    false, false, false),
  ('ai-prompt-generator',        'AI Prompt Generator',        'Spooky prompts for AI art & writing.',           '🪄', 'ai',          false, false, false),
  ('sticker-generator',          'Sticker Generator',          'Halloween stickers on demand.',                  '🩸', 'images',      false, false, false),
  ('profile-picture-generator',  'Profile Picture Generator', 'Halloween-themed PFPs.',                          '🧛', 'images',      false, false, false),
  ('avatar-generator',           'Avatar Generator',           'Custom Halloween avatars.',                      '🧟', 'images',      false, false, false),
  ('scary-story-generator',      'Scary Story Generator',      'AI-crafted horror stories.',                     '📖', 'ai',          false, false, true),
  ('meme-generator',             'Meme Generator',             'Halloween memes in one click.',                  '😂', 'social',      false, false, false)
) AS v(slug, title, description, icon, cat_slug, featured, popular, is_new)
ON CONFLICT (slug) DO NOTHING;

-- Articles
INSERT INTO public.articles (slug, title, excerpt, read_time_min, status, published_at)
VALUES
  ('best-halloween-costume-ideas-2026', '50 Best Halloween Costume Ideas for 2026', 'From classic to trending — costume inspiration for every age and budget.', 9, 'published'::content_status, '2026-07-01'),
  ('pumpkin-carving-guide',              'The Ultimate Pumpkin Carving Guide',       'Tools, techniques, safety, and 20 free templates.',                          12, 'published'::content_status, '2026-06-28'),
  ('halloween-party-planning-checklist', 'Halloween Party Planning Checklist',       'The step-by-step guide to hosting the party of the year.',                    8, 'published'::content_status, '2026-06-20'),
  ('history-of-halloween',               'The Real History of Halloween',            'From Samhain to today — how the world''s spookiest holiday evolved.',        11, 'published'::content_status, '2026-05-14'),
  ('halloween-safety-tips-kids',         'Halloween Safety Tips for Kids',           'Trick-or-treating safely — a parent''s guide.',                               6, 'published'::content_status, '2026-06-02'),
  ('diy-halloween-decorations',          '25 DIY Halloween Decorations You''ll Love','Budget-friendly decor ideas anyone can make.',                              10, 'published'::content_status, '2026-06-11')
ON CONFLICT (slug) DO NOTHING;

-- Tags
INSERT INTO public.tags (slug, name) VALUES
  ('halloween','halloween'), ('spooky','spooky'), ('pumpkin','pumpkin'),
  ('costume','costume'), ('party','party'), ('diy','diy'),
  ('printable','printable'), ('kids','kids')
ON CONFLICT (slug) DO NOTHING;

-- FAQs
INSERT INTO public.faqs (question, answer, status)
VALUES
  ('Are HalloweenTools tools free?', 'Yes, every tool is free with no signup.', 'published'::content_status),
  ('Do you save my data?',           'No — tools run in your browser whenever possible.', 'published'::content_status),
  ('Can I use outputs commercially?','Most outputs are royalty-free for personal use.',   'published'::content_status)
ON CONFLICT DO NOTHING;
