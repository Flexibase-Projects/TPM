import { supabase } from './supabase'
import type { Maquinario, Area, MaquinarioFormData, StatusMaquinario } from '../types/maquinario'
import type { OcorrenciaManutencao } from '../types/ocorrencia'

// Áreas
export const getAreas = async (): Promise<Area[]> => {
  const { data, error } = await supabase
    .from('TPM_areas')
    .select('*')
    .order('nome')

  if (error) throw error
  return data || []
}

export const createArea = async (nome: string, descricao?: string): Promise<Area> => {
  const { data, error } = await supabase
    .from('TPM_areas')
    .insert({ nome, descricao })
    .select()
    .single()

  if (error) throw error
  return data
}

// Maquinários
export const getMaquinarios = async (): Promise<Maquinario[]> => {
  const { data, error } = await supabase
    .from('TPM_maquinarios')
    .select(`
      *,
      area:TPM_areas(*),
      motivos_parada:TPM_motivos_parada(*),
      checklist_itens:TPM_checklist_itens(*)
    `)
    .order('identificacao')

  if (error) throw error
  
  // Transformar os dados para o formato esperado
  return (data || []).map((item: any) => ({
    ...item,
    area: Array.isArray(item.area) ? item.area[0] : item.area,
  })) as Maquinario[]
}

export const getMaquinarioById = async (id: string): Promise<Maquinario> => {
  const { data, error } = await supabase
    .from('TPM_maquinarios')
    .select(`
      *,
      area:TPM_areas(*),
      motivos_parada:TPM_motivos_parada(*),
      checklist_itens:TPM_checklist_itens(*)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  
  // Transformar os dados para o formato esperado
  const result = {
    ...data,
    area: Array.isArray(data.area) ? data.area[0] : data.area,
  } as Maquinario
  
  return result
}

export const createMaquinario = async (formData: MaquinarioFormData): Promise<Maquinario> => {
  // Criar maquinário
  const { data: maquinario, error: maqError } = await supabase
    .from('TPM_maquinarios')
    .insert({
      identificacao: formData.identificacao,
      nome_operador: formData.nome_operador,
      area_id: formData.area_id,
      categoria: formData.categoria,
      tempo_disponivel_horas: formData.tempo_disponivel_horas,
      status_maquinario: formData.status_maquinario || 'Disponivel',
      motivo_inativacao: formData.motivo_inativacao || null,
    })
    .select()
    .single()

  if (maqError) throw maqError

  // Criar motivos de parada
  if (formData.motivos_parada.length > 0) {
    const motivos = formData.motivos_parada.map(descricao => ({
      maquinario_id: maquinario.id,
      descricao,
    }))

    const { error: motivosError } = await supabase
      .from('TPM_motivos_parada')
      .insert(motivos)

    if (motivosError) throw motivosError
  }

  // Criar itens de checklist
  if (formData.checklist_itens.length > 0) {
    const itens = formData.checklist_itens.map(item => ({
      maquinario_id: maquinario.id,
      descricao: item.descricao,
      tipo: item.tipo,
      ordem: item.ordem,
    }))

    const { error: checklistError } = await supabase
      .from('TPM_checklist_itens')
      .insert(itens)

    if (checklistError) throw checklistError
  }

  // Retornar maquinário completo
  return getMaquinarioById(maquinario.id)
}

export const updateMaquinario = async (
  id: string,
  formData: MaquinarioFormData
): Promise<Maquinario> => {
  // Atualizar maquinário
  const { error: maqError } = await supabase
    .from('TPM_maquinarios')
    .update({
      identificacao: formData.identificacao,
      nome_operador: formData.nome_operador,
      area_id: formData.area_id,
      categoria: formData.categoria,
      tempo_disponivel_horas: formData.tempo_disponivel_horas,
      status_maquinario: formData.status_maquinario || 'Disponivel',
      motivo_inativacao: formData.motivo_inativacao || null,
    })
    .eq('id', id)

  if (maqError) throw maqError

  // Remover motivos de parada existentes
  await supabase.from('TPM_motivos_parada').delete().eq('maquinario_id', id)

  // Criar novos motivos de parada
  if (formData.motivos_parada.length > 0) {
    const motivos = formData.motivos_parada.map(descricao => ({
      maquinario_id: id,
      descricao,
    }))

    const { error: motivosError } = await supabase
      .from('TPM_motivos_parada')
      .insert(motivos)

    if (motivosError) throw motivosError
  }

  // Remover itens de checklist existentes
  await supabase.from('TPM_checklist_itens').delete().eq('maquinario_id', id)

  // Criar novos itens de checklist
  if (formData.checklist_itens.length > 0) {
    const itens = formData.checklist_itens.map(item => ({
      maquinario_id: id,
      descricao: item.descricao,
      tipo: item.tipo,
      ordem: item.ordem,
    }))

    const { error: checklistError } = await supabase
      .from('TPM_checklist_itens')
      .insert(itens)

    if (checklistError) throw checklistError
  }

  return getMaquinarioById(id)
}

export const deleteMaquinario = async (id: string): Promise<void> => {
  const { error } = await supabase.from('TPM_maquinarios').delete().eq('id', id)
  if (error) throw error
}

/**
 * Busca ocorrências abertas (não concluídas e não canceladas) de um maquinário
 * Considera apenas OMs Corretivas
 */
export const getOcorrenciasAbertasByMaquinario = async (
  maquinarioId: string
): Promise<OcorrenciaManutencao[]> => {
  const { data, error } = await supabase
    .from('TPM_ocorrencias_manutencao')
    .select('*')
    .eq('maquinario_id', maquinarioId)
    .or('tipo_om.is.null,tipo_om.eq.Corretiva') // Inclui OMs sem tipo_om (compatibilidade) e Corretivas
    .not('status', 'eq', 'concluído')
    .not('status', 'eq', 'cancelado')
    .order('data_ocorrencia', { ascending: false })

  if (error) throw error
  return (data || []) as OcorrenciaManutencao[]
}

/**
 * Atualiza o status de um maquinário
 */
export const updateStatusMaquinario = async (
  id: string,
  status: StatusMaquinario,
  motivoInativacao?: string | null
): Promise<Maquinario> => {
  const updateData: any = {
    status_maquinario: status,
  }

  // Se está definindo como Inativa, motivo é obrigatório
  if (status === 'Inativa') {
    if (!motivoInativacao || motivoInativacao.trim() === '') {
      throw new Error('Motivo de inativação é obrigatório')
    }
    updateData.motivo_inativacao = motivoInativacao
  } else {
    // Se não é Inativa, limpar motivo
    updateData.motivo_inativacao = null
  }

  const { error } = await supabase
    .from('TPM_maquinarios')
    .update(updateData)
    .eq('id', id)

  if (error) throw error

  return getMaquinarioById(id)
}
