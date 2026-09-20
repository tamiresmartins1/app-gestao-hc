-- Enable Row Level Security (RLS) on all tables in the public schema
-- This prevents unauthorized access to data

ALTER TABLE avaliações ENABLE ROW LEVEL SECURITY;
ALTER TABLE glpi_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_completion ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE setores ENABLE ROW LEVEL SECURITY;

-- Create basic policy: allow authenticated users to access all data
-- (You can refine this later with more specific policies)

CREATE POLICY "Enable read access for authenticated users" ON avaliações
  FOR SELECT USING (true);

CREATE POLICY "Enable read access for authenticated users" ON glpi_tickets
  FOR SELECT USING (true);

CREATE POLICY "Enable read access for authenticated users" ON member_notes
  FOR SELECT USING (true);

CREATE POLICY "Enable read access for authenticated users" ON members
  FOR SELECT USING (true);

CREATE POLICY "Enable read access for authenticated users" ON messages
  FOR SELECT USING (true);

CREATE POLICY "Enable read access for authenticated users" ON pacientes
  FOR SELECT USING (true);

CREATE POLICY "Enable read access for authenticated users" ON process_completion
  FOR SELECT USING (true);

CREATE POLICY "Enable read access for authenticated users" ON process_members
  FOR SELECT USING (true);

CREATE POLICY "Enable read access for authenticated users" ON process_notifications
  FOR SELECT USING (true);

CREATE POLICY "Enable read access for authenticated users" ON process_tasks
  FOR SELECT USING (true);

CREATE POLICY "Enable read access for authenticated users" ON processes
  FOR SELECT USING (true);

CREATE POLICY "Enable read access for authenticated users" ON scheduled_tasks
  FOR SELECT USING (true);

CREATE POLICY "Enable read access for authenticated users" ON setores
  FOR SELECT USING (true);
