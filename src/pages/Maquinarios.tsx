import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Fab,
  Tooltip,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { MaquinariosList } from '../components/maquinarios/MaquinariosList'
import { MaquinarioFormDialog } from '../components/maquinarios/MaquinarioFormDialog'
import { MaquinarioDetailsDialog } from '../components/maquinarios/MaquinarioDetailsDialog'
import { RegistrarParadaDialog } from '../components/maquinarios/RegistrarParadaDialog'
import { MaquinariosFiltersComponent, type MaquinariosFilters } from '../components/maquinarios/MaquinariosFilters'
import { getMaquinarios, deleteMaquinario, getMaquinarioById, getOcorrenciasAbertasByMaquinario } from '../services/maquinarioService'
import { calcularStatusMaquinario } from '../utils/statusMaquinario'
import type { Maquinario } from '../types/maquinario'

export const Maquinarios = () => {
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

  const loadMaquinarios = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7247/ingest/d688d544-a3d8-45d0-aec4-1bbd8aaad8c9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Maquinarios.tsx:37',message:'loadMaquinarios called',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    try {
      setLoading(true)
      setError(null)
      // #region agent log
      fetch('http://127.0.0.1:7247/ingest/d688d544-a3d8-45d0-aec4-1bbd8aaad8c9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Maquinarios.tsx:42',message:'calling getMaquinarios',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      const data = await getMaquinarios()
      // #region agent log
      fetch('http://127.0.0.1:7247/ingest/d688d544-a3d8-45d0-aec4-1bbd8aaad8c9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Maquinarios.tsx:45',message:'getMaquinarios result',data:{dataLength:data?.length||0,hasData:!!data},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      
      // Buscar OMs abertas e calcular status para cada maquinário
      // #region agent log
      fetch('http://127.0.0.1:7247/ingest/d688d544-a3d8-45d0-aec4-1bbd8aaad8c9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Maquinarios.tsx:48',message:'starting Promise.all for status calculation',data:{maquinariosCount:data?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      const maquinariosComStatus = await Promise.all(
        data.map(async (maquinario, index) => {
          // #region agent log
          fetch('http://127.0.0.1:7247/ingest/d688d544-a3d8-45d0-aec4-1bbd8aaad8c9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Maquinarios.tsx:51',message:'processing maquinario',data:{index,maquinarioId:maquinario.id,identificacao:maquinario.identificacao},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          try {
            // #region agent log
            fetch('http://127.0.0.1:7247/ingest/d688d544-a3d8-45d0-aec4-1bbd8aaad8c9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Maquinarios.tsx:54',message:'calling getOcorrenciasAbertasByMaquinario',data:{maquinarioId:maquinario.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            const ocorrenciasAbertas = await getOcorrenciasAbertasByMaquinario(maquinario.id)
            // #region agent log
            fetch('http://127.0.0.1:7247/ingest/d688d544-a3d8-45d0-aec4-1bbd8aaad8c9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Maquinarios.tsx:57',message:'ocorrenciasAbertas result',data:{ocorrenciasCount:ocorrenciasAbertas?.length||0,maquinarioId:maquinario.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            // #region agent log
            fetch('http://127.0.0.1:7247/ingest/d688d544-a3d8-45d0-aec4-1bbd8aaad8c9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Maquinarios.tsx:59',message:'calling calcularStatusMaquinario',data:{maquinarioId:maquinario.id,statusManual:maquinario.status_maquinario},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
            const statusCalculado = calcularStatusMaquinario(maquinario, ocorrenciasAbertas)
            // #region agent log
            fetch('http://127.0.0.1:7247/ingest/d688d544-a3d8-45d0-aec4-1bbd8aaad8c9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Maquinarios.tsx:61',message:'statusCalculado result',data:{statusCalculado,maquinarioId:maquinario.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
            return {
              ...maquinario,
              status_calculado: statusCalculado,
            }
          } catch (err) {
            // #region agent log
            fetch('http://127.0.0.1:7247/ingest/d688d544-a3d8-45d0-aec4-1bbd8aaad8c9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Maquinarios.tsx:68',message:'error processing maquinario',data:{maquinarioId:maquinario.id,error:err instanceof Error?err.message:String(err)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            throw err
          }
        })
      )
      // #region agent log
      fetch('http://127.0.0.1:7247/ingest/d688d544-a3d8-45d0-aec4-1bbd8aaad8c9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Maquinarios.tsx:73',message:'Promise.all completed',data:{maquinariosComStatusCount:maquinariosComStatus?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      
      setMaquinarios(maquinariosComStatus)
      // #region agent log
      fetch('http://127.0.0.1:7247/ingest/d688d544-a3d8-45d0-aec4-1bbd8aaad8c9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Maquinarios.tsx:76',message:'setMaquinarios called',data:{count:maquinariosComStatus?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
    } catch (err) {
      // #region agent log
      fetch('http://127.0.0.1:7247/ingest/d688d544-a3d8-45d0-aec4-1bbd8aaad8c9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Maquinarios.tsx:78',message:'loadMaquinarios error',data:{error:err instanceof Error?err.message:String(err),stack:err instanceof Error?err.stack:undefined},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      setError(err instanceof Error ? err.message : 'Erro ao carregar maquinários')
    } finally {
      setLoading(false)
      // #region agent log
      fetch('http://127.0.0.1:7247/ingest/d688d544-a3d8-45d0-aec4-1bbd8aaad8c9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Maquinarios.tsx:82',message:'loadMaquinarios finally',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
    }
  }

  useEffect(() => {
    loadMaquinarios()
  }, [])

  const handleCreate = () => {
    setEditingMaquinario(null)
    setFormOpen(true)
  }

  const handleEdit = (maquinario: Maquinario) => {
    setEditingMaquinario(maquinario)
    setFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este maquinário?')) return

    try {
      await deleteMaquinario(id)
      await loadMaquinarios()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir maquinário')
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
      // Carregar dados completos do maquinário
      const fullData = await getMaquinarioById(maquinario.id)
      setSelectedMaquinario(fullData)
      setDetailsOpen(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar detalhes do maquinário')
    }
  }

  const handleDetailsClose = () => {
    setDetailsOpen(false)
    setSelectedMaquinario(null)
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
            maquinarios={filteredMaquinarios}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRowClick={handleRowClick}
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
