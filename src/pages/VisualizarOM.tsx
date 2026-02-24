import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material'
import { OcorrenciasList } from '../components/ocorrencias/OcorrenciasList'
import { OcorrenciaFormDialog } from '../components/ocorrencias/OcorrenciaFormDialog'
import { OcorrenciaManageDialog } from '../components/ocorrencias/OcorrenciaManageDialog'
import { OcorrenciasFiltersComponent, type OcorrenciasFilters } from '../components/ocorrencias/OcorrenciasFilters'
import { getOcorrencias, deleteOcorrencia, calcularTempos } from '../services/ocorrenciaService'
import type { OcorrenciaManutencao } from '../types/ocorrencia'

export const VisualizarOM = () => {
  const [ocorrencias, setOcorrencias] = useState<OcorrenciaManutencao[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [manageOpen, setManageOpen] = useState(false)
  const [editingOcorrencia, setEditingOcorrencia] = useState<OcorrenciaManutencao | null>(null)
  const [selectedOcorrencia, setSelectedOcorrencia] = useState<OcorrenciaManutencao | null>(null)
  const [filters, setFilters] = useState<OcorrenciasFilters>({
    status: 'Todos',
    categoria: 'Todas',
    tipoOM: 'Todos',
    areaId: '',
    searchTerm: '',
  })

  const loadOcorrencias = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getOcorrencias()
      // Calcular tempos para cada ocorrência
      const ocorrenciasComTempos = await Promise.all(
        data.map(async (ocorrencia) => {
          try {
            const tempos = await calcularTempos(ocorrencia.id)
            return {
              ...ocorrencia,
              tempo_em_fila: tempos.tempo_em_fila,
              tempo_em_execucao: tempos.tempo_em_execucao,
              tempo_total: tempos.tempo_total,
            }
          } catch (err) {
            console.error(`Erro ao calcular tempos para OM ${ocorrencia.id}:`, err)
            return ocorrencia
          }
        })
      )
      setOcorrencias(ocorrenciasComTempos)
    } catch (err: unknown) {
      console.error('Erro ao carregar ocorrências:', err)
      const raw =
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message ??
            (err as { error_description?: string })?.error_description ??
            'Erro ao carregar ordens de manutenção'
      const isNetworkError =
        raw.includes('Failed to fetch') || raw.includes('NetworkError')
      const message = isNetworkError
        ? 'Sem conexão com o servidor. Verifique a internet, o VITE_SUPABASE_URL no .env e se o projeto Supabase está ativo.'
        : raw
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOcorrencias()
  }, [])

  const filteredOcorrencias = useMemo(() => {
    return ocorrencias.filter((ocorrencia) => {
      // Filtro por status
      if (filters.status !== 'Todos' && ocorrencia.status !== filters.status) {
        return false
      }

      // Filtro por categoria
      if (filters.categoria !== 'Todas' && ocorrencia.categoria !== filters.categoria) {
        return false
      }

      // Filtro por tipo OM
      if (filters.tipoOM !== 'Todos') {
        const tipoOM = ocorrencia.tipo_om || 'Corretiva'
        if (tipoOM !== filters.tipoOM) {
          return false
        }
      }

      // Filtro por área
      if (filters.areaId) {
        // Precisamos buscar a área do maquinário
        // Por enquanto, vamos assumir que o maquinário tem uma área
        // Isso pode precisar ser ajustado dependendo da estrutura de dados
      }

      // Filtro por busca
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase()
        const matchesMaquina = ocorrencia.maquinario?.identificacao?.toLowerCase().includes(searchLower)
        const matchesOperador = ocorrencia.maquinario?.nome_operador?.toLowerCase().includes(searchLower)
        const matchesDescricao = ocorrencia.descricao?.toLowerCase().includes(searchLower)
        const matchesResponsavel = ocorrencia.responsavel?.toLowerCase().includes(searchLower)

        if (!matchesMaquina && !matchesOperador && !matchesDescricao && !matchesResponsavel) {
          return false
        }
      }

      return true
    })
  }, [ocorrencias, filters])

  const handleEdit = (ocorrencia: OcorrenciaManutencao) => {
    setEditingOcorrencia(ocorrencia)
    setFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta ordem de manutenção?')) {
      return
    }

    try {
      await deleteOcorrencia(id)
      await loadOcorrencias()
    } catch (err) {
      console.error('Erro ao excluir ocorrência:', err)
      setError('Erro ao excluir ordem de manutenção')
    }
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setEditingOcorrencia(null)
  }

  const handleFormSubmit = async () => {
    handleFormClose()
    await loadOcorrencias()
  }

  const handleRowClick = (ocorrencia: OcorrenciaManutencao) => {
    // #region agent log
    fetch('http://127.0.0.1:7247/ingest/d688d544-a3d8-45d0-aec4-1bbd8aaad8c9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'VisualizarOM.tsx:140',message:'handleRowClick called',data:{ocorrenciaId:ocorrencia.id,ocorrenciaStatus:ocorrencia.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
    // #endregion
    try {
      setSelectedOcorrencia(ocorrencia)
      setManageOpen(true)
      // #region agent log
      fetch('http://127.0.0.1:7247/ingest/d688d544-a3d8-45d0-aec4-1bbd8aaad8c9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'VisualizarOM.tsx:145',message:'State updated successfully',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
      // #endregion
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7247/ingest/d688d544-a3d8-45d0-aec4-1bbd8aaad8c9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'VisualizarOM.tsx:148',message:'Error in handleRowClick',data:{error:error instanceof Error?error.message:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
      // #endregion
      console.error('Erro ao abrir diálogo:', error)
    }
  }

  const handleManageClose = () => {
    setManageOpen(false)
    setSelectedOcorrencia(null)
  }

  const handleManageUpdate = async () => {
    await loadOcorrencias()
    // Atualizar a ocorrência selecionada se ainda estiver aberta
    if (selectedOcorrencia) {
      const ocorrenciasAtualizadas = await getOcorrencias()
      const ocorrenciaAtualizada = ocorrenciasAtualizadas.find(o => o.id === selectedOcorrencia.id)
      if (ocorrenciaAtualizada) {
        setSelectedOcorrencia(ocorrenciaAtualizada)
      }
    }
  }

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 600, fontSize: '1.125rem', mb: 0.5 }}>
          Visualizar OM
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
          Listagem de todas as Ordens de Manutenção cadastradas
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <OcorrenciasFiltersComponent filters={filters} onFiltersChange={setFilters} />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <OcorrenciasList
            ocorrencias={filteredOcorrencias}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRowClick={handleRowClick}
          />
        </Paper>
      )}

      <OcorrenciaFormDialog
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        ocorrencia={editingOcorrencia}
      />

      <OcorrenciaManageDialog
        open={manageOpen}
        onClose={handleManageClose}
        ocorrencia={selectedOcorrencia}
        onUpdate={handleManageUpdate}
      />
    </Box>
  )
}
