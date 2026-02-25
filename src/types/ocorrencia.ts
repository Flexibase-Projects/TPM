// Tipos relacionados a Ocorrências de Manutenção

export type TipoOM = 'Corretiva' | 'Preventiva' | 'Preditiva'
export type CategoriaOcorrencia = 'Vermelho' | 'Verde' | 'Azul'
export type StatusOcorrencia = 'novo' | 'na fila' | 'em execução' | 'em espera' | 'concluído' | 'cancelado'

export interface OcorrenciaManutencao {
  id: string
  maquinario_id: string
  tipo_om?: TipoOM
  categoria: CategoriaOcorrencia
  descricao: string
  data_ocorrencia: string
  data_fechamento?: string | null
  data_recebimento?: string | null
  responsavel?: string
  status: StatusOcorrencia
  observacoes?: string
  created_at: string
  updated_at: string
  // Relacionamentos (populados via join)
  maquinario?: {
    id: string
    identificacao: string
    nome_operador: string
    categoria: 'Crítica' | 'Normal'
  }
  // Tempos calculados (opcional, pode ser calculado via função)
  tempo_em_fila?: number
  tempo_em_execucao?: number
  tempo_total?: number
}

export interface OcorrenciaFormData {
  maquinario_id: string
  tipo_om?: TipoOM
  categoria: CategoriaOcorrencia
  descricao: string
  data_ocorrencia: string
  responsavel?: string
  status: StatusOcorrencia
  observacoes?: string
}

export interface StatusHistorico {
  id: string
  ocorrencia_id: string
  status_anterior: string | null
  status_novo: string
  comentario: string | null
  responsavel: string | null
  created_at: string
}

export interface TemposCalculados {
  tempo_em_fila: number
  tempo_em_execucao: number
  tempo_total: number
}

export interface TransicaoStatusData {
  novoStatus: StatusOcorrencia
  comentario?: string
  responsavel: string
}
