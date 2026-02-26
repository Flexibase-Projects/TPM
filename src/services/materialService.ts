import { supabase } from './supabase'
import type { ItemMaterialComOcorrencia, ItemMaterialOcorrencia, ItemMaterialOcorrenciaFormItem, ItemMaterialRelatorio, MaterialMaquinario, MaterialMaquinarioFormItem } from '../types/material'

/**
 * Lista todos os itens de material com contexto de ocorrência/maquinário/área para relatórios de custo.
 * Usado no Dashboard (custos por máquina, setor, top peças).
 */
export const getAllItensMaterialParaRelatorio = async (): Promise<ItemMaterialRelatorio[]> => {
  const { data: itens, error } = await supabase
    .from('TPM_itens_material_ocorrencia')
    .select(`
      id,
      ocorrencia_id,
      descricao,
      marca,
      valor_unitario,
      quantidade,
      ocorrencia:TPM_ocorrencias_manutencao(
        maquinario_id,
        data_ocorrencia,
        maquinario:TPM_maquinarios(
          identificacao,
          area_id,
          area:TPM_areas(nome)
        )
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error

  const rows = (itens || []) as any[]
  return rows.map((row) => {
    const ocorrencia = Array.isArray(row.ocorrencia) ? row.ocorrencia[0] : row.ocorrencia
    const maquinario = ocorrencia?.maquinario ?? ocorrencia?.TPM_maquinarios
    const areaRaw = maquinario?.area ?? maquinario?.TPM_areas
    const area = Array.isArray(areaRaw) ? areaRaw[0] : areaRaw
    const valorUnitario = Number(row.valor_unitario) ?? 0
    const quantidade = Number(row.quantidade) ?? 0
    return {
      id: row.id,
      ocorrencia_id: row.ocorrencia_id,
      descricao: row.descricao,
      marca: row.marca ?? null,
      valor_unitario: valorUnitario,
      quantidade,
      valor_total: valorUnitario * quantidade,
      maquinario_id: ocorrencia?.maquinario_id ?? '',
      maquinario_identificacao: maquinario?.identificacao ?? 'N/I',
      area_id: maquinario?.area_id ?? null,
      area_nome: area?.nome ?? null,
      data_ocorrencia: ocorrencia?.data_ocorrencia ?? null,
    } as ItemMaterialRelatorio
  })
}

/**
 * Lista itens de material/peças da OM atual.
 * Usado na seção "Custos e materiais" do diálogo Visualizar OM.
 */
export const getItensMaterialByOcorrencia = async (
  ocorrenciaId: string
): Promise<ItemMaterialOcorrencia[]> => {
  const { data, error } = await supabase
    .from('TPM_itens_material_ocorrencia')
    .select('*')
    .eq('ocorrencia_id', ocorrenciaId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data || []) as ItemMaterialOcorrencia[]
}

/**
 * Substitui a lista de itens de material da OM (delete all + insert).
 * Usado ao editar Custos e materiais no diálogo Visualizar OM.
 */
export const saveItensMaterialOcorrencia = async (
  ocorrenciaId: string,
  itens: ItemMaterialOcorrenciaFormItem[]
): Promise<void> => {
  const { error: deleteError } = await supabase
    .from('TPM_itens_material_ocorrencia')
    .delete()
    .eq('ocorrencia_id', ocorrenciaId)

  if (deleteError) throw deleteError

  if (itens.length === 0) return

  const rows = itens.map((item) => ({
    ocorrencia_id: ocorrenciaId,
    descricao: String(item.descricao ?? '').trim(),
    marca: item.marca && String(item.marca).trim() ? String(item.marca).trim() : null,
    valor_unitario: Number(item.valor_unitario) ?? 0,
    quantidade: Number(item.quantidade) > 0 ? Number(item.quantidade) : 1,
    unidade: item.unidade && String(item.unidade).trim() ? String(item.unidade).trim() : null,
    observacao: item.observacao && String(item.observacao).trim() ? String(item.observacao).trim() : null,
  }))

  const { error } = await supabase.from('TPM_itens_material_ocorrencia').insert(rows)
  if (error) throw error
}

/**
 * Lista itens de material/peças utilizados em todas as OMs do maquinário.
 * Usado na seção "Custos e materiais" dos Detalhes do Maquinário.
 */
export const getItensMaterialByMaquinario = async (
  maquinarioId: string
): Promise<ItemMaterialComOcorrencia[]> => {
  const { data: ocorrencias, error: errOcorrencias } = await supabase
    .from('TPM_ocorrencias_manutencao')
    .select('id')
    .eq('maquinario_id', maquinarioId)

  if (errOcorrencias) throw errOcorrencias

  const ocorrenciaIds = (ocorrencias || []).map((o) => o.id)
  if (ocorrenciaIds.length === 0) return []

  const { data: itens, error: errItens } = await supabase
    .from('TPM_itens_material_ocorrencia')
    .select(`
      *,
      ocorrencia:TPM_ocorrencias_manutencao(data_ocorrencia)
    `)
    .in('ocorrencia_id', ocorrenciaIds)
    .order('created_at', { ascending: false })

  if (errItens) throw errItens

  return (itens || []).map((row: any) => {
    const ocorrencia = Array.isArray(row.ocorrencia) ? row.ocorrencia[0] : row.ocorrencia
    const { ocorrencia: _, ...item } = row
    return {
      ...item,
      data_ocorrencia: ocorrencia?.data_ocorrencia,
    } as ItemMaterialComOcorrencia
  })
}

/**
 * Lista materiais/peças de referência cadastrados para o maquinário.
 * Usado no Editar Maquinário e na seção "Custos e materiais" dos Detalhes do Maquinário.
 */
export const getMateriaisByMaquinario = async (
  maquinarioId: string
): Promise<MaterialMaquinario[]> => {
  const { data, error } = await supabase
    .from('TPM_materiais_maquinario')
    .select('*')
    .eq('maquinario_id', maquinarioId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data || []) as MaterialMaquinario[]
}

/**
 * Substitui a lista de materiais do maquinário (delete all + insert).
 * Chamar após createMaquinario/updateMaquinario.
 */
export const saveMateriaisMaquinario = async (
  maquinarioId: string,
  itens: MaterialMaquinarioFormItem[]
): Promise<void> => {
  const { error: deleteError } = await supabase
    .from('TPM_materiais_maquinario')
    .delete()
    .eq('maquinario_id', maquinarioId)

  if (deleteError) throw deleteError

  if (itens.length === 0) return

  const rows = itens.map((item) => ({
    maquinario_id: maquinarioId,
    descricao: String(item.descricao ?? '').trim(),
    marca: item.marca && String(item.marca).trim() ? String(item.marca).trim() : null,
    valor_unitario: Number(item.valor_unitario) ?? 0,
    quantidade: Number(item.quantidade) > 0 ? Number(item.quantidade) : 1,
    unidade: item.unidade && String(item.unidade).trim() ? String(item.unidade).trim() : null,
    observacao: item.observacao && String(item.observacao).trim() ? String(item.observacao).trim() : null,
    data_compra: item.data_compra && String(item.data_compra).trim() ? String(item.data_compra).trim() : null,
  }))

  const { error } = await supabase.from('TPM_materiais_maquinario').insert(rows)
  if (error) throw error
}
