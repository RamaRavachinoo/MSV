-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT
);

-- Insert default categories
INSERT INTO categories (id, name, icon, color, description) VALUES
  ('restaurants', 'Restaurantes y Comida', 'Utensils', 'text-orange-500', 'Lugares donde comimos rico (o no tanto)'),
  ('movies', 'Películas y Series', 'Film', 'text-purple-500', 'Cosas que vimos o queremos ver'),
  ('places', 'Lugares Visitados', 'MapPin', 'text-green-500', 'Nuestras aventuras por el mundo'),
  ('songs', 'Música Especial', 'Music', 'text-pink-500', 'Soundtrack de nuestra historia'),
  ('wishlist', 'Planes Futuros', 'Plane', 'text-blue-500', 'Wishlist de sueños por cumplir')
ON CONFLICT (id) DO NOTHING;

-- Create our_things table
CREATE TABLE IF NOT EXISTS our_things (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  category_id TEXT REFERENCES categories(id),
  title TEXT NOT NULL,
  description TEXT,
  photo_url TEXT,
  rating INTEGER, -- 1-5
  date_event DATE,
  status TEXT DEFAULT 'completed', -- 'completed', 'pending', 'watching', 'want_to_go'
  location TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  shared_with UUID[]
);

-- Create tags table
CREATE TABLE IF NOT EXISTS our_things_tags (
  thing_id UUID REFERENCES our_things(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  PRIMARY KEY (thing_id, tag)
);

-- Enable RLS
ALTER TABLE our_things ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE our_things_tags ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Data is shared between the couple (assuming they share a login or we just allow all authenticated users for now as per "solo nosotros")
CREATE POLICY "Allow authenticated read access" ON categories
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated full access" ON our_things
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated full access tags" ON our_things_tags
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Storage Bucket for Photos
-- Note: You need to create a public bucket named 'our-things' in Supabase Storage manually or via dashboard.
