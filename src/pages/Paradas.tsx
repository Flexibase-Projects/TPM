import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material'
import { ParadasList } from '../components/paradas/ParadasList'
import { ParadaDetailsDialog } from '../components/paradas/ParadaDetailsDialog'
import { RegistrarParadaDialog } from '../components/maquinarios/RegistrarParadaDialog'
import { ParadasFiltersComponent, type ParadasFilters } from '../components/paradas/ParadasFilters'
import { getAllParadas, deleteParada } from '../services/paradaService'
import { getMaquinarioById } from '../services/maquinarioService'
import type { Parada } from '../types/parada'
import type { Maquinario } from '../types/maquinario'

export const Paradas = () => {
  const [paradas, setParadas] = useState<Parada[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selectedParada, setSelectedParada] = useState<Parada | null>(null)
  const [maquinarioParaEdicao, setMaquinarioParaEdicao] = useState<Maquinario | null>(null)
  const [filters, setFilters] = useState<ParadasFilters>({
    categoria: 'Todos',
    areaId: '',
    searchTerm: '',
    dataFiltro: null,
  })

  const loadParadas = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAllParadas()
      setParadas(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar paradas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadParadas()
  }, [])

  const handleRowClick = (parada: Parada) => {
    setSelectedParada(parada)
    setDetailsOpen(true)
  }

  const handleDetailsClose = () => {
    setDetailsOpen(false)
    setSelectedParada(null)
  }

  const handleEdit = async (parada: Parada) => {
    try {
      // Carregar maquinário completo para ter os motivos de parada
      const maquinario = await getMaquinarioById(parada.maquinario_id)
      setMaquinarioParaEdicao(maquinario)
      setSelectedParada(parada)
      setEditOpen(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados para edição')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta parada?')) return

    try {
      await deleteParada(id)
      await loadParadas()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir parada')
    }
  }

  const handleEditClose = () => {
    setEditOpen(false)
    setSelectedParada(null)
    setMaquinarioParaEdicao(null)
  }

  const handleEditSuccess = async () => {
    await loadParadas()
    handleEditClose()
  }

  // Filtrar paradas baseado nos filtros selecionados
  const filteredParadas = useMemo(() => {
    return paradas.filter((parada) => {
      // Filtro por categoria
      if (filters.categoria !== 'Todos' && parada.maquinario?.categoria !== filters.categoria) {
        return false
      }

      // Filtro por área
      if (filters.areaId && parada.maquinario?.area?.id !== filters.areaId) {
        return false
      }

      // Filtro por termo de busca (busca em identificação da máquina e motivo)
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase().trim()
        const maquinaMatch = parada.maquinario?.identificacao?.toLowerCase().includes(searchLower) || false
        const motivoMatch = parada.motivo_parada?.descricao?.toLowerCase().includes(searchLower) || false
        
        if (!maquinaMatch && !motivoMatch) {
          return false
        }
      }

      // Filtro por data
      if (filters.dataFiltro) {
        const dataFiltroFormatada = filters.dataFiltro.format('YYYY-MM-DD')
        if (parada.data_parada !== dataFiltroFormatada) {
          return false
        }
      }

      return true
    })
  }, [paradas, filters])

  return (
    <Box sx={{ position: 'relative', minHeight: '100%' }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 600, fontSize: '1.125rem', mb: 0.5 }}>
          Paradas
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
          Registro de Paradas de Maquinários
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {!loading && (
        <ParadasFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
        />
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <ParadasList
            paradas={filteredParadas}
            onRowClick={handleRowClick}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Paper>
      )}

      <ParadaDetailsDialog
        open={detailsOpen}
        onClose={handleDetailsClose}
        parada={selectedParada}
      />

      <RegistrarParadaDialog
        open={editOpen}
        onClose={handleEditClose}
        maquinario={maquinarioParaEdicao}
        parada={selectedParada}
        onSuccess={handleEditSuccess}
      />
    </Box>
  )
}
