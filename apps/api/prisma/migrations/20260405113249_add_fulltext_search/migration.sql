-- AlterTable
ALTER TABLE "Listing" ADD COLUMN "searchVector" tsvector;

-- GIN index for fast full-text queries
CREATE INDEX IF NOT EXISTS "Listing_searchVector_gin_idx"
  ON "Listing" USING GIN ("searchVector");

-- Trigger function: rebuild searchVector from description + location + category
-- Uses 'simple' config: language-agnostic, best support for Mongolian/Cyrillic
CREATE OR REPLACE FUNCTION listing_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW."searchVector" := to_tsvector(
    'simple',
    coalesce(NEW.description, '') || ' ' ||
    coalesce(NEW.location,    '') || ' ' ||
    coalesce(NEW.category,    '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger fires BEFORE INSERT or UPDATE of the indexed columns
DROP TRIGGER IF EXISTS listing_search_vector_trigger ON "Listing";
CREATE TRIGGER listing_search_vector_trigger
  BEFORE INSERT OR UPDATE OF description, location, category
  ON "Listing"
  FOR EACH ROW
  EXECUTE FUNCTION listing_search_vector_update();

-- Back-fill existing rows
UPDATE "Listing"
SET "searchVector" = to_tsvector(
  'simple',
  coalesce(description, '') || ' ' ||
  coalesce(location,    '') || ' ' ||
  coalesce(category,    '')
);
