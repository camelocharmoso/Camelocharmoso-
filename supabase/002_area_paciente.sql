-- Prato Planejado, migração 002: pacientes, versões liberadas e acesso do paciente por link.
-- Rode depois de schema.sql (SQL Editor > New query > cole tudo > Run). Pode rodar de novo sem erro.

create extension if not exists pgcrypto with schema extensions;

-- Pacientes de cada nutricionista
create table if not exists public.pacientes (
  id uuid primary key default gen_random_uuid(),
  nutri_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nome text not null default '',
  nascimento date,
  telefone text not null default '',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index if not exists pacientes_nutri_idx on public.pacientes (nutri_id);

alter table public.planos add column if not exists paciente_id uuid references public.pacientes (id) on delete set null;
alter table public.planos add column if not exists proximo_retorno date;
alter table public.nutricionistas add column if not exists whatsapp text not null default '';

-- Cada liberação vira uma versão imutável; o paciente só lê a versão liberada mais recente.
create table if not exists public.plano_versoes (
  id uuid primary key default gen_random_uuid(),
  plano_id uuid not null references public.planos (id) on delete cascade,
  versao int not null,
  conteudo jsonb not null,
  liberado_em timestamptz not null default now(),
  liberado_por uuid not null default auth.uid() references auth.users (id),
  unique (plano_id, versao)
);

-- Links de acesso do paciente: guardamos só o hash do token, nunca o token.
create table if not exists public.acessos_paciente (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.pacientes (id) on delete cascade,
  nutri_id uuid not null references auth.users (id) on delete cascade,
  token_hash text not null unique,
  criado_em timestamptz not null default now(),
  revogado_em timestamptz,
  tentativas_falhas int not null default 0,
  bloqueado_ate timestamptz,
  ultimo_acesso timestamptz
);

alter table public.pacientes enable row level security;
alter table public.plano_versoes enable row level security;
alter table public.acessos_paciente enable row level security;

drop policy if exists "nutri le e edita os proprios pacientes" on public.pacientes;
create policy "nutri le e edita os proprios pacientes" on public.pacientes
  for all to authenticated using (nutri_id = auth.uid()) with check (nutri_id = auth.uid());

drop policy if exists "nutri le versoes dos proprios planos" on public.plano_versoes;
create policy "nutri le versoes dos proprios planos" on public.plano_versoes
  for select to authenticated using (exists (select 1 from public.planos p where p.id = plano_id and p.nutri_id = auth.uid()));
drop policy if exists "nutri libera versoes dos proprios planos" on public.plano_versoes;
create policy "nutri libera versoes dos proprios planos" on public.plano_versoes
  for insert to authenticated with check (liberado_por = auth.uid() and exists (select 1 from public.planos p where p.id = plano_id and p.nutri_id = auth.uid()));

drop policy if exists "nutri ve links dos proprios pacientes" on public.acessos_paciente;
create policy "nutri ve links dos proprios pacientes" on public.acessos_paciente
  for select to authenticated using (nutri_id = auth.uid());

grant select, insert, update, delete on public.pacientes to authenticated;
grant select, insert on public.plano_versoes to authenticated;
grant select on public.acessos_paciente to authenticated;
revoke all on public.pacientes, public.plano_versoes, public.acessos_paciente from anon;

-- O código curto (ex.: ANA-7K3P) deixa de dar acesso: é curto demais para dado de saúde.
revoke execute on function public.plano_por_codigo(text) from anon, authenticated;

-- Gera um link novo para o paciente e revoga os anteriores. Devolve o token uma única vez.
create or replace function public.criar_link_paciente(p_paciente uuid)
returns text language plpgsql security definer set search_path = public, extensions as $$
declare v_token text;
begin
  if not exists (select 1 from pacientes where id = p_paciente and nutri_id = auth.uid()) then
    raise exception 'paciente não encontrado';
  end if;
  if (select nascimento from pacientes where id = p_paciente) is null then
    raise exception 'preencha a data de nascimento do paciente';
  end if;
  update acessos_paciente set revogado_em = now() where paciente_id = p_paciente and revogado_em is null;
  v_token := translate(encode(gen_random_bytes(32), 'base64'), '+/=', '-_');
  insert into acessos_paciente (paciente_id, nutri_id, token_hash) values (p_paciente, auth.uid(), encode(digest(v_token, 'sha256'), 'hex'));
  return v_token;
end $$;

create or replace function public.revogar_links_paciente(p_paciente uuid)
returns void language sql security definer set search_path = public as $$
  update acessos_paciente set revogado_em = now()
  where paciente_id = p_paciente and nutri_id = auth.uid() and revogado_em is null;
$$;

-- Acesso do paciente: token do link + data de nascimento. 5 erros bloqueiam o link por 15 minutos.
create or replace function public.plano_do_paciente(p_token text, p_nascimento date)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare a acessos_paciente%rowtype; v_nasc date; v_ver plano_versoes%rowtype;
begin
  select * into a from acessos_paciente where token_hash = encode(digest(coalesce(p_token, ''), 'sha256'), 'hex');
  if not found then return jsonb_build_object('erro', 'link_invalido'); end if;
  if a.revogado_em is not null then return jsonb_build_object('erro', 'link_revogado'); end if;
  if a.bloqueado_ate is not null and a.bloqueado_ate > now() then
    return jsonb_build_object('erro', 'bloqueado', 'minutos', ceil(extract(epoch from (a.bloqueado_ate - now())) / 60));
  end if;
  select nascimento into v_nasc from pacientes where id = a.paciente_id;
  if v_nasc is null or p_nascimento is null or v_nasc <> p_nascimento then
    update acessos_paciente set
      tentativas_falhas = case when tentativas_falhas + 1 >= 5 then 0 else tentativas_falhas + 1 end,
      bloqueado_ate = case when tentativas_falhas + 1 >= 5 then now() + interval '15 minutes' else bloqueado_ate end
    where id = a.id;
    if a.tentativas_falhas + 1 >= 5 then return jsonb_build_object('erro', 'bloqueado', 'minutos', 15); end if;
    return jsonb_build_object('erro', 'data_incorreta', 'restantes', greatest(0, 4 - a.tentativas_falhas));
  end if;
  update acessos_paciente set tentativas_falhas = 0, bloqueado_ate = null, ultimo_acesso = now() where id = a.id;
  select v.* into v_ver from plano_versoes v join planos p on p.id = v.plano_id
  where p.paciente_id = a.paciente_id order by v.liberado_em desc limit 1;
  if not found then return jsonb_build_object('erro', 'sem_plano'); end if;
  return jsonb_build_object('ok', true, 'versao', v_ver.versao, 'liberado_em', v_ver.liberado_em, 'plano', v_ver.conteudo);
end $$;

revoke all on function public.criar_link_paciente(uuid), public.revogar_links_paciente(uuid), public.plano_do_paciente(text, date) from public;
grant execute on function public.criar_link_paciente(uuid), public.revogar_links_paciente(uuid) to authenticated;
grant execute on function public.plano_do_paciente(text, date) to anon, authenticated;
