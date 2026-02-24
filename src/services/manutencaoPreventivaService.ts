import { supabase } from './supabase'
import { getMaquinarios } from './maquinarioService'
import { DIAS_AVISO_VENCIMENTO } from '../utils/constants'
import type { Maquinario } from '../types/maquinario'

export interface ItemProximoVencimento {
  maquinario_id: string
  maquinario: Pick<Maquinario, 'id' | 'identificacao' | 'nome_operador'>
  tipo: 'Limpeza' | 'Manutenção'
  data_prevista: string
  label: string
}

/**
 * Retorna manutenções e limpezas próximas do vencimento (dentro da janela de aviso).
 * Considera DIAS_AVISO_VENCIMENTO dias antes da data prevista até a data prevista.
 */
export const getProximasManutencoesLimpezas = async (): Promise<ItemProximoVencimento[]> => {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const hojeTime = hoje.getTime()
  const fimJanela = new Date(hoje)
  fimJanela.setDate(fimJanela.getDate() + DIAS_AVISO_VENCIMENTO)
  fimJanela.setHours(23, 59, 59, 999)
  const fimJanelaTime = fimJanela.getTime()

  const maquinarios = await getMaquinarios()

  // Última OM preventiva concluída por maquinário (data_fechamento)
  const { data: ocorrenciasPreventivas } = await supabase
    .from('TPM_ocorrencias_manutencao')
    .select('maquinario_id, data_fechamento')
    .eq('tipo_om', 'Preventiva')
    .eq('status', 'concluído')
    .not('data_fechamento', 'is', null)
    .order('data_fechamento', { ascending: false })

  const ultimaPreventivaPorMaq = new Map<string, string>()
  for (const row of ocorrenciasPreventivas || []) {
    if (row.maquinario_id && row.data_fechamento && !ultimaPreventivaPorMaq.has(row.maquinario_id)) {
      ultimaPreventivaPorMaq.set(row.maquinario_id, row.data_fechamento)
    }
  }

  const resultado: ItemProximoVencimento[] = []

  for (const maq of maquinarios) {
    const checklistLimpeza = (maq.checklist_itens || []).some((i) => i.tipo === 'Limpeza')
    const checklistManutencao = (maq.checklist_itens || []).some((i) => i.tipo === 'Manutenção')
    const periodoDias = maq.manutencao_periodo_dias ?? 30
    const proximaLimpeza = maq.proxima_limpeza_em || null

    // Manutenção (30/60/90/120 dias)
    if (checklistManutencao) {
      const ultimaFechamento = ultimaPreventivaPorMaq.get(maq.id)
      const refDate = ultimaFechamento
        ? new Date(ultimaFechamento)
        : new Date(maq.created_at)
      refDate.setHours(0, 0, 0, 0)
      const dataPrevista = new Date(refDate)
      dataPrevista.setDate(dataPrevista.getDate() + periodoDias)
      const dataPrevistaTime = dataPrevista.getTime()
      const dataPrevistaStr = dataPrevista.toISOString().slice(0, 10)

      if (dataPrevistaTime >= hojeTime && dataPrevistaTime <= fimJanelaTime) {
        resultado.push({
          maquinario_id: maq.id,
          maquinario: { id: maq.id, identificacao: maq.identificacao, nome_operador: maq.nome_operador },
          tipo: 'Manutenção',
          data_prevista: dataPrevistaStr,
          label: `Manutenção ${periodoDias} dias`,
        })
      }
    }

    // Limpeza semanal
    if (checklistLimpeza && proximaLimpeza) {
      const dataPrevista = new Date(proximaLimpeza + 'T00:00:00')
      const dataPrevistaTime = dataPrevista.getTime()

      if (dataPrevistaTime >= hojeTime && dataPrevistaTime <= fimJanelaTime) {
        resultado.push({
          maquinario_id: maq.id,
          maquinario: { id: maq.id, identificacao: maq.identificacao, nome_operador: maq.nome_operador },
          tipo: 'Limpeza',
          data_prevista: proximaLimpeza,
          label: 'Limpeza semanal',
        })
      }
    }
  }

  resultado.sort((a, b) => a.data_prevista.localeCompare(b.data_prevista))
  return resultado
}
