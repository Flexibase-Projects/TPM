// Tipos relacionados a Paradas de Maquinários

export type TipoRegistroParada = 'Manual' | 'Automatico'

export interface Parada {
  id: string
  maquinario_id: string
  ocorrencia_id?: string | null
  data_parada: string // DATE format
  hora_inicio: string // TIME format (HH:MM:SS)
  hora_fim: string // TIME format (HH:MM:SS)
  horas_paradas: number
  motivo_parada_id?: string | null
  observacoes?: string | null
  tipo_registro: TipoRegistroParada
  created_at: string
  updated_at: string
  // Relacionamentos (populados via join)
  motivo_parada?: {
    id: string
    descricao: string
  }
  ocorrencia?: {
    id: string
    descricao: string
  }
  maquinario?: {
    id: string
    identificacao: string
    categoria: 'Crítica' | 'Normal'
    area?: {
      id: string
      nome: string
    }
  }
}

export interface ParadaFormData {
  maquinario_id: string
  data_parada: string // DATE format (YYYY-MM-DD)
  hora_inicio: string // TIME format (HH:MM) ou apenas horas
  hora_fim?: string // TIME format (HH:MM) - opcional se usar apenas horas
  horas_paradas?: number // Opcional, calculado automaticamente se não fornecido
  motivo_parada_id?: string
  observacoes?: string
}

export interface TempoDisponivelDiario {
  id: string
  maquinario_id: string
  data: string // DATE format
  horas_disponiveis: number
  created_at: string
  updated_at: string
}
