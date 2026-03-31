# TPM - Sistema de Manutencao Produtiva Total

Aplicacao web para gestao de TPM (Total Productive Maintenance), com cadastro de maquinarios, ocorrencias de manutencao, registro de paradas e acompanhamento operacional por dashboard.

## Visao geral

O projeto foi construido com React + Vite no frontend e Supabase como backend/banco. A aplicacao atende o fluxo operacional de manutencao com foco em:

- cadastro e consulta de maquinarios
- abertura e acompanhamento de ordens de manutencao
- registro de paradas e seus motivos
- dashboard com visao consolidada
- area de acompanhamento de OMs

## Stack

- React 18
- TypeScript
- Vite 5
- Material UI
- React Router
- Recharts
- Supabase

## Requisitos

- Node.js 18+
- npm
- projeto Supabase ativo

## Instalacao

```bash
git clone https://github.com/<seu-usuario>/TPM.git
cd TPM
npm install
```

## Variaveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-do-supabase
```

Esses valores podem ser obtidos em `Supabase > Project Settings > API`.

## Scripts disponiveis

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Execucao local

O servidor de desenvolvimento esta configurado para subir na porta `8090` com acesso pela rede local.

```bash
npm run dev
```

Acesso local:

```text
http://localhost:8090
```

Acesso pela rede:

```text
http://<SEU_IP>:8090
```

## Estrutura do projeto

```text
TPM/
├── public/                # arquivos estaticos
├── src/
│   ├── components/        # componentes e dialogs por dominio
│   ├── contexts/          # contexto de autenticacao, permissoes e tema
│   ├── pages/             # paginas principais da aplicacao
│   ├── services/          # acesso ao Supabase e regras de consulta
│   ├── types/             # contratos e tipos TypeScript
│   └── utils/             # utilitarios e funcoes auxiliares
├── supabase/
│   └── migrations/        # scripts SQL de criacao e evolucao do schema
├── package.json
└── vite.config.ts
```

## Banco de dados e migrations

As migrations ficam em `supabase/migrations/` e devem ser executadas na ordem numerica.

Fluxo sugerido:

1. abrir o SQL Editor no Supabase
2. executar os arquivos em ordem crescente
3. validar tabelas, relacoes e politicas esperadas no ambiente

## Funcionalidades principais

### Maquinarios

- cadastro com identificacao, operador, area e categoria
- controle de status
- checklist e dados operacionais

### Ocorrencias de manutencao

- abertura de OM
- acompanhamento de status
- consulta e visualizacao de detalhes

### Paradas

- registro manual ou automatico
- vinculacao de motivo de parada
- relacao com ocorrencias quando aplicavel

### Dashboard

- indicadores operacionais
- visao consolidada da manutencao

## Deploy e operacao

O `vite.config.ts` esta preparado para uso local e tambem possui anotacao de mapeamento de porta para ambiente com Coolify.

## Troubleshooting

### Sem conexao com o Supabase

Se a aplicacao nao conectar:

1. confirme que o `.env` existe na raiz do projeto
2. valide `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
3. reinicie o `npm run dev` apos qualquer alteracao no `.env`
4. verifique no painel do Supabase se o projeto nao esta pausado
5. teste a URL do projeto diretamente no navegador

### Aplicacao abre, mas nao fica acessivel na rede

- confirme que a porta `8090` nao esta bloqueada
- descubra o IP da maquina na rede local
- acesse `http://<SEU_IP>:8090`

### Build com erro

Execute:

```bash
npm run build
```

Se falhar, revise primeiro tipagem TypeScript, configuracao do Supabase e imports quebrados.

## Licenca

Projeto privado.
