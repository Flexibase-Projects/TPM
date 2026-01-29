# TPM - Sistema de Manutenção Produtiva Total

Sistema web para gestão de **TPM (Total Productive Maintenance)**: cadastro de maquinários, ocorrências de manutenção, paradas e acompanhamento via dashboard.

## Tecnologias

- **Frontend:** React 18, TypeScript, Vite, Material UI (MUI), React Router, Recharts
- **Backend / Banco:** Supabase (PostgreSQL, API REST)

## Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com) (projeto criado)
- Variáveis de ambiente configuradas (ver abaixo)

## Instalação

```bash
# Clonar o repositório
git clone https://github.com/<seu-usuario>/TPM.git
cd TPM

# Instalar dependências
npm install
```

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-do-supabase
```

Obtenha a URL e a chave anônima em: **Supabase → Project Settings → API**.

## Banco de dados (Supabase)

Execute as migrations na ordem em que aparecem em `supabase/migrations/`:

1. `001_initial_setup.sql`
2. `002_create_maquinarios_tables.sql`
3. `003_fix_table_names.sql`
4. `004_create_ocorrencias_manutencao.sql`
5. `005_create_paradas.sql`
6. `006_update_ocorrencias_paradas.sql`
7. `007_add_status_maquinarios.sql`
8. Demais migrations (008 a 011)

No Supabase: **SQL Editor** → colar o conteúdo de cada arquivo e executar.

## Executando o projeto

```bash
# Desenvolvimento (porta 3000, acessível na rede local)
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## Funcionalidades principais

- **Maquinários:** Cadastro (identificação, operador, área, categoria, tempo disponível, status, motivos de parada, checklist)
- **Ocorrências de manutenção:** Abertura, andamento e conclusão de OMs (vermelho, verde, azul; corretivas)
- **Paradas:** Registro de paradas (manual/automático) e vínculo com motivos e ocorrências
- **Dashboard:** Visão geral e indicadores
- **Minhas OMs:** Acompanhamento das ordens de manutenção

## Estrutura do projeto

```
TPM/
├── src/
│   ├── components/     # Componentes React (layout, maquinários, ocorrências, paradas)
│   ├── pages/          # Páginas da aplicação
│   ├── services/       # Chamadas ao Supabase
│   ├── types/          # Tipos TypeScript
│   └── utils/          # Utilitários e constantes
├── supabase/
│   └── migrations/     # Scripts SQL (tabelas e alterações)
├── public/
└── package.json
```

## Acesso em outra máquina na rede

Com `npm run dev`, o servidor sobe com `host: true`. Use o IP da sua máquina na rede local, por exemplo:

```
http://<SEU_IP>:3000
```

Ex.: `http://192.168.0.54:3000`

## Licença

Projeto privado.
