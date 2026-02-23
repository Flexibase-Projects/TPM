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

  // Transformar os dados para o formato esperado (preservar imagem_url para exibição na lista)
  const mapped = (data || []).map((item: any) => ({
    ...item,
    area: Array.isArray(item.area) ? item.area[0] : item.area,
    imagem_url: item.imagem_url ?? null,
  })) as Maquinario[]

  return mapped
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
      imagem_url: formData.imagem_url ?? null,
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
  // Atualizar maquinário e obter linha retornada para validar persistência (ex.: imagem_url)
  const { data: updatedRow, error: maqError } = await supabase
    .from('TPM_maquinarios')
    .update({
      identificacao: formData.identificacao,
      nome_operador: formData.nome_operador,
      area_id: formData.area_id,
      categoria: formData.categoria,
      tempo_disponivel_horas: formData.tempo_disponivel_horas,
      status_maquinario: formData.status_maquinario || 'Disponivel',
      motivo_inativacao: formData.motivo_inativacao || null,
      imagem_url: formData.imagem_url ?? null,
    })
    .eq('id', id)
    .select()
    .single()

  if (maqError) throw maqError

  const expectedImagemUrl = formData.imagem_url != null && formData.imagem_url.trim() !== ''
  const actualImagemUrl = updatedRow?.imagem_url != null && String(updatedRow.imagem_url).trim() !== ''
  if (expectedImagemUrl && !actualImagemUrl) {
    throw new Error(
      'Não foi possível gravar a URL da imagem. Verifique as permissões RLS da tabela TPM_maquinarios (INSERT/UPDATE).'
    )
  }

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

const BUCKET_MAQUINARIOS_IMAGENS = 'maquinarios'

/**
 * Imagens de maquinários:
 * - Toda imagem de maquinário é enviada apenas por este módulo (via uploadImagemMaquinario).
 * - O arquivo vai para o bucket "maquinarios" e a URL é sempre persistida em TPM_maquinarios.imagem_url.
 * - A listagem de maquinários usa essa coluna para exibir a imagem; o único fluxo de upload é o formulário de criar/editar maquinário.
 */

/**
 * Retorna a URL pública para exibição da imagem.
 * Se imagem_url já for uma URL completa (http/https), retorna como está.
 * Se for um path do Storage (ex: "uuid/foto.jpg"), monta a URL pública.
 */
export const getImagemDisplayUrl = (imagemUrl: string | null | undefined): string | null => {
  if (!imagemUrl || typeof imagemUrl !== 'string' || !imagemUrl.trim()) return null
  const trimmed = imagemUrl.trim()
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed
  const { data } = supabase.storage.from(BUCKET_MAQUINARIOS_IMAGENS).getPublicUrl(trimmed)
  return data?.publicUrl ?? trimmed
}

/** Extensão permitida a partir do tipo do arquivo (um arquivo por maquinário, path fixo). */
const getExt = (file: File): string => {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext && ['jpeg', 'jpg', 'png', 'webp'].includes(ext)) return ext
  if (file.type === 'image/png') return 'png'
  if (file.type === 'image/webp') return 'webp'
  return 'jpg'
}

/**
 * Faz upload da imagem do maquinário para o Storage e retorna a URL pública.
 * A imagem fica sempre vinculada ao maquinário: path {maquinarioId}/foto.{ext} no bucket "maquinarios"
 * e a URL deve ser gravada em TPM_maquinarios.imagem_url para exibição na tabela de maquinários (upsert substitui).
 */
export const uploadImagemMaquinario = async (
  maquinarioId: string,
  file: File
): Promise<string> => {
  const ext = getExt(file)
  const path = `${maquinarioId}/foto.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET_MAQUINARIOS_IMAGENS)
    .upload(path, file, { upsert: true })

  if (error) {
    const isBucketNotFound =
      error.message?.toLowerCase().includes('bucket') && error.message?.toLowerCase().includes('not found')
    if (isBucketNotFound) {
      throw new Error(
        'Bucket de imagens não configurado. Use o bucket "maquinarios" no Supabase (Storage) e marque como público. Veja supabase/migrations/LEIA-ME_013_bucket_maquinarios_imagens.md'
      )
    }
    throw error
  }

  const { data } = supabase.storage.from(BUCKET_MAQUINARIOS_IMAGENS).getPublicUrl(path)
  return data.publicUrl
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
