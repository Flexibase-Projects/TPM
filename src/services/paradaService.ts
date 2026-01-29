import { supabase } from './supabase'
import type { Parada, ParadaFormData, TempoDisponivelDiario } from '../types/parada'

const HORARIO_INICIO_TRABALHO = '08:00:00'
const HORARIO_FIM_TRABALHO = '18:00:00'
const HORAS_DISPONIVEIS_PADRAO = 10

/**
 * Calcula horas de parada considerando horário de trabalho (8h-18h)
 * Arredonda para minutos (evita decimais muito longos)
 */
export const calcularHorasParada = (
  horaInicio: string,
  horaFim: string
): number => {
  const inicioTrabalho = HORARIO_INICIO_TRABALHO
  const fimTrabalho = HORARIO_FIM_TRABALHO

  // Converter para minutos para facilitar cálculo
  const minutosInicioTrabalho = timeToMinutes(inicioTrabalho)
  const minutosFimTrabalho = timeToMinutes(fimTrabalho)
  const minutosInicio = timeToMinutes(horaInicio)
  const minutosFim = timeToMinutes(horaFim)

  // Ajustar início para não ser antes das 8h
  const inicioEfetivo = Math.max(minutosInicio, minutosInicioTrabalho)

  // Ajustar fim para não ser depois das 18h
  const fimEfetivo = Math.min(minutosFim, minutosFimTrabalho)

  // Calcular minutos de diferença
  const minutosParados = fimEfetivo - inicioEfetivo

  // Retornar 0 se o resultado for negativo ou zero
  if (minutosParados <= 0) {
    return 0
  }

  // Arredondar para minutos e converter para horas decimais
  // Ex: 90 minutos = 1.5 horas, 95 minutos = 1.5833... → arredondar para 95 minutos = 1.5833
  // Mas vamos arredondar para o minuto mais próximo
  const minutosArredondados = Math.round(minutosParados)
  const horas = minutosArredondados / 60

  // Arredondar para 2 casas decimais (precisão de minutos)
  return Math.round(horas * 100) / 100
}

/**
 * Converte string de tempo (HH:MM:SS ou HH:MM) para minutos
 */
const timeToMinutes = (time: string): number => {
  const parts = time.split(':')
  const hours = parseInt(parts[0], 10)
  const minutes = parseInt(parts[1] || '0', 10)
  return hours * 60 + minutes
}

/**
 * Converte minutos para string de tempo (HH:MM)
 */
const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

/**
 * Obtém ou cria registro de tempo disponível para um maquinário em uma data
 */
export const getOrCreateTempoDisponivel = async (
  maquinarioId: string,
  data: string
): Promise<TempoDisponivelDiario> => {
  // Tentar buscar registro existente
  const { data: existing, error: fetchError } = await supabase
    .from('TPM_tempo_disponivel_diario')
    .select('*')
    .eq('maquinario_id', maquinarioId)
    .eq('data', data)
    .single()

  if (existing) {
    return existing as TempoDisponivelDiario
  }

  // Criar novo registro com valor padrão
  const { data: newRecord, error: createError } = await supabase
    .from('TPM_tempo_disponivel_diario')
    .insert({
      maquinario_id: maquinarioId,
      data,
      horas_disponiveis: HORAS_DISPONIVEIS_PADRAO,
    })
    .select()
    .single()

  if (createError) throw createError
  return newRecord as TempoDisponivelDiario
}

/**
 * Deduz horas do tempo disponível do dia
 */
export const deduzirTempoDisponivel = async (
  maquinarioId: string,
  data: string,
  horas: number
): Promise<void> => {
  const tempoDisponivel = await getOrCreateTempoDisponivel(maquinarioId, data)

  const novasHorasDisponiveis = Math.max(
    0,
    tempoDisponivel.horas_disponiveis - horas
  )

  const { error } = await supabase
    .from('TPM_tempo_disponivel_diario')
    .update({ horas_disponiveis: novasHorasDisponiveis })
    .eq('id', tempoDisponivel.id)

  if (error) throw error
}

/**
 * Cria uma parada manual
 */
