-- Fix messages foreign key to support cascading deletes
-- This allows deleting a message even if it has replies

ALTER TABLE messages DROP CONSTRAINT IF EXISTS fk_parent_message_id;

ALTER TABLE messages ADD CONSTRAINT fk_parent_message_id
  FOREIGN KEY (parent_message_id) REFERENCES messages(id) ON DELETE CASCADE;
