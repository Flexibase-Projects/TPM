import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Grid,
  Paper,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import type { OcorrenciaManutencao } from '../../types/ocorrencia'
import dayjs from 'dayjs'

interface OcorrenciaDetailsDialogProps {
  open: boolean
  onClose: () => void
  ocorrencia: OcorrenciaManutencao | null
}

export const OcorrenciaDetailsDialog = ({
  open,
  onClose,
  ocorrencia,
}: OcorrenciaDetailsDialogProps) => {
  if (!ocorrencia) return null

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'Vermelho':
        return '#d32f2f'
      case 'Verde':
        return '#2e7d32'
      case 'Azul':
        return '#1976d2'
      default:
        return '#757575'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'novo':
        return 'info'
      case 'na fila':
        return 'warning'
      case 'em execução':
        return 'primary'
      case 'em espera':
        return 'default'
      case 'concluído':
        return 'success'
      case 'cancelado':
        return 'error'
      default:
        return 'default'
    }
  }

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm')
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 2,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" component="div" fontWeight={600} sx={{ fontSize: '1.125rem' }}>
          Detalhes da Ordem de Manutenção
        </Typography>
        <Button
          onClick={onClose}
          sx={{ minWidth: 'auto', p: 0.5, color: 'text.secondary' }}
        >
          <CloseIcon fontSize="small" />
        </Button>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          pt: 3,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#555',
          },
          scrollbarWidth: 'thin',
          scrollbarColor: '#888 #f1f1f1',
        }}
      >
        <Grid container spacing={2.5}>
          {/* Informações Principais */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, backgroundColor: 'background.default' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Máquina
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                    {ocorrencia.maquinario?.identificacao || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Operador
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                    {ocorrencia.maquinario?.nome_operador || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Tipo de OM
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={ocorrencia.tipo_om || 'Corretiva'}
                      size="small"
                      variant="outlined"
                      sx={{ textTransform: 'capitalize', fontWeight: 500 }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Categoria
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={ocorrencia.categoria}
                      size="small"
                      sx={{
                        backgroundColor: getCategoriaColor(ocorrencia.categoria),
                        color: 'white',
                        fontWeight: 500,
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Status
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={ocorrencia.status}
                      size="small"
                      color={getStatusColor(ocorrencia.status) as any}
                      sx={{ textTransform: 'capitalize', fontWeight: 500 }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Responsável
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                    {ocorrencia.responsavel || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Data da Ocorrência
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                    {formatDate(ocorrencia.data_ocorrencia)}
                  </Typography>
                </Grid>
                {ocorrencia.data_fechamento && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      Data de Fechamento
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                      {formatDate(ocorrencia.data_fechamento)}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Grid>

          {/* Descrição do Problema */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, fontSize: '0.875rem' }}>
              Descrição do Problema
            </Typography>
            <Paper sx={{ p: 2, backgroundColor: 'background.default' }}>
              <Typography variant="body2" sx={{ fontSize: '0.8125rem', whiteSpace: 'pre-wrap' }}>
                {ocorrencia.descricao}
              </Typography>
            </Paper>
          </Grid>

          {/* Observações */}
          {ocorrencia.observacoes && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, fontSize: '0.875rem' }}>
                Observações Adicionais
              </Typography>
              <Paper sx={{ p: 2, backgroundColor: 'background.default' }}>
                <Typography variant="body2" sx={{ fontSize: '0.8125rem', whiteSpace: 'pre-wrap' }}>
                  {ocorrencia.observacoes}
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose} size="large" sx={{ fontSize: '0.8125rem' }}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
