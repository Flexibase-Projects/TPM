# RLS de leitura para Paradas (020)

## Ordem de aplicação

A migration `020_paradas_rls_read.sql` libera apenas **SELECT** em `TPM_paradas` e `TPM_tempo_disponivel_diario`.

Para a tela **Paradas** funcionar por completo (lista de paradas com maquinário/área, filtro por área, edição), é necessário que as políticas de leitura de **áreas** e **maquinários** já estejam ativas no mesmo projeto.

**Aplique antes**, no mesmo projeto Supabase usado pelo front (`.env`):

1. **012_enable_rls_maquinarios_read.sql** – leitura em `TPM_areas`, `TPM_maquinarios`, `TPM_motivos_parada`, etc.

Depois execute:

2. **020_paradas_rls_read.sql** – leitura em `TPM_paradas` e `TPM_tempo_disponivel_diario`.

No Dashboard: **SQL Editor** → New query → cole o conteúdo de cada arquivo e execute na ordem acima.

## Conferir .env

Certifique-se de que `VITE_SUPABASE_URL` (e a anon key) apontam para o **mesmo** projeto onde as migrations foram executadas.
