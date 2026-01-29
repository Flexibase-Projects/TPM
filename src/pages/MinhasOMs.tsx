import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material'
import { OcorrenciasList } from '../components/ocorrencias/OcorrenciasList'
import { OcorrenciaManageDialog } from '../components/ocorrencias/OcorrenciaManageDialog'
import { OcorrenciasFiltersComponent, type OcorrenciasFilters } from '../components/ocorrencias/OcorrenciasFilters'
import { getOcorrencias, deleteOcorrencia, calcularTempos } from '../services/ocorrenciaService'
import type { OcorrenciaManutencao } from '../types/ocorrencia'

// TODO: Substituir por sistema de autenticação real
const getCurrentUser = (): string => {
  // Por enquanto, retorna um usuário fixo ou do localStorage
  // No futuro, isso virá do sistema de autenticação
  return localStorage.getItem('currentUser') || 'Usuario Teste'
}

export const MinhasOMs = () => {
  const [ocorrencias, setOcorrencias] = useState<OcorrenciaManutencao[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [manageOpen, setManageOpen] = useState(false)
  const [selectedOcorrencia, setSelectedOcorrencia] = useState<OcorrenciaManutencao | null>(null)
  const [filters, setFilters] = useState<OcorrenciasFilters>({
    status: 'Todos',
    categoria: 'Todas',
    tipoOM: 'Todos',
    areaId: '',
    searchTerm: '',
  })
  const currentUser = getCurrentUser()

  const loadOcorrencias = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getOcorrencias()
      
      // Filtrar apenas as OM's do usuário atual (responsável ou criador)
      const minhasOMs = data.filter((ocorrencia) => {
        // Verifica se o usuário é o responsável ou se criou a OM
        // Por enquanto, comparamos com o campo responsavel
        // No futuro, pode ter um campo criador_id
        return ocorrencia.responsavel === currentUser
      })
      
      // Calcular tempos para cada ocorrência
      const ocorrenciasComTempos = await Promise.all(
        minhasOMs.map(async (ocorrencia) => {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar minhas OM\'s')
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
      if (filters.status !== 'Todos' && ocorrencia.status !== filters.status.toLowerCase()) {
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
      if (filters.areaId && ocorrencia.maquinario) {
        // Aqui precisaríamos ter a área no maquinario, mas por enquanto vamos pular
        // return ocorrencia.maquinario.area_id === filters.areaId
      }

      // Filtro por termo de busca
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase()
        const matchMaquina = ocorrencia.maquinario?.identificacao.toLowerCase().includes(searchLower) ||
                            ocorrencia.maquinario?.nome_operador.toLowerCase().includes(searchLower)
        const matchDescricao = ocorrencia.descricao.toLowerCase().includes(searchLower)
        const matchResponsavel = ocorrencia.responsavel?.toLowerCase().includes(searchLower)
        
        if (!matchMaquina && !matchDescricao && !matchResponsavel) {
          return false
        }
      }

      return true
    })
  }, [ocorrencias, filters])

  const handleRowClick = (ocorrencia: OcorrenciaManutencao) => {
    setSelectedOcorrencia(ocorrencia)
    setManageOpen(true)
  }

  const handleManageClose = () => {
    setManageOpen(false)
    setSelectedOcorrencia(null)
  }

  const handleManageUpdate = () => {
    loadOcorrencias()
    if (selectedOcorrencia) {
      // Atualizar a ocorrência selecionada também
      getOcorrencias().then((data) => {
        const updated = data.find((o) => o.id === selectedOcorrencia.id)
        if (updated) {
          calcularTempos(updated.id).then((tempos) => {
            setSelectedOcorrencia({
              ...updated,
              tempo_em_fila: tempos.tempo_em_fila,
              tempo_em_execucao: tempos.tempo_em_execucao,
              tempo_total: tempos.tempo_total,
            })
          })
        }
      })
    }
  }

  const handleEdit = (ocorrencia: OcorrenciaManutencao) => {
    // Por enquanto, apenas abre o diálogo de gerenciamento
    setSelectedOcorrencia(ocorrencia)
    setManageOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta ordem de manutenção?')) {
      try {
        await deleteOcorrencia(id)
        await loadOcorrencias()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao excluir OM')
      }
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1, fontSize: '1.5rem', fontWeight: 600 }}>
        Minhas OM's
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary', fontSize: '0.875rem' }}>
        Visualize e gerencie as ordens de manutenção que você abriu ou está responsável por atender
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <OcorrenciasFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
        />
      </Paper>

      <Paper sx={{ p: 2 }}>
        <OcorrenciasList
          ocorrencias={filteredOcorrencias}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRowClick={handleRowClick}
        />
      </Paper>

      {selectedOcorrencia && (
        <OcorrenciaManageDialog
          open={manageOpen}
          onClose={handleManageClose}
          ocorrencia={selectedOcorrencia}
          onUpdate={handleManageUpdate}
        />
      )}
    </Box>
  )
}
