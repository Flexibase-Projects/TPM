import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
} from '@mui/material'
import { getMaquinarioById } from '../services/maquinarioService'
import { MaquinarioQRManualSection } from '../components/maquinarios/MaquinarioQRManualSection'
import { formatarHorasParaHHMM } from '../utils/constants'
import type { Maquinario } from '../types/maquinario'

const formatarMoeda = (valor: number) =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const MaquinarioQRPage = () => {
  const { id } = useParams<{ id: string }>()
  const [maquinario, setMaquinario] = useState<Maquinario | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setError('Identificador do maquinário não informado.')
      setLoading(false)
      return
    }
    let cancelled = false
    getMaquinarioById(id)
      .then((data) => {
        if (!cancelled) setMaquinario(data)
      })
      .catch(() => {
        if (!cancelled) setError('Maquinário não encontrado ou sem permissão.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error || !maquinario) {
    return (
      <Box sx={{ p: 2, maxWidth: 600, mx: 'auto' }}>
        <Alert severity="error">{error ?? 'Maquinário não encontrado.'}</Alert>
      </Box>
    )
  }

  const titulo = maquinario.nome?.trim()
    ? `${maquinario.nome.trim()} - ${maquinario.identificacao}`
    : maquinario.identificacao

  const checklistLimpeza =
    maquinario.checklist_itens?.filter((i) => i.tipo === 'Limpeza').sort((a, b) => a.ordem - b.ordem) ?? []
  const checklistManutencao =
    maquinario.checklist_itens?.filter((i) => i.tipo === 'Manutenção').sort((a, b) => a.ordem - b.ordem) ?? []

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', p: 2 }}>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 600, mb: 2 }}>
        {titulo}
      </Typography>

      <Box sx={{ mb: 3 }}>
        <MaquinarioQRManualSection maquinarioId={maquinario.id} />
      </Box>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Dados do maquinário
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Área</Typography>
            <Typography variant="body2">{maquinario.area?.nome ?? '-'}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Categoria</Typography>
            <Box><Chip label={maquinario.categoria} size="small" color={maquinario.categoria === 'Crítica' ? 'error' : 'default'} /></Box>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Operador</Typography>
            <Typography variant="body2">{maquinario.nome_operador}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Tempo disponível</Typography>
            <Typography variant="body2">{formatarHorasParaHHMM(maquinario.tempo_disponivel_horas ?? 10)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Valor</Typography>
            <Typography variant="body2">
              {maquinario.valor_maquinario != null && Number(maquinario.valor_maquinario) > 0
                ? formatarMoeda(Number(maquinario.valor_maquinario))
                : 'Não informado'}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {checklistLimpeza.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
          <Typography variant="subtitle2" color="primary.main" sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Checklist de Limpeza
          </Typography>
          <List dense disablePadding>
            {checklistLimpeza.map((item) => (
              <ListItem key={item.id} sx={{ py: 0.25, px: 0 }}>
                <ListItemText primary={item.descricao} primaryTypographyProps={{ fontSize: '0.875rem' }} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {checklistManutencao.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Checklist de Manutenção
          </Typography>
          <List dense disablePadding>
            {checklistManutencao.map((item) => (
              <ListItem key={item.id} sx={{ py: 0.25, px: 0 }}>
                <ListItemText primary={item.descricao} primaryTypographyProps={{ fontSize: '0.875rem' }} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  )
}
