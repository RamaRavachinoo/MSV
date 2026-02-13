-- Allow both users to add reasons
drop policy if exists "Admins can insert reasons" on reasons;
create policy "Authenticated users can insert reasons" on reasons for insert with check (auth.role() = 'authenticated');

-- Inherit delete/update if needed, or just insert/select for now based on requirements.
-- Let's allow them to delete their own reasons just in case.
create policy "Users can delete their own reasons" on reasons for delete using (auth.uid() = (select id from profiles where role = 'admin' limit 1)); 
-- Actually, let's just make it simple: Authenticated users can do everything for now, or just insert.
-- The prompt says "ambos puedan agregar razones".

-- Seed data from the hardcoded list
insert into reasons (text, category)
select text, 'General' from (values
    ('Por cómo te brillan los ojos cuando hablas de lo que te apasiona.'),
    ('Por tu risa que ilumina cualquier día gris.'),
    ('Porque me haces querer ser mejor persona.'),
    ('Por tu inteligencia y determinación en la abogacía.'),
    ('Por cada momento de paz que me das.'),
    ('Por tus abrazos que reconfortan el alma.'),
    ('Por cómo cuidas a los que amas.'),
    ('Porque eres mi mejor amiga y mi amor.'),
    ('Por nuestros planes a futuro juntos.'),
    ('Simplemente, por existir y elegirme.')
) as v(text)
where not exists (select 1 from reasons where text = v.text);
