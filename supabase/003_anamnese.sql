-- Prato Planejado, migração 003: anamnese completa guardada no cadastro do paciente.
-- A ficha inteira (identificação, fase da vida, treino, saúde, exames, hábitos, antropometria)
-- fica em pacientes.anamnese e é reaproveitada em cada plano novo do mesmo paciente.
-- Rode depois de 002_area_paciente.sql. Pode rodar de novo sem erro.

alter table public.pacientes add column if not exists sexo text not null default '';
alter table public.pacientes add column if not exists anamnese jsonb not null default '{}';

create index if not exists pacientes_nutri_nome_idx on public.pacientes (nutri_id, nome);
