# Como resolver "Nenhum maquinário retornado pelo banco"

Siga estes passos **no projeto Supabase onde estão os dados** (o mesmo da URL do .env).

## 1. Executar o SQL de permissões (RLS)

1. Abra o [Supabase Dashboard](https://supabase.com/dashboard) e selecione o projeto.
2. No menu lateral: **SQL Editor** → **New query**.
3. Copie todo o conteúdo do arquivo `012_enable_rls_maquinarios_read.sql` (na mesma pasta que este LEIA-ME).
4. Cole no editor e clique em **Run** (ou Ctrl+Enter).
5. Confirme que a execução terminou sem erro.

Isso cria políticas de **SELECT** para as tabelas `TPM_maquinarios`, `TPM_areas`, `TPM_motivos_parada`, `TPM_checklist_itens` e `TPM_ocorrencias_manutencao`, permitindo que a aplicação (anon/authenticated) leia os dados. A política em `TPM_ocorrencias_manutencao` evita a mensagem "Alguns status podem estar desatualizados" na tela de Maquinários.

## 2. Conferir o .env da aplicação

Certifique-se de que a aplicação aponta para o **mesmo** projeto:

- **VITE_SUPABASE_URL**: deve ser a URL do projeto (ex.: `https://xxxxx.supabase.co`).
- No Dashboard: **Project Settings** → **API** → compare com a **Project URL**.

Se a URL do .env for diferente do projeto onde você rodou o SQL e onde estão os 70+ maquinários, atualize o .env com a URL (e a **anon key**) desse projeto.

Depois disso, recarregue a página de Maquinários na aplicação; a lista deve ser preenchida.
