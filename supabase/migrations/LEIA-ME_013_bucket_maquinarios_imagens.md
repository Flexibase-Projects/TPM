# Bucket de imagens dos maquinários

O app usa o bucket existente **`maquinarios`** no Supabase Storage para as imagens dos maquinários.

## O que conferir

1. No [Supabase Dashboard](https://supabase.com/dashboard) do seu projeto, abra **Storage**.
2. Verifique se existe o bucket **`maquinarios`** (nome exato).
3. O bucket deve estar **público** para as imagens aparecerem na listagem sem login.  
   Se não estiver: abra o bucket → **Configuration** (ou ícone de engrenagem) → marque **Public bucket**.  
   Sem bucket público, a imagem é salva e a URL fica em `TPM_maquinarios.imagem_url`, mas **não aparece** na listagem (o navegador recebe 403 ao carregar a URL).

As políticas de acesso (RLS) para esse bucket são criadas pela migration `013_maquinarios_imagem.sql`. Se aparecer **"new row violates row-level security"** ao enviar imagem, rode a migration `015_storage_maquinarios_public_upload.sql`: ela permite que qualquer um (anon) faça upload usando uma função que resolve o id do bucket.

## Erro "Bucket not found"

Se ao enviar uma imagem aparecer **"Bucket not found"**, confira:

- O bucket se chama exatamente **`maquinarios`** (minúsculo, sem hífen extra).
- O projeto do Dashboard é o mesmo que o app usa (`VITE_SUPABASE_URL` no `.env`).
