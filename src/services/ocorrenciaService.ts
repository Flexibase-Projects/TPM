import { supabase } from './supabase'
import type { 
  OcorrenciaManutencao, 
  OcorrenciaFormData, 
  StatusHistorico, 
  TemposCalculados,
  TransicaoStatusData,
  StatusOcorrencia 
} from '../types/ocorrencia'
import { updateStatusMaquinario } from './maquinarioService'

export const getOcorrencias = async (): Promise<OcorrenciaManutencao[]> => {
  // #region agent log
  fetch('http://127.0.0.1:7247/ingest/d688d544-a3d8-45d0-aec4-1bbd8aaad8c9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ocorrenciaService.ts:4',message:'getOcorrencias called',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  const { data, error } = await supabase
    .from('TPM_ocorrencias_manutencao')
    .select(`
      *,
      maquinario:TPM_maquinarios(id, identificacao, nome_operador, categoria)
    `)
    .order('data_ocorrencia', { ascending: false })

  // #region agent log
  fetch('http://127.0.0.1:7247/ingest/d688d544-a3d8-45d0-aec4-1bbd8aaad8c9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ocorrenciaService.ts:13',message:'getOcorrencias result',data:{hasData:!!data,dataCount:data?.length||0,hasError:!!error,error:error?{message:error.message,code:error.code,details:error.details}:null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  if (error) throw error
  
  // Transformar os dados para o formato esperado
  return (data || []).map((item: any) => ({
    ...item,
    maquinario: Array.isArray(item.maquinario) ? item.maquinario[0] : item.maquinario,
  })) as OcorrenciaManutencao[]
}

export const getOcorrenciaById = async (id: string): Promise<OcorrenciaManutencao> => {
  const { data, error } = await supabase
    .from('TPM_ocorrencias_manutencao')
    .select(`
      *,
      maquinario:TPM_maquinarios(id, identificacao, nome_operador, categoria)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  
  // Transformar os dados para o formato esperado
  const result = {
    ...data,
    maquinario: Array.isArray(data.maquinario) ? data.maquinario[0] : data.maquinario,
  } as OcorrenciaManutencao
  
  return result
}

export const getOcorrenciasByMaquinario = async (maquinarioId: string): Promise<OcorrenciaManutencao[]> => {
  const { data, error } = await supabase
    .from('TPM_ocorrencias_manutencao')
    .select(`
      *,
      maquinario:TPM_maquinarios(id, identificacao, nome_operador, categoria)
    `)
    .eq('maquinario_id', maquinarioId)
    .order('data_ocorrencia', { ascending: false })

  if (error) throw error
  
  return (data || []).map((item: any) => ({
    ...item,
    maquinario: Array.isArray(item.maquinario) ? item.maquinario[0] : item.maquinario,
  })) as OcorrenciaManutencao[]
}

export const createOcorrencia = async (formData: OcorrenciaFormData): Promise<OcorrenciaManutencao> => {
  // #region agent log
  fetch('http://127.0.0.1:7247/ingest/d688d544-a3d8-45d0-aec4-1bbd8aaad8c9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ocorrenciaService.ts:67',message:'createOcorrencia entry',data:{formData},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion
  const insertData: any = {
    maquinario_id: formData.maquinario_id,
    tipo_om: formData.tipo_om || 'Corretiva',
    categoria: formData.categoria,
    descricao: formData.descricao,
    data_ocorrencia: formData.data_ocorrencia,
    responsavel: formData.responsavel || null,
    status: formData.status,
    observacoes: formData.observacoes || null,
  }
  // #region agent log
  fetch('http://127.0.0.1:7247/ingest/d688d544-a3d8-45d0-aec4-1bbd8aaad8c9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ocorrenciaService.ts:72',message:'Before Supabase insert ocorrencia',data:{insertData},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion
  const { data, error } = await supabase
    .from('TPM_ocorrencias_manutencao')
    .insert(insertData)
    .select(`
      *,
      maquinario:TPM_maquinarios(id, identificacao, nome_operador)
    `)
    .single()

  // #region agent log
  fetch('http://127.0.0.1:7247/ingest/d688d544-a3d8-45d0-aec4-1bbd8aaad8c9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ocorrenciaService.ts:95',message:'After Supabase insert ocorrencia',data:{hasData:!!data,hasError:!!error,error:error?{message:error.message,code:error.code,details:error.details}:null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion
  if (error) throw error
  
  const result = {
    ...data,
    maquinario: Array.isArray(data.maquinario) ? data.maquinario[0] : data.maquinario,
  } as OcorrenciaManutencao

  // Se for OM Corretiva, atualizar status da máquina para "Em Manutenção"
  if (formData.tipo_om === 'Corretiva' || !formData.tipo_om) {
    try {
      await updateStatusMaquinario(formData.maquinario_id, 'Disponivel', null)
      // Não mudamos para "Desativada" porque o status será calculado automaticamente
      // baseado nas OMs abertas
    } catch (err) {
      console.error('Erro ao atualizar status da máquina:', err)
      // Não lançar erro aqui para não impedir a criação da OM
    }
  }
  
  return result
}

export const updateOcorrencia = async (
  id: string,
  formData: OcorrenciaFormData
): Promise<OcorrenciaManutencao> => {
  // Buscar ocorrência atual para verificar se está sendo fechada
  const ocorrenciaAtual = await getOcorrenciaById(id)
  
  const updateData: any = {
    maquinario_id: formData.maquinario_id,
    tipo_om: formData.tipo_om || ocorrenciaAtual.tipo_om || 'Corretiva',
    categoria: formData.categoria,
    descricao: formData.descricao,
    data_ocorrencia: formData.data_ocorrencia,
    responsavel: formData.responsavel || null,
    status: formData.status,
    observacoes: formData.observacoes || null,
  }

  // Se status está mudando para "concluído" e ainda não tem data_fechamento, definir agora
  if (formData.status === 'concluído' && !ocorrenciaAtual.data_fechamento) {
    updateData.data_fechamento = new Date().toISOString()
  }
  // Se status não é mais "concluído", limpar data_fechamento
  else if (formData.status !== 'concluído') {
    updateData.data_fechamento = null
  }

  const { error } = await supabase
    .from('TPM_ocorrencias_manutencao')
    .update(updateData)
    .eq('id', id)

  if (error) throw error

  return getOcorrenciaById(id)
}

export const deleteOcorrencia = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('TPM_ocorrencias_manutencao')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

/**
 * Assumir uma ocorrência (chamado) - define responsável e data de recebimento
 * Após receber, o status muda para "em execução" (técnico está trabalhando)
 * O técnico pode então escolher: FILA (se precisa de algo), CONCLUÍDO ou CANCELADO
 */
export const assumirOcorrencia = async (
  id: string,
  responsavel: string,
  comentario?: string
): Promise<OcorrenciaManutencao> => {
  const ocorrenciaAtual = await getOcorrenciaById(id)
  
  if (ocorrenciaAtual.status !== 'novo') {
    throw new Error('Apenas ocorrências com status "novo" podem ser recebidas')
  }

  const dataRecebimento = new Date().toISOString()
  const novoStatus: StatusOcorrencia = 'em execução'

  // Desabilitar temporariamente o trigger para evitar duplicação
  // Vamos criar manualmente o registro na timeline primeiro
  const { error: historicoError } = await supabase
    .from('TPM_ocorrencias_status_historico')
    .insert({
      ocorrencia_id: id,
      status_anterior: 'novo',
      status_novo: novoStatus,
      comentario: comentario || 'Chamado recebido na manutenção',
      responsavel,
    })

  if (historicoError) throw historicoError

  // Agora atualizar a ocorrência (o trigger não vai criar porque já existe um registro recente)
  // Mas para garantir, vamos usar uma abordagem diferente: atualizar sem mudar status primeiro
  // Na verdade, melhor: vamos atualizar e depois deletar qualquer duplicata criada pelo trigger
  
  const { error: updateError } = await supabase
    .from('TPM_ocorrencias_manutencao')
    .update({
      responsavel,
      data_recebimento: dataRecebimento,
      status: novoStatus,
    })
    .eq('id', id)

  if (updateError) throw updateError

  // Deletar qualquer registro duplicado criado pelo trigger
  // O trigger cria um registro sem comentário, então vamos deletar todos os registros sem comentário
  // que foram criados nos últimos 5 segundos (janela de segurança maior)
  const agora = new Date()
  const cincoSegundosAtras = new Date(agora.getTime() - 5000).toISOString()
  
  const { data: registrosDuplicados } = await supabase
    .from('TPM_ocorrencias_status_historico')
    .select('id')
    .eq('ocorrencia_id', id)
    .eq('status_anterior', 'novo')
    .eq('status_novo', novoStatus)
    .is('comentario', null)
    .gte('created_at', cincoSegundosAtras)
  
  if (registrosDuplicados && registrosDuplicados.length > 0) {
    // Deletar todos os registros duplicados (sem comentário)
    await supabase
      .from('TPM_ocorrencias_status_historico')
      .delete()
      .in('id', registrosDuplicados.map(r => r.id))
  }
  
  // Também limpar registros duplicados antigos que possam ter sido criados anteriormente
  // Buscar todos os registros duplicados (mesmo status_anterior e status_novo) sem comentário
  const { data: todosDuplicados } = await supabase
    .from('TPM_ocorrencias_status_historico')
    .select('id, created_at, comentario')
    .eq('ocorrencia_id', id)
    .eq('status_anterior', 'novo')
    .eq('status_novo', novoStatus)
    .order('created_at', { ascending: false })
  
  if (todosDuplicados && todosDuplicados.length > 1) {
    // Manter apenas o primeiro (mais recente com comentário) e deletar os outros sem comentário
    const idsParaDeletar = todosDuplicados
      .slice(1) // Pular o primeiro
      .filter(r => !r.comentario) // Apenas os sem comentário
      .map(r => r.id)
    
    if (idsParaDeletar.length > 0) {
      await supabase
        .from('TPM_ocorrencias_status_historico')
        .delete()
        .in('id', idsParaDeletar)
    }
  }

  return getOcorrenciaById(id)
}

/**
 * Transicionar status de uma ocorrência com comentário
 */
export const transicionarStatus = async (
  id: string,
  transicao: TransicaoStatusData
): Promise<OcorrenciaManutencao> => {
  const ocorrenciaAtual = await getOcorrenciaById(id)

  // Validar se comentário é obrigatório
  // Apenas "na fila" requer comentário obrigatório
  if (transicao.novoStatus === 'na fila' && !transicao.comentario?.trim()) {
    throw new Error('Comentário é obrigatório para enviar para fila. Informe o número da ordem de compra ou tipo de serviço solicitado externamente.')
  }

  const updateData: any = {
    status: transicao.novoStatus,
  }

  // Se está mudando responsável, atualizar
  if (transicao.responsavel && transicao.responsavel !== ocorrenciaAtual.responsavel) {
    updateData.responsavel = transicao.responsavel
  }

  // Se status está mudando para "concluído" e ainda não tem data_fechamento, definir agora
  if (transicao.novoStatus === 'concluído' && !ocorrenciaAtual.data_fechamento) {
    updateData.data_fechamento = new Date().toISOString()
  }
  // Se status não é mais "concluído", limpar data_fechamento
  else if (transicao.novoStatus !== 'concluído' && ocorrenciaAtual.data_fechamento) {
    updateData.data_fechamento = null
  }

  // Atualizar ocorrência (o trigger vai criar o registro na timeline)
  const { error: updateError } = await supabase
    .from('TPM_ocorrencias_manutencao')
    .update(updateData)
    .eq('id', id)

  if (updateError) throw updateError

  // Atualizar o registro mais recente na timeline (criado pelo trigger) com comentário e responsável
  if (transicao.comentario || transicao.responsavel) {
    // Buscar o ID do registro mais recente para esta transição
    const { data: historicoRecente } = await supabase
      .from('TPM_ocorrencias_status_historico')
      .select('id')
      .eq('ocorrencia_id', id)
      .eq('status_anterior', ocorrenciaAtual.status)
      .eq('status_novo', transicao.novoStatus)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (historicoRecente) {
      await supabase
        .from('TPM_ocorrencias_status_historico')
        .update({
          comentario: transicao.comentario || null,
          responsavel: transicao.responsavel || null,
        })
        .eq('id', historicoRecente.id)
    }
  }

  return getOcorrenciaById(id)
}

/**
 * Obter histórico completo de status (timeline)
 * Remove duplicatas automaticamente
 */
export const getHistoricoStatus = async (ocorrenciaId: string): Promise<StatusHistorico[]> => {
  const { data, error } = await supabase
    .from('TPM_ocorrencias_status_historico')
    .select('*')
    .eq('ocorrencia_id', ocorrenciaId)
    .order('created_at', { ascending: true })

  if (error) throw error

  if (!data || data.length === 0) return []

  // Remover duplicatas: manter apenas o primeiro registro de cada transição única
  // (status_anterior + status_novo + created_at similar)
  const registrosUnicos: StatusHistorico[] = []
  const transicoesVistas = new Set<string>()

  for (const registro of data) {
    // Criar chave única baseada em status_anterior, status_novo e data (arredondada para minuto)
    const dataMinuto = new Date(registro.created_at).toISOString().substring(0, 16) // YYYY-MM-DDTHH:mm
    const chave = `${registro.status_anterior || 'null'}_${registro.status_novo}_${dataMinuto}`
    
    // Se já vimos esta transição neste minuto, pular (é duplicata)
    if (transicoesVistas.has(chave)) {
      // Se o registro atual tem comentário e o anterior não tinha, substituir
      const indiceAnterior = registrosUnicos.findIndex(r => {
        const rDataMinuto = new Date(r.created_at).toISOString().substring(0, 16)
        const rChave = `${r.status_anterior || 'null'}_${r.status_novo}_${rDataMinuto}`
        return rChave === chave
      })
      
      if (indiceAnterior >= 0 && !registrosUnicos[indiceAnterior].comentario && registro.comentario) {
        // Substituir o registro anterior sem comentário por este com comentário
        registrosUnicos[indiceAnterior] = registro as StatusHistorico
      }
      continue
    }
    
    transicoesVistas.add(chave)
    registrosUnicos.push(registro as StatusHistorico)
  }

  return registrosUnicos
}

/**
 * Calcular tempos baseado na timeline
 */
export const calcularTempos = async (ocorrenciaId: string): Promise<TemposCalculados> => {
  const { data, error } = await supabase
    .rpc('calcular_tempos_om', { ocorrencia_id_param: ocorrenciaId })

  if (error) throw error

  if (!data || data.length === 0) {
    return {
      tempo_em_fila: 0,
      tempo_em_execucao: 0,
      tempo_total: 0,
    }
  }

  return data[0] as TemposCalculados
}

/**
 * Atualizar categoria de uma ocorrência
 */
export const atualizarCategoria = async (
  id: string,
  categoria: string
): Promise<OcorrenciaManutencao> => {
  const { error } = await supabase
    .from('TPM_ocorrencias_manutencao')
    .update({ categoria })
    .eq('id', id)

  if (error) throw error

  return getOcorrenciaById(id)
}
