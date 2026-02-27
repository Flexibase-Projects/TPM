import { useState } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material'
import { getOcorrenciaById } from '../services/ocorrenciaService'
import type { OcorrenciaManutencao } from '../types/ocorrencia'

const STATUS_LABELS: Record<string, string> = {
  novo: 'Novo',
  'na fila': 'Na fila',
  'em execução': 'Em execução',
  'em espera': 'Em espera',
  concluído: 'Concluído',
  cancelado: 'Cancelado',
}

export const BuscarOM = () => {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ocorrencia, setOcorrencia] = useState<OcorrenciaManutencao | null>(null)

  const handleBuscar = async () => {
    const id = code.trim()
    if (!id) {
      setError('Informe o código ou ID da OM.')
      setOcorrencia(null)
      return
    }
    setError(null)
    setOcorrencia(null)
    setLoading(true)
    try {
      const data = await getOcorrenciaById(id)
      setOcorrencia(data)
    } catch {
      setError('OM não encontrada. Verifique o código ou ID.')
      setOcorrencia(null)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (d: string | null | undefined) =>
    d ? new Date(d + 'T12:00:00').toLocaleDateString('pt-BR') : '-'

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto' }}>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
        Buscar OM por código
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Informe o ID da ordem de manutenção para visualizar os detalhes (somente leitura).
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <TextField
            label="Código / ID da OM"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Ex.: uuid da OM"
            size="small"
            sx={{ minWidth: 280 }}
            onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
          />
          <Button variant="contained" onClick={handleBuscar} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Buscar'}
          </Button>
        </Box>
      </Paper>

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {ocorrencia && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Ordem de manutenção
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, width: 160 }}>ID</TableCell>
                  <TableCell>{ocorrencia.id}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Maquinário</TableCell>
                  <TableCell>
                    {ocorrencia.maquinario?.identificacao ?? ocorrencia.maquinario_id}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                  <TableCell>{ocorrencia.tipo_om ?? '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Categoria</TableCell>
                  <TableCell>{ocorrencia.categoria}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell>{STATUS_LABELS[ocorrencia.status] ?? ocorrencia.status}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Data da ocorrência</TableCell>
                  <TableCell>{formatDate(ocorrencia.data_ocorrencia)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Descrição</TableCell>
                  <TableCell sx={{ whiteSpace: 'pre-wrap' }}>{ocorrencia.descricao || '-'}</TableCell>
                </TableRow>
                {ocorrencia.observacoes && (
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Observações</TableCell>
                    <TableCell sx={{ whiteSpace: 'pre-wrap' }}>{ocorrencia.observacoes}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  )
}
