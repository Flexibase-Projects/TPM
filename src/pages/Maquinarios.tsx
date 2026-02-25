import { useState, useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Fab,
  Tooltip,
  TablePagination,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { MaquinariosList } from '../components/maquinarios/MaquinariosList'
import { MaquinarioFormDialog } from '../components/maquinarios/MaquinarioFormDialog'
import { MaquinarioDetailsDialog } from '../components/maquinarios/MaquinarioDetailsDialog'
import { RegistrarParadaDialog } from '../components/maquinarios/RegistrarParadaDialog'
import { MaquinariosFiltersComponent, type MaquinariosFilters } from '../components/maquinarios/MaquinariosFilters'
import { getMaquinarios, deleteMaquinario, getMaquinarioById, getOcorrenciasAbertasByMaquinario } from '../services/maquinarioService'
import { calcularStatusMaquinario } from '../utils/statusMaquinario'
import { ROWS_PER_PAGE } from '../utils/constants'
import type { Maquinario } from '../types/maquinario'

export const Maquinarios = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const maquinarioIdFromUrl = searchParams.get('maquinarioId')
  const openedFromUrlRef = useRef<string | null>(null)

  const [maquinarios, setMaquinarios] = useState<Maquinario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [registrarParadaOpen, setRegistrarParadaOpen] = useState(false)
  const [editingMaquinario, setEditingMaquinario] = useState<Maquinario | null>(null)
  const [selectedMaquinario, setSelectedMaquinario] = useState<Maquinario | null>(null)
  const [maquinarioParaParada, setMaquinarioParaParada] = useState<Maquinario | null>(null)
  const [filters, setFilters] = useState<MaquinariosFilters>({
    categoria: 'Todos',
    areaId: '',
    searchTerm: '',
  })
  const [page, setPage] = useState(0)

  const loadMaquinarios = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getMaquinarios()

      if (data.length === 0) {
        console.warn(
          '[Maquinários] getMaquinarios retornou 0 itens. Verifique RLS no Supabase (execute 012_enable_rls_maquinarios_read.sql) e se VITE_SUPABASE_URL aponta para o projeto correto.'
        )
        setError(
          'Nenhum maquinário retornado pelo banco. Se você tem dados no Supabase: 1) Execute supabase/migrations/012_enable_rls_maquinarios_read.sql no SQL Editor do projeto; 2) Confirme que VITE_SUPABASE_URL no .env aponta para o mesmo projeto.'
        )
      }

      // Buscar OMs abertas e calcular status por maquinário; falhas em um item não impedem a lista
      const results = await Promise.allSettled(
        data.map(async (maquinario) => {
          const ocorrenciasAbertas = await getOcorrenciasAbertasByMaquinario(maquinario.id)
          const statusCalculado = calcularStatusMaquinario(maquinario, ocorrenciasAbertas)
          return { ...maquinario, status_calculado: statusCalculado }
        })
      )

      const maquinariosComStatus = results.map((result, index) => {
        if (result.status === 'fulfilled') return result.value
        const maquinario = data[index]
        const statusCalculado = calcularStatusMaquinario(maquinario, [])
        return { ...maquinario, status_calculado: statusCalculado }
      })

      setMaquinarios(maquinariosComStatus)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar maquinários'
      setError(
        msg === 'Failed to fetch'
          ? 'Não foi possível conectar ao Supabase. Verifique se o servidor está rodando e se VITE_SUPABASE_URL no .env está correto e acessível.'
          : msg
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMaquinarios()
  }, [])

  // Abrir detalhe do maquinário quando vier da URL (ex.: notificação em Visualizar OM)
  useEffect(() => {
    if (!maquinarioIdFromUrl || loading) return
    if (openedFromUrlRef.current === maquinarioIdFromUrl) return

    const openDetailsFromUrl = async () => {
      try {
        const fullData = await getMaquinarioById(maquinarioIdFromUrl)
        setSelectedMaquinario(fullData)
        setDetailsOpen(true)
        openedFromUrlRef.current = maquinarioIdFromUrl
      } catch {
        openedFromUrlRef.current = maquinarioIdFromUrl
        const next = new URLSearchParams(searchParams)
        next.delete('maquinarioId')
        setSearchParams(next)
      }
    }
    openDetailsFromUrl()
  }, [maquinarioIdFromUrl, loading, searchParams, setSearchParams])

  useEffect(() => {
    if (!maquinarioIdFromUrl) openedFromUrlRef.current = null
  }, [maquinarioIdFromUrl])

  const handleCreate = () => {
    setEditingMaquinario(null)
    setFormOpen(true)
  }

  const handleEdit = async (maquinario: Maquinario) => {
    setFormOpen(true)
    try {
      const fullData = await getMaquinarioById(maquinario.id)
      setEditingMaquinario(fullData)
    } catch (err) {
      setEditingMaquinario(maquinario)
      const msg = err instanceof Error ? err.message : ''
      if (msg === 'Failed to fetch') {
        setError('Sem conexão com o Supabase. Verifique VITE_SUPABASE_URL e se o servidor está acessível.')
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este maquinário?')) return

    try {
      await deleteMaquinario(id)
      await loadMaquinarios()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao excluir maquinário'
      setError(msg === 'Failed to fetch' ? 'Sem conexão com o Supabase. Verifique VITE_SUPABASE_URL e se o servidor está acessível.' : msg)
    }
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setEditingMaquinario(null)
  }

  const handleFormSubmit = async () => {
    await loadMaquinarios()
    handleFormClose()
  }

  const handleRowClick = async (maquinario: Maquinario) => {
    try {
      const fullData = await getMaquinarioById(maquinario.id)
      setSelectedMaquinario(fullData)
      setDetailsOpen(true)
    } catch {
      setSelectedMaquinario(maquinario)
      setDetailsOpen(true)
    }
  }

  const handleDetailsClose = () => {
    setDetailsOpen(false)
    setSelectedMaquinario(null)
    if (maquinarioIdFromUrl) {
      const next = new URLSearchParams(searchParams)
      next.delete('maquinarioId')
      setSearchParams(next, { replace: true })
      openedFromUrlRef.current = null
    }
  }

  const handleRegistrarParada = (maquinario: Maquinario) => {
    setMaquinarioParaParada(maquinario)
    setRegistrarParadaOpen(true)
  }

  const handleRegistrarParadaClose = () => {
    setRegistrarParadaOpen(false)
    setMaquinarioParaParada(null)
  }

  const handleParadaRegistrada = async () => {
    // Recarregar detalhes do maquinário se o dialog de detalhes estiver aberto
    if (selectedMaquinario) {
      const fullData = await getMaquinarioById(selectedMaquinario.id)
      setSelectedMaquinario(fullData)
    }
  }

  // Filtrar maquinários baseado nos filtros selecionados
  const filteredMaquinarios = useMemo(() => {
    return maquinarios.filter((maquinario) => {
      // Filtro por categoria
      if (filters.categoria !== 'Todos' && maquinario.categoria !== filters.categoria) {
        return false
      }

      // Filtro por área
      if (filters.areaId && maquinario.area_id !== filters.areaId) {
        return false
      }

      // Filtro por termo de busca (busca em identificação e nome do operador)
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase().trim()
        const identificacaoMatch = maquinario.identificacao.toLowerCase().includes(searchLower)
        const operadorMatch = maquinario.nome_operador.toLowerCase().includes(searchLower)
        
        if (!identificacaoMatch && !operadorMatch) {
          return false
        }
      }

      return true
    })
  }, [maquinarios, filters])

  const paginatedMaquinarios = useMemo(() => {
    const start = page * ROWS_PER_PAGE
    return filteredMaquinarios.slice(start, start + ROWS_PER_PAGE)
  }, [filteredMaquinarios, page])

  useEffect(() => {
    setPage(0)
  }, [filters])

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(filteredMaquinarios.length / ROWS_PER_PAGE) - 1)
    if (filteredMaquinarios.length > 0 && page > maxPage) setPage(maxPage)
  }, [filteredMaquinarios.length, page])

  return (
    <Box sx={{ position: 'relative', minHeight: '100%', pb: 10 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 600, fontSize: '1.125rem', mb: 0.5 }}>
          Maquinários
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
          Cadastro de Maquinários da Indústria
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {!loading && (
        <MaquinariosFiltersComponent
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
          <MaquinariosList
            maquinarios={paginatedMaquinarios}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRowClick={handleRowClick}
          />
          <TablePagination
            component="div"
            count={filteredMaquinarios.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={ROWS_PER_PAGE}
            rowsPerPageOptions={[ROWS_PER_PAGE]}
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            labelRowsPerPage="Itens por página:"
            sx={{ borderTop: '1px solid', borderColor: 'divider' }}
          />
        </Paper>
      )}

      <MaquinarioDetailsDialog
        open={detailsOpen}
        onClose={handleDetailsClose}
        maquinario={selectedMaquinario}
        onRegistrarParada={handleRegistrarParada}
      />

      <RegistrarParadaDialog
        open={registrarParadaOpen}
        onClose={handleRegistrarParadaClose}
        maquinario={maquinarioParaParada}
        onSuccess={handleParadaRegistrada}
      />

      <Tooltip title="Novo Maquinário" placement="left" arrow>
        <Fab
          color="primary"
          aria-label="adicionar maquinário"
          onClick={handleCreate}
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1000,
            width: 48,
            height: 48,
          }}
        >
          <AddIcon />
        </Fab>
      </Tooltip>

      <MaquinarioFormDialog
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        maquinario={editingMaquinario}
      />
    </Box>
  )
}
