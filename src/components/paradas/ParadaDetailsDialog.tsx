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
import type { Parada } from '../../types/parada'
import { formatarHorasParaHHMM } from '../../utils/constants'

interface ParadaDetailsDialogProps {
  open: boolean
  onClose: () => void
  parada: Parada | null
}

export const ParadaDetailsDialog = ({
  open,
  onClose,
  parada,
}: ParadaDetailsDialogProps) => {
  if (!parada) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5) // HH:MM
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
          pb: 1,
        }}
      >
        <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
          Detalhes da Parada
        </Typography>
        <Button
          onClick={onClose}
          sx={{
            minWidth: 'auto',
            p: 0.5,
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </Button>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        {/* Informações Principais - Condensadas */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            mb: 3,
            pb: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ flex: '1 1 auto', minWidth: 120 }}>
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'block',
                mb: 0.5,
              }}
            >
              Data da Parada
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
              {formatDate(parada.data_parada)}
            </Typography>
          </Box>

          <Box sx={{ flex: '1 1 auto', minWidth: 120 }}>
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'block',
                mb: 0.5,
              }}
            >
              Horário
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
              {formatTime(parada.hora_inicio)} - {formatTime(parada.hora_fim)}
            </Typography>
          </Box>

          <Box sx={{ flex: '1 1 auto', minWidth: 120 }}>
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'block',
                mb: 0.5,
              }}
            >
              Tempo Parado
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
              {formatarHorasParaHHMM(parada.horas_paradas)}
            </Typography>
          </Box>

          <Box sx={{ flex: '1 1 auto', minWidth: 120 }}>
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'block',
                mb: 0.5,
              }}
            >
              Tipo de Registro
            </Typography>
            <Chip
              label={parada.tipo_registro}
              size="small"
              color={parada.tipo_registro === 'Automatico' ? 'primary' : 'default'}
              sx={{ fontSize: '0.7rem', height: 22 }}
            />
          </Box>
        </Box>

        <Grid container spacing={2}>
          {/* Informações da Máquina */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'text.secondary',
                  mb: 1.5,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Máquina
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      color: 'text.secondary',
                      display: 'block',
                      mb: 0.5,
                    }}
                  >
                    Identificação
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
                    {parada.maquinario?.identificacao || '-'}
                  </Typography>
                </Box>
                {parada.maquinario?.categoria && (
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        color: 'text.secondary',
                        display: 'block',
                        mb: 0.5,
                      }}
                    >
                      Categoria
                    </Typography>
                    <Chip
                      label={parada.maquinario.categoria}
                      color={parada.maquinario.categoria === 'Crítica' ? 'error' : 'default'}
                      size="small"
                      sx={{ fontSize: '0.7rem', height: 22 }}
                    />
                  </Box>
                )}
                {parada.maquinario?.area && (
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        color: 'text.secondary',
                        display: 'block',
                        mb: 0.5,
                      }}
                    >
                      Área
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
                      {parada.maquinario.area.nome}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Motivo da Parada */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'text.secondary',
                  mb: 1.5,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Motivo da Parada
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
                {parada.motivo_parada?.descricao || 'Não informado'}
              </Typography>
            </Paper>
          </Grid>

          {/* Observações */}
          {parada.observacoes && (
            <Grid item xs={12}>
              <Paper
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'text.secondary',
                    mb: 1.5,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Observações
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8125rem', whiteSpace: 'pre-wrap' }}>
                  {parada.observacoes}
                </Typography>
              </Paper>
            </Grid>
          )}

          {/* Informações da Ocorrência (se houver) */}
          {parada.ocorrencia && (
            <Grid item xs={12}>
              <Paper
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: 'primary.light',
                  border: '1px solid',
                  borderColor: 'primary.main',
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'primary.dark',
                    mb: 1.5,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Ocorrência de Manutenção Relacionada
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.primary' }}>
                  {parada.ocorrencia.descricao || 'Sem descrição'}
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 2, py: 1.5 }}>
        <Button onClick={onClose} sx={{ fontSize: '0.8125rem' }}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
