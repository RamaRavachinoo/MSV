-- 🔒 ROL HYBRIDO: Gastos Privados | Metas Mixtas
-- Ajusta los permisos exactamente como lo pediste.

-- 1. GASTOS (Privados: Cada uno ve lo suyo)
drop policy if exists "Shared expenses view" on expenses;
drop policy if exists "Shared expenses insert" on expenses;
drop policy if exists "Shared expenses manage" on expenses;
-- Restaurar políticas privadas
drop policy if exists "Users can view own expenses" on expenses;
create policy "Users can view own expenses" on expenses for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own expenses" on expenses;
create policy "Users can insert own expenses" on expenses for insert with check (auth.uid() = user_id);


-- 2. METAS (Híbridas: Compartidas o Privadas según el flag 'is_shared')
drop policy if exists "Goals public view" on goals;
drop policy if exists "Auth users edit goals" on goals;

-- VER: Si es compartida O si es mía
create policy "Hybrid goals view" on goals 
for select using (
    is_shared = true 
    OR 
    auth.uid() = created_by -- Necesitamos agregar esta columna o usar una existente
);

-- EDITAR: Si es compartida O si es mía
create policy "Hybrid goals edit" on goals 
for all using (
    is_shared = true 
    OR 
    auth.uid() = created_by
);

-- Agregar columna created_by a goals si no existe (para saber de quién es la meta personal)
alter table goals add column if not exists created_by uuid references auth.users(id) default auth.uid();
-- Actualizar las metas existentes para que tengan dueño (por defecto el admin o quien corra esto)
update goals set created_by = auth.uid() where created_by is null;

-- 3. APORTES (Contributions)
-- Permitir ver aportes de metas que puedo ver
drop policy if exists "Contributions public view" on contributions;
create policy "Contributions visibility" on contributions 
for select using (
    exists ( select 1 from goals where id = contributions.goal_id and (is_shared = true or created_by = auth.uid()) )
);

create policy "Contributions insert" on contributions
for insert with check (
   exists ( select 1 from goals where id = goal_id and (is_shared = true or created_by = auth.uid()) )
);
