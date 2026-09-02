-- Execute this SQL in Supabase to create the member_notes table
CREATE TABLE IF NOT EXISTS member_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  UNIQUE(member_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_member_notes_member_id ON member_notes(member_id);

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_member_notes_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_member_notes_timestamp ON member_notes;
CREATE TRIGGER trigger_update_member_notes_timestamp
BEFORE UPDATE ON member_notes
FOR EACH ROW
EXECUTE FUNCTION update_member_notes_timestamp();
