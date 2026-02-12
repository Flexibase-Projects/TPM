import { supabase } from './supabase'
import { getMaquinarios } from './maquinarioService'
import { getOcorrencias } from './ocorrenciaService'
import { getAllParadas } from './paradaService'
import type { Maquinario } from '../types/maquinario'
import type { OcorrenciaManutencao } from '../types/ocorrencia'
export interface DashboardMetrics {
  totalMaquinarios: number
  maquinariosDisponiveis: number
  maquinariosEmManutencao: number
  maquinariosDesativados: number
  maquinariosInativos: number
  maquinariosCriticos: number
  totalOcorrencias: number
  ocorrenciasAbertas: number
  ocorrenciasConcluidas: number
  ocorrenciasCorretivas: number
  ocorrenciasPreventivas: number
  totalParadas: number
  horasParadasTotal: number
  horasDisponiveisTotal: number
  taxaDisponibilidade: number
  tempoMedioResolucao: number
  maquinariosComMaisParadas: Array<{
    maquinario: string
    totalParadas: number
    horasParadas: number
  }>
  ocorrenciasPorStatus: Record<string, number>
  ocorrenciasPorCategoria: Record<string, number>
  paradasPorMotivo: Array<{
    motivo: string
    quantidade: number
    horas: number
  }>
  maquinariosComMaisOcorrencias: Array<{
    maquinario: string
    totalOcorrencias: number
    ocorrenciasAbertas: number
  }>
  // Novos dados
  ocorrenciasPorMes: Array<{
    mes: string
    quantidade: number
    corretivas: number
    preventivas: number
  }>
  desempenhoFuncionarios: Array<{
    funcionario: string
    totalOcorrencias: number
    tempoMedioResolucao: number
    ocorrenciasConcluidas: number
  }>
  scoreProblemasMaquinarios: Array<{
    maquinario: string
    score: number
    totalParadas: number
    horasParadas: number
    totalOcorrencias: number
    ocorrenciasAbertas: number
    categoria: 'Crítica' | 'Normal'
  }>
}

/**
 * Calcula o status calculado de um maquinário baseado em ocorrências abertas
 */
const calcularStatusMaquinario = (
  maquinario: Maquinario,
  ocorrenciasAbertas: OcorrenciaManutencao[]
): 'Disponivel' | 'Em Manutencao' | 'Desativada' | 'Inativa' => {
  if (maquinario.status_maquinario === 'Inativa') return 'Inativa'
  if (maquinario.status_maquinario === 'Desativada') return 'Desativada'
  
  const temOcorrenciaAberta = ocorrenciasAbertas.some(
    (oc) => oc.maquinario_id === maquinario.id
  )
  
  return temOcorrenciaAberta ? 'Em Manutencao' : 'Disponivel'
}

/**
 * Calcula métricas do dashboard
 */
