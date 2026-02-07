-- 🛠️ FIX: Sincronizar Usuarios de Auth con Perfiles Públicos
-- Ejecuta esto para crear los perfiles que faltan y arreglar el error de "Foreign Key"

-- 1. Insertar perfiles faltantes copiando desde auth.users
insert into public.profiles (id, username, email)
select 
    id, 
    coalesce(raw_user_meta_data->>'name', substring(email from '(.*)@')), -- Usa el nombre si existe, sino la parte antes del @
    email
from auth.users
where id not in (select id from public.profiles);

-- 2. Asegurarnos que el Trigger automático esté activado para el futuro
-- (Esto crea el perfil automáticamente cuando un usuario nuevo se registra)

-- Función que se ejecuta al crear usuario
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, email)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'name', substring(new.email from '(.*)@')), 
    new.email
  );
  return new;
end;
$$;

-- Trigger (si ya existe, lo borramos y creamos de nuevo para asegurar)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Confirmación
select count(*) as "Perfiles Creados/Existentes" from profiles;
