// Tipos para itens de material/peças por ocorrência de manutenção

export interface ItemMaterialOcorrencia {
  id: string
  ocorrencia_id: string
  descricao: string
  marca?: string | null
  valor_unitario: number
  quantidade: number
  unidade?: string | null
  observacao?: string | null
  created_at: string
  updated_at: string
}

/** Linha de material da OM para edição no formulário (sem id/ocorrencia_id/timestamps) */
export type ItemMaterialOcorrenciaFormItem = Omit<
  ItemMaterialOcorrencia,
  'id' | 'ocorrencia_id' | 'created_at' | 'updated_at'
>

/** Item com contexto da OM para listagem por maquinário */
export interface ItemMaterialComOcorrencia extends ItemMaterialOcorrencia {
  data_ocorrencia?: string
}

/** Material/peça cadastrado por maquinário (referência no edit maquinário) */
export interface MaterialMaquinario {
  id: string
  maquinario_id: string
  descricao: string
  marca?: string | null
  valor_unitario: number
  quantidade: number
  unidade?: string | null
  observacao?: string | null
  /** Data em que o item foi comprado (informada pelo usuário, para análise) */
  data_compra?: string | null
  created_at: string
  updated_at: string
}

/** Linha de material para o formulário (sem id/maquinario_id/timestamps) */
export type MaterialMaquinarioFormItem = Omit<
  MaterialMaquinario,
  'id' | 'maquinario_id' | 'created_at' | 'updated_at'
>

/** Item de material com contexto de ocorrência/maquinário/área para relatórios de custo */
export interface ItemMaterialRelatorio {
  id: string
  ocorrencia_id: string
  descricao: string
  marca?: string | null
  valor_unitario: number
  quantidade: number
  valor_total: number
  maquinario_id: string
  maquinario_identificacao: string
  area_id: string | null
  area_nome: string | null
  data_ocorrencia?: string | null
}
