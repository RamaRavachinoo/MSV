-- 🔒 PRIVACY UPDATE: Gastos Privados
-- Este script segura que cada usuario SOLO vea sus propios gastos.
-- Elimina las políticas compartidas anteriores.

-- 1. Eliminar políticas existentes en la tabla expenses
DROP POLICY IF EXISTS "Shared expenses view" ON expenses;
DROP POLICY IF EXISTS "Shared expenses insert" ON expenses;
DROP POLICY IF EXISTS "Shared expenses manage" ON expenses;
DROP POLICY IF EXISTS "Users can view own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can insert own expenses" ON expenses;

-- 2. Habilitar RLS (por si acaso)
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas estrictas (Solo el dueño ve y toca)
CREATE POLICY "Private Expenses Select" ON expenses
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Private Expenses Insert" ON expenses
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Private Expenses Update" ON expenses
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Private Expenses Delete" ON expenses
FOR DELETE USING (auth.uid() = user_id);
