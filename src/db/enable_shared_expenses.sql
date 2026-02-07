-- 🔓 MODO PAREJA: Habilitar Gastos Compartidos
-- Esto permitirá que AMBOS (Martina y Rama) vean y editen los gastos del otro.

-- 1. Eliminar políticas antiguas (Privadas)
drop policy if exists "Users can view own expenses" on expenses;
drop policy if exists "Users can insert own expenses" on expenses;

-- 2. Crear políticas de "Acceso Compartido" (Cualquier usuario logueado)
-- VER (SELECT): Ambos pueden ver todo
create policy "Shared expenses view" on expenses 
for select using (auth.role() = 'authenticated');

-- INSERTAR (INSERT): Ambos pueden agregar
create policy "Shared expenses insert" on expenses 
for insert with check (auth.role() = 'authenticated');

-- ELIMINAR/EDITAR (ALL): Ambos pueden borrar o editar lo del otro (Confianza total ❤️)
create policy "Shared expenses manage" on expenses 
for all using (auth.role() = 'authenticated');

-- 3. Asegurar que el nuevo Admin tenga perfil (por si acaso cambiaste el email recién)
insert into public.profiles (id, username, email)
select 
    id, 
    coalesce(raw_user_meta_data->>'name', substring(email from '(.*)@')), 
    email
from auth.users
where id not in (select id from public.profiles);
