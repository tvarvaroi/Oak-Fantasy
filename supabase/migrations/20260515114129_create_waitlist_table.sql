/*
  # Create waitlist table

  1. New Tables
    - `waitlist`
      - `id` (uuid, primary key)
      - `email` (text, unique, not null)
      - `language` (text, 'ro' or 'en', default 'ro')
      - `source` (text, 'hero' or 'waitlist', default 'hero')
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `waitlist` table
    - Add policy allowing anonymous inserts (anyone can join waitlist)
    - No read policy for public (only service role can read)

  3. Notes
    - Email is unique to prevent duplicate signups
    - Language tracks which locale the user signed up from
    - Source tracks which section of the page they used
*/

CREATE TABLE IF NOT EXISTS waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  language text NOT NULL DEFAULT 'ro' CHECK (language IN ('ro', 'en')),
  source text NOT NULL DEFAULT 'hero' CHECK (source IN ('hero', 'waitlist')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join the waitlist"
  ON waitlist
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL
    AND length(email) > 3
    AND email LIKE '%@%'
  );
