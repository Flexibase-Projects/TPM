import type { Maquinario, StatusMaquinarioCalculado } from '../types/maquinario'
import type { OcorrenciaManutencao } from '../types/ocorrencia'

/**
 * Calcula o status de um maquinário baseado em seu status manual e OMs abertas
 * 
 * Lógica de prioridade:
 * 1. Se status = "Inativa" → sempre "Inativa" (ignora OMs)
 * 2. Se status = "Desativada" E tem OM aberta → "Em Manutenção"
 * 3. Se status = "Desativada" E não tem OM → "Desativada"
 * 4. Se tem OM aberta → "Em Manutenção"
 * 5. Caso contrário → "Disponível"
 */
export const calcularStatusMaquinario = (
  maquinario: Maquinario,
  ocorrenciasAbertas: OcorrenciaManutencao[] = []
): StatusMaquinarioCalculado => {
  const statusManual = maquinario.status_maquinario || 'Disponivel'
  const temOMAberta = ocorrenciasAbertas.length > 0

  // Prioridade 1: Inativa sempre é Inativa
  if (statusManual === 'Inativa') {
    return 'Inativa'
  }

  // Prioridade 2 e 3: Desativada
  if (statusManual === 'Desativada') {
    if (temOMAberta) {
      return 'Em Manutencao'
    }
    return 'Desativada'
  }

  // Prioridade 4: Tem OM aberta
  if (temOMAberta) {
    return 'Em Manutencao'
  }

  // Prioridade 5: Disponível
  return 'Disponivel'
}

/**
 * Verifica se uma ocorrência está aberta (não concluída e não cancelada)
 * Considera apenas OMs Corretivas para afetar o status da máquina
 */
export const isOcorrenciaAberta = (ocorrencia: OcorrenciaManutencao): boolean => {
  // Apenas OMs Corretivas afetam o status da máquina
  if (ocorrencia.tipo_om && ocorrencia.tipo_om !== 'Corretiva') {
    return false
  }
  // Se não tem tipo_om definido, assume que é Corretiva (compatibilidade com dados antigos)
  return ocorrencia.status !== 'concluído' && ocorrencia.status !== 'cancelado'
}