export const getDashboardMetrics = async (): Promise<DashboardMetrics> => {
  // Buscar todos os dados
  const [maquinarios, ocorrencias, paradas] = await Promise.all([
    getMaquinarios(),
    getOcorrencias(),
    getAllParadas(),
  ])

  // Separar ocorrências abertas e fechadas
  const ocorrenciasAbertas = ocorrencias.filter(
    (oc) => oc.status !== 'concluído' && oc.status !== 'cancelado'
  )
  const ocorrenciasConcluidas = ocorrencias.filter((oc) => oc.status === 'concluído')
  const ocorrenciasCorretivas = ocorrencias.filter(
    (oc) => oc.tipo_om === 'Corretiva' || !oc.tipo_om
  )
  const ocorrenciasPreventivas = ocorrencias.filter((oc) => oc.tipo_om === 'Preventiva')

  // Calcular status dos maquinários
  const statusCalculados = maquinarios.map((maq) =>
    calcularStatusMaquinario(maq, ocorrenciasAbertas)
  )

  const maquinariosDisponiveis = statusCalculados.filter((s) => s === 'Disponivel').length
  const maquinariosEmManutencao = statusCalculados.filter((s) => s === 'Em Manutencao').length
  const maquinariosDesativados = statusCalculados.filter((s) => s === 'Desativada').length
  const maquinariosInativos = statusCalculados.filter((s) => s === 'Inativa').length
  const maquinariosCriticos = maquinarios.filter((m) => m.categoria === 'Crítica').length

  // Calcular horas paradas e disponíveis
  const horasParadasTotal = paradas.reduce((sum, p) => sum + p.horas_paradas, 0)
  
  // Buscar tempo disponível diário dos últimos 30 dias
  const dataLimite = new Date()
  dataLimite.setDate(dataLimite.getDate() - 30)
  const dataLimiteStr = dataLimite.toISOString().split('T')[0]
  
  const { data: temposDisponiveis } = await supabase
    .from('TPM_tempo_disponivel_diario')
    .select('horas_disponiveis')
    .gte('data', dataLimiteStr)
  
  // Calcular horas disponíveis totais
  // Se houver registros de tempo disponível diário, usar esses dados
  // Caso contrário, usar tempo_disponivel_horas * 30 dias como fallback
  let horasDisponiveisTotal = 0
  if (temposDisponiveis && temposDisponiveis.length > 0) {
    horasDisponiveisTotal = temposDisponiveis.reduce(
      (sum, t) => sum + (t.horas_disponiveis || 0),
      0
    )
  } else {
    // Fallback: usar tempo_disponivel_horas * 30 dias
    const diasReferencia = 30
    horasDisponiveisTotal = maquinarios.reduce(
      (sum, m) => sum + m.tempo_disponivel_horas * diasReferencia,
      0
    )
  }

  // Taxa de disponibilidade = (horas disponíveis - horas paradas) / horas disponíveis * 100
  const taxaDisponibilidade =
    horasDisponiveisTotal > 0
      ? ((horasDisponiveisTotal - horasParadasTotal) / horasDisponiveisTotal) * 100
      : 0

  // Calcular tempo médio de resolução (apenas para ocorrências concluídas com data_fechamento)
  const ocorrenciasComTempo = ocorrenciasConcluidas.filter(
    (oc) => oc.data_ocorrencia && oc.data_fechamento
  )
  
  let tempoMedioResolucao = 0
  if (ocorrenciasComTempo.length > 0) {
    const temposTotais = ocorrenciasComTempo.map((oc) => {
      const inicio = new Date(oc.data_ocorrencia).getTime()
      const fim = new Date(oc.data_fechamento!).getTime()
      return (fim - inicio) / (1000 * 60 * 60) // Converter para horas
    })
    tempoMedioResolucao = temposTotais.reduce((sum, t) => sum + t, 0) / temposTotais.length
  }

  // Maquinários com mais paradas
  const paradasPorMaquinario = new Map<string, { totalParadas: number; horasParadas: number }>()
  
  paradas.forEach((parada) => {
    const maquinarioId = parada.maquinario_id

    const atual = paradasPorMaquinario.get(maquinarioId) || {
      totalParadas: 0,
      horasParadas: 0,
    }
    
    paradasPorMaquinario.set(maquinarioId, {
      totalParadas: atual.totalParadas + 1,
      horasParadas: atual.horasParadas + parada.horas_paradas,
    })
  })

  const maquinariosComMaisParadas = Array.from(paradasPorMaquinario.entries())
    .map(([id, dados]) => {
      const maquinario = maquinarios.find((m) => m.id === id)
      return {
        maquinario: maquinario?.identificacao || id,
        totalParadas: dados.totalParadas,
        horasParadas: dados.horasParadas,
      }
    })
    .sort((a, b) => b.horasParadas - a.horasParadas)
    .slice(0, 5)

  // Ocorrências por status
  const ocorrenciasPorStatus: Record<string, number> = {}
  ocorrencias.forEach((oc) => {
    ocorrenciasPorStatus[oc.status] = (ocorrenciasPorStatus[oc.status] || 0) + 1
  })

  // Ocorrências por categoria
  const ocorrenciasPorCategoria: Record<string, number> = {}
  ocorrencias.forEach((oc) => {
    ocorrenciasPorCategoria[oc.categoria] = (ocorrenciasPorCategoria[oc.categoria] || 0) + 1
  })

  // Paradas por motivo
  const paradasPorMotivoMap = new Map<string, { quantidade: number; horas: number }>()
  
  paradas.forEach((parada) => {
    const motivo = parada.motivo_parada?.descricao || 'Sem motivo'
    const atual = paradasPorMotivoMap.get(motivo) || { quantidade: 0, horas: 0 }
    
    paradasPorMotivoMap.set(motivo, {
      quantidade: atual.quantidade + 1,
      horas: atual.horas + parada.horas_paradas,
    })
  })

  const paradasPorMotivo = Array.from(paradasPorMotivoMap.entries())
    .map(([motivo, dados]) => ({
      motivo,
      quantidade: dados.quantidade,
      horas: dados.horas,
    }))
    .sort((a, b) => b.horas - a.horas)
    .slice(0, 5)

  // Maquinários com mais ocorrências
  const ocorrenciasPorMaquinario = new Map<string, { total: number; abertas: number }>()
  
  ocorrencias.forEach((oc) => {
    const maquinarioId = oc.maquinario_id
    const atual = ocorrenciasPorMaquinario.get(maquinarioId) || { total: 0, abertas: 0 }
    
    ocorrenciasPorMaquinario.set(maquinarioId, {
      total: atual.total + 1,
      abertas: atual.abertas + (oc.status !== 'concluído' && oc.status !== 'cancelado' ? 1 : 0),
    })
  })

  const maquinariosComMaisOcorrencias = Array.from(ocorrenciasPorMaquinario.entries())
    .map(([id, dados]) => {
      const maquinario = maquinarios.find((m) => m.id === id)
      return {
        maquinario: maquinario?.identificacao || id,
        totalOcorrencias: dados.total,
        ocorrenciasAbertas: dados.abertas,
      }
    })
    .sort((a, b) => b.totalOcorrencias - a.totalOcorrencias)
    .slice(0, 5)

  // Ocorrências por mês (últimos 12 meses)
  const ocorrenciasPorMesMap = new Map<string, { quantidade: number; corretivas: number; preventivas: number }>()
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  
  ocorrencias.forEach((oc) => {
    const data = new Date(oc.data_ocorrencia)
    const mesAno = `${meses[data.getMonth()]}/${data.getFullYear()}`
    
    const atual = ocorrenciasPorMesMap.get(mesAno) || { quantidade: 0, corretivas: 0, preventivas: 0 }
    
    ocorrenciasPorMesMap.set(mesAno, {
      quantidade: atual.quantidade + 1,
      corretivas: atual.corretivas + ((oc.tipo_om === 'Corretiva' || !oc.tipo_om) ? 1 : 0),
      preventivas: atual.preventivas + (oc.tipo_om === 'Preventiva' ? 1 : 0),
    })
  })

  // Ordenar por data (mais recente primeiro) e pegar últimos 12 meses
  const ocorrenciasPorMes = Array.from(ocorrenciasPorMesMap.entries())
    .map(([mes, dados]) => ({ mes, ...dados }))
    .sort((a, b) => {
      const [mesA, anoA] = a.mes.split('/')
      const [mesB, anoB] = b.mes.split('/')
      const indiceA = meses.indexOf(mesA)
      const indiceB = meses.indexOf(mesB)
      if (anoA !== anoB) return parseInt(anoB) - parseInt(anoA)
      return indiceB - indiceA
    })
    .slice(0, 12)
    .reverse() // Mais antigo primeiro para o gráfico

  // Desempenho dos funcionários
  const desempenhoFuncionariosMap = new Map<string, { ocorrencias: OcorrenciaManutencao[] }>()
  
  ocorrencias.forEach((oc) => {
    if (oc.responsavel) {
      const atual = desempenhoFuncionariosMap.get(oc.responsavel) || { ocorrencias: [] }
      atual.ocorrencias.push(oc)
      desempenhoFuncionariosMap.set(oc.responsavel, atual)
    }
  })

  const desempenhoFuncionarios = Array.from(desempenhoFuncionariosMap.entries())
    .map(([funcionario, dados]) => {
      const ocorrenciasConcluidas = dados.ocorrencias.filter(
        (oc) => oc.status === 'concluído' && oc.data_ocorrencia && oc.data_fechamento
      )
      
      let tempoMedioResolucao = 0
      if (ocorrenciasConcluidas.length > 0) {
        const temposTotais = ocorrenciasConcluidas.map((oc) => {
          const inicio = new Date(oc.data_ocorrencia).getTime()
          const fim = new Date(oc.data_fechamento!).getTime()
          return (fim - inicio) / (1000 * 60 * 60) // Converter para horas
        })
        tempoMedioResolucao = temposTotais.reduce((sum, t) => sum + t, 0) / temposTotais.length
      }

      return {
        funcionario,
        totalOcorrencias: dados.ocorrencias.length,
        tempoMedioResolucao,
        ocorrenciasConcluidas: ocorrenciasConcluidas.length,
      }
    })
    .sort((a, b) => b.totalOcorrencias - a.totalOcorrencias)

  // Score de problemas dos maquinários (combinação de paradas e ocorrências)
  const scoreProblemasMap = new Map<string, {
    totalParadas: number
    horasParadas: number
    totalOcorrencias: number
    ocorrenciasAbertas: number
    categoria: 'Crítica' | 'Normal'
  }>()

  // Adicionar dados de paradas
  paradas.forEach((parada) => {
    const maquinarioId = parada.maquinario_id
    const maquinario = maquinarios.find((m) => m.id === maquinarioId)
    
    const atual = scoreProblemasMap.get(maquinarioId) || {
      totalParadas: 0,
      horasParadas: 0,
      totalOcorrencias: 0,
      ocorrenciasAbertas: 0,
      categoria: maquinario?.categoria || 'Normal',
    }
    
    scoreProblemasMap.set(maquinarioId, {
      ...atual,
      totalParadas: atual.totalParadas + 1,
      horasParadas: atual.horasParadas + parada.horas_paradas,
      categoria: maquinario?.categoria || 'Normal',
    })
  })

  // Adicionar dados de ocorrências
  ocorrencias.forEach((oc) => {
    const maquinarioId = oc.maquinario_id
    const maquinario = maquinarios.find((m) => m.id === maquinarioId)
    
    const atual = scoreProblemasMap.get(maquinarioId) || {
      totalParadas: 0,
      horasParadas: 0,
      totalOcorrencias: 0,
      ocorrenciasAbertas: 0,
      categoria: maquinario?.categoria || 'Normal',
    }
    
    scoreProblemasMap.set(maquinarioId, {
      ...atual,
      totalOcorrencias: atual.totalOcorrencias + 1,
      ocorrenciasAbertas: atual.ocorrenciasAbertas + (oc.status !== 'concluído' && oc.status !== 'cancelado' ? 1 : 0),
      categoria: maquinario?.categoria || 'Normal',
    })
  })

  // Calcular score: peso maior para horas paradas e ocorrências abertas
  const scoreProblemasMaquinarios = Array.from(scoreProblemasMap.entries())
    .map(([id, dados]) => {
      const maquinario = maquinarios.find((m) => m.id === id)
      
      // Score = (horas paradas * 2) + (total ocorrências * 3) + (ocorrências abertas * 5)
      // Maquinários críticos têm peso adicional
      const pesoCategoria = dados.categoria === 'Crítica' ? 1.5 : 1
      const score = ((dados.horasParadas * 2) + (dados.totalOcorrencias * 3) + (dados.ocorrenciasAbertas * 5)) * pesoCategoria
      
      return {
        maquinario: maquinario?.identificacao || id,
        score: Math.round(score * 10) / 10, // Arredondar para 1 casa decimal
        ...dados,
      }
    })
    .sort((a, b) => b.score - a.score)

  return {
    totalMaquinarios: maquinarios.length,
    maquinariosDisponiveis,
    maquinariosEmManutencao,
    maquinariosDesativados,
    maquinariosInativos,
    maquinariosCriticos,
    totalOcorrencias: ocorrencias.length,
    ocorrenciasAbertas: ocorrenciasAbertas.length,
    ocorrenciasConcluidas: ocorrenciasConcluidas.length,
    ocorrenciasCorretivas: ocorrenciasCorretivas.length,
    ocorrenciasPreventivas: ocorrenciasPreventivas.length,
    totalParadas: paradas.length,
    horasParadasTotal,
    horasDisponiveisTotal,
    taxaDisponibilidade: Math.max(0, Math.min(100, taxaDisponibilidade)),
    tempoMedioResolucao,
    maquinariosComMaisParadas,
    ocorrenciasPorStatus,
    ocorrenciasPorCategoria,
    paradasPorMotivo,
    maquinariosComMaisOcorrencias,
    ocorrenciasPorMes,
    desempenhoFuncionarios,
    scoreProblemasMaquinarios,
  }
}
