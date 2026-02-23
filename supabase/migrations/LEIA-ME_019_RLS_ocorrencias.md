# RLS para TPM_ocorrencias_manutencao (erro 42501)

Se o app exibe **"new row violates row-level security policy for table TPM_ocorrencias_manutencao" (42501)** ao salvar uma ocorrência (incluindo a descrição), siga estes passos no **mesmo projeto Supabase** que o app usa.

## 1. Confirmar o projeto

- No app, a URL do Supabase está em `VITE_SUPABASE_URL` no `.env`.
- No **Supabase Dashboard**, abra o projeto cuja URL é exatamente essa (ex.: `https://xxxx.supabase.co`).
- O SQL abaixo deve ser executado **nesse** projeto. Se rodar em outro, o erro continua.

## 2. Aplicar as políticas RLS (uma vez)

No Dashboard: **SQL Editor** → Nova query → cole o conteúdo do arquivo **019_ocorrencias_rls_completo.sql** → Execute.

Esse script ativa RLS e cria as políticas de **SELECT**, **INSERT** e **UPDATE** para a tabela `TPM_ocorrencias_manutencao` (roles `anon` e `authenticated`).

## 3. Verificar (diagnóstico)

No mesmo projeto, no SQL Editor, execute o arquivo **DIAGNOSTICO_RLS_ocorrencias.sql**.

- A primeira query deve mostrar `rls_ativo = true` para a tabela.
- A segunda deve listar políticas de **SELECT**, **INSERT** e **UPDATE**. Se faltar alguma, rode de novo o 019.

## 4. Testar no app

Abra o diálogo **Nova OM Corretiva**, preencha maquinário e **descrição**, salve. A ocorrência deve ser criada e a descrição gravada na coluna `descricao`.
