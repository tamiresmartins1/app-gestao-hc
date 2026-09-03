CREATE TABLE IF NOT EXISTS glpi_tickets (
  id SERIAL PRIMARY KEY,
  glpi_number TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ativa',
  opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION update_glpi_tickets_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_glpi_tickets_timestamp_trigger ON glpi_tickets;
CREATE TRIGGER update_glpi_tickets_timestamp_trigger
BEFORE UPDATE ON glpi_tickets
FOR EACH ROW
EXECUTE FUNCTION update_glpi_tickets_timestamp();
