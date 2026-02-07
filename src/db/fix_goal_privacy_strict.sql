-- 🚨 FIX URGENTE: Privacidad de Metas
-- El problema es que probablemente quedó una política antigua que permite ver todo.
-- Este script REINICIA los permisos de la tabla 'goals' desde cero.

-- 1. Asegurar que la seguridad, fila por fila, está ACTIVADA
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- 2. Borrar CUALQUIER política anterior (limpieza profunda)
DROP POLICY IF EXISTS "Hybrid goals view" ON goals;
DROP POLICY IF EXISTS "Hybrid goals edit" ON goals;
DROP POLICY IF EXISTS "Goals Select" ON goals;
DROP POLICY IF EXISTS "Goals Insert" ON goals;
DROP POLICY IF EXISTS "Goals Update" ON goals;
DROP POLICY IF EXISTS "Goals Delete" ON goals;
-- Borrar posibles políticas por defecto de supabase
DROP POLICY IF EXISTS "Enable read access for all users" ON goals;
DROP POLICY IF EXISTS "Enable insert for all users" ON goals;
DROP POLICY IF EXISTS "Enable update for all users" ON goals;
DROP POLICY IF EXISTS "Enable delete for all users" ON goals;

-- 3. Crear las Reglas de Oro ✨

-- VER: Solo si es compartida O si yo la creé
CREATE POLICY "Strict Goal View" ON goals
FOR SELECT USING (
    is_shared = true 
    OR 
    created_by = auth.uid()
);

-- CREAR: Cualquiera registrado
CREATE POLICY "Strict Goal Insert" ON goals
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- EDITAR: Si es compartida O si es mía
CREATE POLICY "Strict Goal Update" ON goals
FOR UPDATE USING (
    is_shared = true 
    OR 
    created_by = auth.uid()
);

-- BORRAR: SOLO EL DUEÑO (Aunque sea compartida, solo quien la creó la borra)
CREATE POLICY "Strict Goal Delete" ON goals
FOR DELETE USING (
    created_by = auth.uid()
);

-- 4. (Opcional) Verificar que los autores existan o asignar al actual si es nulo
-- UPDATE goals SET created_by = auth.uid() WHERE created_by IS NULL;
