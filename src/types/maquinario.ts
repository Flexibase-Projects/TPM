// Tipos relacionados a Maquinários

export type StatusMaquinario = 'Disponivel' | 'Desativada' | 'Inativa'
export type StatusMaquinarioCalculado = 'Disponivel' | 'Em Manutencao' | 'Desativada' | 'Inativa'

export interface Area {
  id: string
  nome: string
  descricao?: string
  created_at: string
  updated_at: string
}

export interface MotivoParada {
  id: string
  maquinario_id: string
  descricao: string
  created_at: string
  updated_at: string
}

export interface ChecklistItem {
  id: string
  maquinario_id: string
  descricao: string
  tipo: 'Limpeza' | 'Manutenção'
  ordem: number
  created_at: string
  updated_at: string
}

export interface Maquinario {
  id: string
  identificacao: string
  nome_operador: string
  area_id: string
  categoria: 'Crítica' | 'Normal'
  tempo_disponivel_horas: number
  status_maquinario?: StatusMaquinario
  motivo_inativacao?: string | null
  imagem_url?: string | null
  manutencao_periodo_dias?: number | null
  proxima_limpeza_em?: string | null
  created_at: string
  updated_at: string
  // Relacionamentos (populados via join)
  area?: Area
  motivos_parada?: MotivoParada[]
  checklist_itens?: ChecklistItem[]
  // Status calculado (não vem do banco, calculado no frontend)
  status_calculado?: StatusMaquinarioCalculado
}

export interface MaquinarioFormData {
  identificacao: string
  nome_operador: string
  area_id: string
  categoria: 'Crítica' | 'Normal'
  tempo_disponivel_horas: number
  status_maquinario?: StatusMaquinario
  motivo_inativacao?: string | null
  imagem_url?: string | null
  manutencao_periodo_dias?: number | null
  proxima_limpeza_em?: string | null
  motivos_parada: string[]
  checklist_itens: Omit<ChecklistItem, 'id' | 'maquinario_id' | 'created_at' | 'updated_at'>[]
}
