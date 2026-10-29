-- Prato Planejado: tabelas e regras de acesso.
-- Rode uma vez no Supabase: SQL Editor > New query > cole tudo > Run.

-- Dados do nutricionista (um por conta)
create table if not exists public.nutricionistas (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null default '',
  crn text not null default '',
  criado_em timestamptz not null default now()
);

-- Planos alimentares
create table if not exists public.planos (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  nutri_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  status text not null default 'rascunho' check (status in ('rascunho', 'liberado')),
  paciente jsonb not null default '{}',
  ajustes jsonb not null default '{}',
  metas jsonb not null default '{}',
  cardapio jsonb not null default '{"refeicoes": [], "observacoes": ""}',
  compras jsonb not null default '{"categorias": []}',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index if not exists planos_nutri_idx on public.planos (nutri_id, atualizado_em desc);

-- Regras de acesso: cada nutricionista só vê e altera o que é seu
alter table public.nutricionistas enable row level security;
alter table public.planos enable row level security;

drop policy if exists "nutri le e edita os proprios dados" on public.nutricionistas;
create policy "nutri le e edita os proprios dados" on public.nutricionistas
  for all to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "nutri le e edita os proprios planos" on public.planos;
create policy "nutri le e edita os proprios planos" on public.planos
  for all to authenticated using (nutri_id = auth.uid()) with check (nutri_id = auth.uid());

-- O paciente abre só o plano liberado do código que recebeu, sem poder listar os outros
create or replace function public.plano_por_codigo(p_codigo text)
returns table (codigo text, paciente_nome text, metas jsonb, cardapio jsonb, compras jsonb, nutri_nome text, nutri_crn text)
language sql
security definer
set search_path = public
as $$
  select p.codigo, p.paciente ->> 'nome', p.metas, p.cardapio, p.compras, n.nome, n.crn
  from public.planos p
  left join public.nutricionistas n on n.id = p.nutri_id
  where p.codigo = upper(trim(p_codigo)) and p.status = 'liberado'
  limit 1;
$$;
revoke all on function public.plano_por_codigo(text) from public;
grant execute on function public.plano_por_codigo(text) to anon, authenticated;

-- Permissões da API: só usuários logados acessam as tabelas (as regras acima limitam a cada um o que é seu)
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.planos to authenticated;
grant select, insert, update, delete on public.nutricionistas to authenticated;
revoke all on public.planos from anon;
revoke all on public.nutricionistas from anon;
