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
  // #region agent log
  fetch('http://127.0.0.1:7247/ingest/d688d544-a3d8-45d0-aec4-1bbd8aaad8c9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'statusMaquinario.ts:14',message:'calcularStatusMaquinario called',data:{maquinarioId:maquinario?.id,statusManual:maquinario?.status_maquinario,ocorrenciasCount:ocorrenciasAbertas?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  const statusManual = maquinario.status_maquinario || 'Disponivel'
  const temOMAberta = ocorrenciasAbertas.length > 0

  // Prioridade 1: Inativa sempre é Inativa
  if (statusManual === 'Inativa') {
    // #region agent log
    fetch('http://127.0.0.1:7247/ingest/d688d544-a3d8-45d0-aec4-1bbd8aaad8c9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'statusMaquinario.ts:23',message:'returning Inativa',data:{maquinarioId:maquinario?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    return 'Inativa'
  }

  // Prioridade 2 e 3: Desativada
  if (statusManual === 'Desativada') {
    if (temOMAberta) {
      // #region agent log
      fetch('http://127.0.0.1:7247/ingest/d688d544-a3d8-45d0-aec4-1bbd8aaad8c9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'statusMaquinario.ts:30',message:'returning Em Manutencao (Desativada with OM)',data:{maquinarioId:maquinario?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      return 'Em Manutencao'
    }
    // #region agent log
    fetch('http://127.0.0.1:7247/ingest/d688d544-a3d8-45d0-aec4-1bbd8aaad8c9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'statusMaquinario.ts:33',message:'returning Desativada',data:{maquinarioId:maquinario?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    return 'Desativada'
  }

  // Prioridade 4: Tem OM aberta
  if (temOMAberta) {
    // #region agent log
    fetch('http://127.0.0.1:7247/ingest/d688d544-a3d8-45d0-aec4-1bbd8aaad8c9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'statusMaquinario.ts:39',message:'returning Em Manutencao (has OM)',data:{maquinarioId:maquinario?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    return 'Em Manutencao'
  }

  // Prioridade 5: Disponível
  // #region agent log
  fetch('http://127.0.0.1:7247/ingest/d688d544-a3d8-45d0-aec4-1bbd8aaad8c9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'statusMaquinario.ts:44',message:'returning Disponivel',data:{maquinarioId:maquinario?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
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
