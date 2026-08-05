-- ============================================================================
-- Migration: 20260805152500_auto_create_missing_categories_on_import.sql
-- Goal: Automatically insert missing category UUIDs into public.categories whenever
-- an article CSV/data import contains a category_id UUID that isn't in categories yet.
-- ============================================================================

-- Function to handle missing category UUIDs seamlessly during CSV or bulk imports
CREATE OR REPLACE FUNCTION public.auto_create_missing_category_on_article_import()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.category_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.categories WHERE id = NEW.category_id
  ) THEN
    INSERT INTO public.categories (id, slug, name, description, icon)
    VALUES (
      NEW.category_id,
      'category-' || SUBSTRING(NEW.category_id::text FROM 1 FOR 8),
      'Category ' || SUBSTRING(NEW.category_id::text FROM 1 FOR 8),
      'Auto-created category for imported articles',
      '📁'
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_create_missing_category ON public.articles;
CREATE TRIGGER trg_auto_create_missing_category
  BEFORE INSERT ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_missing_category_on_article_import();
