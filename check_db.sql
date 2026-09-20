SELECT id, title, start_date, end_date, created_at 
FROM scheduled_tasks 
WHERE title = 'brigadeiro'
ORDER BY created_at DESC
LIMIT 1;