export const createParadaManual = async (
  formData: ParadaFormData
): Promise<Parada> => {
  // Calcular horas se não fornecidas
  let horasParadas = formData.horas_paradas

  if (!horasParadas || horasParadas === 0) {
    if (formData.hora_inicio && formData.hora_fim) {
      horasParadas = calcularHorasParada(formData.hora_inicio, formData.hora_fim)
    } else if (formData.horas_paradas === undefined && formData.hora_inicio) {
      // Se não tem hora_fim nem horas_paradas, assumir que hora_inicio pode ser número de horas
      const horasParseadas = parseFloat(formData.hora_inicio)
      if (!isNaN(horasParseadas) && !formData.hora_inicio.includes(':')) {
        horasParadas = horasParseadas
      } else {
        throw new Error('Informe a hora de fim ou as horas paradas')
      }
    } else {
      throw new Error('Informe a hora de início e fim, ou as horas paradas')
    }
  }

  // Validar que horas não excedam tempo disponível
  const tempoDisponivel = await getOrCreateTempoDisponivel(
    formData.maquinario_id,
    formData.data_parada
  )

  if (horasParadas > tempoDisponivel.horas_disponiveis) {
    throw new Error(
      `Horas de parada (${horasParadas}h) excedem o tempo disponível (${tempoDisponivel.horas_disponiveis}h)`
    )
  }

  // Garantir que hora_inicio e hora_fim estão no formato correto (HH:MM:SS)
  let horaInicio = formData.hora_inicio || '08:00'
  let horaFim = formData.hora_fim

  // Se hora_inicio é um número (sem :), converter para formato TIME
  if (horaInicio && !horaInicio.includes(':')) {
    const horas = parseFloat(horaInicio)
    if (!isNaN(horas)) {
      horaInicio = minutesToTime(Math.floor(horas * 60))
    }
  }

  // Adicionar segundos se não tiver (formato HH:MM -> HH:MM:SS)
  if (horaInicio && horaInicio.split(':').length === 2) {
    horaInicio = horaInicio + ':00'
  }

  // Se não tem hora_fim, calcular baseado nas horas paradas a partir da hora_inicio
  if (!horaFim) {
    const minutosInicio = timeToMinutes(horaInicio)
    const minutosFim = minutosInicio + Math.floor(horasParadas * 60)
    horaFim = minutesToTime(minutosFim)
  }

  // Adicionar segundos se não tiver (formato HH:MM -> HH:MM:SS)
  if (horaFim && horaFim.split(':').length === 2) {
    horaFim = horaFim + ':00'
  }

  // Criar parada
  const { data, error } = await supabase
    .from('TPM_paradas')
    .insert({
      maquinario_id: formData.maquinario_id,
      ocorrencia_id: null,
      data_parada: formData.data_parada,
      hora_inicio: horaInicio,
      hora_fim: horaFim,
      horas_paradas: horasParadas,
      motivo_parada_id: formData.motivo_parada_id || null,
      observacoes: formData.observacoes || null,
      tipo_registro: 'Manual',
    })
    .select(`
      *,
      motivo_parada:TPM_motivos_parada(id, descricao)
    `)
    .single()

  if (error) throw error

  // Deduzir horas do tempo disponível
  await deduzirTempoDisponivel(formData.maquinario_id, formData.data_parada, horasParadas)

  return data as Parada
}

/**
 * Busca paradas de um maquinário
 */
export const getParadasByMaquinario = async (
  maquinarioId: string
): Promise<Parada[]> => {
  const { data, error } = await supabase
    .from('TPM_paradas')
    .select(`
      *,
      motivo_parada:TPM_motivos_parada(id, descricao),
      ocorrencia:TPM_ocorrencias_manutencao(id, descricao)
    `)
    .eq('maquinario_id', maquinarioId)
    .order('data_parada', { ascending: false })
    .order('hora_inicio', { ascending: false })
    .limit(50)

  if (error) throw error
  return (data || []) as Parada[]
}

/**
 * Busca paradas por data
 */
