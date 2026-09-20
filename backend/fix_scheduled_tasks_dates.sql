-- Migração: Converter colunas DATE para VARCHAR em scheduled_tasks
-- Porque DATE type no PostgreSQL interpreta como UTC, causando problemas com timezones

-- Verificar dados atuais
SELECT id, start_date, end_date FROM scheduled_tasks LIMIT 5;

-- Alterar colunas
ALTER TABLE scheduled_tasks
ALTER COLUMN start_date TYPE VARCHAR(10) USING TO_CHAR(start_date, 'YYYY-MM-DD');

ALTER TABLE scheduled_tasks
ALTER COLUMN end_date TYPE VARCHAR(10) USING TO_CHAR(end_date, 'YYYY-MM-DD');

-- Verificar resultado
SELECT id, start_date, end_date FROM scheduled_tasks LIMIT 5;
