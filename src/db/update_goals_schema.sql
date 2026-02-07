-- 📝 UPDATE: Agregar Descripción a Metas
-- Este script agrega la columna 'description' a la tabla 'goals'

ALTER TABLE goals 
ADD COLUMN IF NOT EXISTS description text;

-- Opcional: Actualizar la meta por defecto
UPDATE goals 
SET description = 'Nuestra primera meta juntos ❤️' 
WHERE title = 'Mudarnos Juntos 🏠';
