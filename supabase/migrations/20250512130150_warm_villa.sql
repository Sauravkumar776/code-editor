/*
  # Create projects table and related schemas

  1. New Tables
    - `projects`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `description` (text)
      - `content` (jsonb, not null)
      - `user_id` (uuid, not null, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `is_public` (boolean)
      - `version` (integer)

  2. Security
    - Enable RLS on `projects` table
    - Add policies for:
      - Users can read their own projects
      - Users can read public projects
      - Users can create their own projects
      - Users can update their own projects
      - Users can delete their own projects
*/

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  content jsonb NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_public boolean DEFAULT false,
  version integer DEFAULT 1,
  CONSTRAINT valid_content CHECK (content ? 'html' AND content ? 'css' AND content ? 'js')
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own projects
CREATE POLICY "Users can read own projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can read public projects
CREATE POLICY "Anyone can read public projects"
  ON projects
  FOR SELECT
  USING (is_public = true);

-- Policy: Users can create their own projects
CREATE POLICY "Users can create own projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own projects
CREATE POLICY "Users can update own projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own projects
CREATE POLICY "Users can delete own projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call update_updated_at function
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();