export const getParadasByData = async (
  maquinarioId: string,
  data: string
): Promise<Parada[]> => {
  const { data: paradas, error } = await supabase
    .from('TPM_paradas')
    .select(`
      *,
      motivo_parada:TPM_motivos_parada(id, descricao)
    `)
    .eq('maquinario_id', maquinarioId)
    .eq('data_parada', data)
    .order('hora_inicio', { ascending: true })

  if (error) throw error
  return (paradas || []) as Parada[]
}

/**
 * Busca tempo disponível de um maquinário em uma data
 */
export const getTempoDisponivel = async (
  maquinarioId: string,
  data: string
): Promise<TempoDisponivelDiario | null> => {
  const { data: tempo, error } = await supabase
    .from('TPM_tempo_disponivel_diario')
    .select('*')
    .eq('maquinario_id', maquinarioId)
    .eq('data', data)
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 = not found
  return tempo as TempoDisponivelDiario | null
}

/**
 * Atualiza uma parada existente
 */
export const updateParada = async (
  paradaId: string,
  formData: ParadaFormData
): Promise<Parada> => {
  // Calcular horas se não fornecidas
  let horasParadas = formData.horas_paradas

  if (!horasParadas || horasParadas === 0) {
    if (formData.hora_inicio && formData.hora_fim) {
      horasParadas = calcularHorasParada(formData.hora_inicio, formData.hora_fim)
    } else {
      throw new Error('Informe a hora de início e fim, ou as horas paradas')
    }
  }

  // Garantir que hora_inicio e hora_fim estão no formato correto (HH:MM:SS)
  let horaInicio = formData.hora_inicio || '08:00'
  let horaFim = formData.hora_fim

  // Adicionar segundos se não tiver (formato HH:MM -> HH:MM:SS)
  if (horaInicio && horaInicio.split(':').length === 2) {
    horaInicio = horaInicio + ':00'
  }

  if (!horaFim) {
    const minutosInicio = timeToMinutes(horaInicio)
    const minutosFim = minutosInicio + Math.floor(horasParadas * 60)
    horaFim = minutesToTime(minutosFim)
  }

  // Adicionar segundos se não tiver (formato HH:MM -> HH:MM:SS)
  if (horaFim && horaFim.split(':').length === 2) {
    horaFim = horaFim + ':00'
  }

  // Atualizar parada
  const { data, error } = await supabase
    .from('TPM_paradas')
    .update({
      data_parada: formData.data_parada,
      hora_inicio: horaInicio,
      hora_fim: horaFim,
      horas_paradas: horasParadas,
      motivo_parada_id: formData.motivo_parada_id || null,
      observacoes: formData.observacoes || null,
    })
    .eq('id', paradaId)
    .select(`
      *,
      motivo_parada:TPM_motivos_parada(id, descricao)
    `)
    .single()

  if (error) throw error

  return data as Parada
}

/**
 * Exclui uma parada
 */
export const deleteParada = async (paradaId: string): Promise<void> => {
  const { error } = await supabase
    .from('TPM_paradas')
    .delete()
    .eq('id', paradaId)

  if (error) throw error
}

/**
 * Busca todas as paradas com relacionamentos completos
 */
export const getAllParadas = async (): Promise<Parada[]> => {
  const { data, error } = await supabase
    .from('TPM_paradas')
    .select(`
      *,
      motivo_parada:TPM_motivos_parada(id, descricao),
      ocorrencia:TPM_ocorrencias_manutencao(id, descricao),
      maquinario:TPM_maquinarios(
        id,
        identificacao,
        categoria,
        area:TPM_areas(id, nome)
      )
    `)
    .order('data_parada', { ascending: false })
    .order('hora_fim', { ascending: false })

  if (error) throw error

  // Transformar os dados para o formato esperado
  return (data || []).map((item: any) => {
    const maquinario = Array.isArray(item.maquinario) ? item.maquinario[0] : item.maquinario
    return {
      ...item,
      motivo_parada: Array.isArray(item.motivo_parada) ? item.motivo_parada[0] : item.motivo_parada,
      ocorrencia: Array.isArray(item.ocorrencia) ? item.ocorrencia[0] : item.ocorrencia,
      maquinario: maquinario
        ? {
            ...maquinario,
            area: Array.isArray(maquinario.area) ? maquinario.area[0] : maquinario.area,
          }
        : undefined,
    }
  }) as Parada[]
}
