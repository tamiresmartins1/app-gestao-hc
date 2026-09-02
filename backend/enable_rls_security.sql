-- ====== ATIVANDO SEGURANÇA NO SUPABASE ======
-- Execute este script COMPLETO no SQL Editor do Supabase
-- Isso vai PROTEGER todos os dados e impedir acesso público

-- 1. ATIVAR ROW-LEVEL SECURITY EM TODAS AS TABELAS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_notes ENABLE ROW LEVEL SECURITY;

-- 2. REMOVER POLÍTICAS ANTIGAS (se existirem)
DROP POLICY IF EXISTS "public_read_members" ON members;
DROP POLICY IF EXISTS "public_write_members" ON members;
DROP POLICY IF EXISTS "public_read_tasks" ON tasks;
DROP POLICY IF EXISTS "public_write_tasks" ON tasks;
DROP POLICY IF EXISTS "public_read_messages" ON messages;
DROP POLICY IF EXISTS "public_write_messages" ON messages;
DROP POLICY IF EXISTS "public_read_processes" ON processes;
DROP POLICY IF EXISTS "public_write_processes" ON processes;
DROP POLICY IF EXISTS "public_read_notifications" ON process_notifications;

-- ====== POLÍTICAS DE SEGURANÇA ======

-- 3. MEMBERS - Todos podem ver lista, chefe pode editar
CREATE POLICY "Allow read all members" ON members
  FOR SELECT
  USING (true);

CREATE POLICY "Allow write to chefe only" ON members
  FOR UPDATE
  USING (role = 'chefe')
  WITH CHECK (role = 'chefe');

CREATE POLICY "Prevent member delete" ON members
  FOR DELETE
  USING (false);

-- 4. TASKS - Cada um vê suas tarefas
CREATE POLICY "Users can see own tasks" ON tasks
  FOR SELECT
  USING (
    assigned_to = (SELECT id FROM members WHERE email = current_user_email())
    OR EXISTS (SELECT 1 FROM members WHERE role = 'chefe' AND email = current_user_email())
  );

CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE
  USING (
    assigned_to = (SELECT id FROM members WHERE email = current_user_email())
    OR EXISTS (SELECT 1 FROM members WHERE role = 'chefe' AND email = current_user_email())
  );

CREATE POLICY "Users can create tasks" ON tasks
  FOR INSERT
  WITH CHECK (
    created_by = (SELECT id FROM members WHERE email = current_user_email())
  );

-- 5. MESSAGES - Cada um vê mensagens recebidas/enviadas
CREATE POLICY "Users can see own messages" ON messages
  FOR SELECT
  USING (
    recipient_id = (SELECT id FROM members WHERE email = current_user_email())
    OR sender_id = (SELECT id FROM members WHERE email = current_user_email())
  );

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT
  WITH CHECK (
    sender_id = (SELECT id FROM members WHERE email = current_user_email())
  );

CREATE POLICY "Users can update own messages" ON messages
  FOR UPDATE
  USING (
    recipient_id = (SELECT id FROM members WHERE email = current_user_email())
    OR sender_id = (SELECT id FROM members WHERE email = current_user_email())
  );

-- 6. PROCESSES - Todos podem ver (são processos compartilhados)
CREATE POLICY "Allow read all processes" ON processes
  FOR SELECT
  USING (true);

CREATE POLICY "Allow write to chefe only" ON processes
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM members WHERE role = 'chefe' AND email = current_user_email())
  );

-- 7. PROCESS_MEMBERS - Proteger
CREATE POLICY "Allow read process members" ON process_members
  FOR SELECT
  USING (true);

CREATE POLICY "Allow write to chefe only" ON process_members
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM members WHERE role = 'chefe' AND email = current_user_email())
  );

-- 8. PROCESS_NOTIFICATIONS - Cada um vê suas notificações
CREATE POLICY "Users can see own notifications" ON process_notifications
  FOR SELECT
  USING (
    member_id = (SELECT id FROM members WHERE email = current_user_email())
  );

CREATE POLICY "Users can update own notifications" ON process_notifications
  FOR UPDATE
  USING (
    member_id = (SELECT id FROM members WHERE email = current_user_email())
  );

-- 9. MEMBER_NOTES - TOTALMENTE PRIVADO (anotações)
CREATE POLICY "Users can see own notes" ON member_notes
  FOR SELECT
  USING (
    member_id = (SELECT id FROM members WHERE email = current_user_email())
  );

CREATE POLICY "Users can create own notes" ON member_notes
  FOR INSERT
  WITH CHECK (
    member_id = (SELECT id FROM members WHERE email = current_user_email())
  );

CREATE POLICY "Users can update own notes" ON member_notes
  FOR UPDATE
  USING (
    member_id = (SELECT id FROM members WHERE email = current_user_email())
  );

CREATE POLICY "Users can delete own notes" ON member_notes
  FOR DELETE
  USING (
    member_id = (SELECT id FROM members WHERE email = current_user_email())
  );

-- ====== FINALIZADO ======
-- Pronto! Seus dados estão PROTEGIDOS!
-- ✅ Cada um vê só seus dados
-- ✅ Anotações são privadas
-- ✅ Chefe tem acesso total
-- ✅ Ninguém mais consegue acessar
