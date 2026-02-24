import { useState, useEffect } from 'react'
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
  List,
  ListItem,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { getParadasByMaquinario } from '../../services/paradaService'
import type { Maquinario } from '../../types/maquinario'
import type { Parada } from '../../types/parada'
import { formatarHorasParaHHMM } from '../../utils/constants'

interface MaquinarioDetailsDialogProps {
  open: boolean
  onClose: () => void
  maquinario: Maquinario | null
  onRegistrarParada?: (maquinario: Maquinario) => void
}

export const MaquinarioDetailsDialog = ({
  open,
  onClose,
  maquinario,
  onRegistrarParada,
}: MaquinarioDetailsDialogProps) => {
  const [paradas, setParadas] = useState<Parada[]>([])
  const [loadingParadas, setLoadingParadas] = useState(false)

  useEffect(() => {
    if (open && maquinario) {
      loadParadas()
    }
  }, [open, maquinario])

  const loadParadas = async () => {
    if (!maquinario) return
    setLoadingParadas(true)
    try {
      const data = await getParadasByMaquinario(maquinario.id)
      setParadas(data)
    } catch (err) {
      console.error('Erro ao carregar paradas:', err)
      setParadas([])
    } finally {
      setLoadingParadas(false)
    }
  }

  if (!maquinario) return null

  const handleRegistrarParada = () => {
    if (onRegistrarParada) {
      onRegistrarParada(maquinario)
    }
    onClose()
  }

  // Separar checklist por tipo
  const checklistLimpeza = maquinario.checklist_itens
    ?.filter((item) => item.tipo === 'Limpeza')
    .sort((a, b) => a.ordem - b.ordem) || []

  const checklistManutencao = maquinario.checklist_itens
    ?.filter((item) => item.tipo === 'Manutenção')
    .sort((a, b) => a.ordem - b.ordem) || []

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
          Detalhes do Maquinário
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
              Identificação
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.8125rem', fontWeight: 500 }}>
              {maquinario.identificacao}
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
              Categoria
            </Typography>
            <Chip
              label={maquinario.categoria}
              color={maquinario.categoria === 'Crítica' ? 'error' : 'default'}
              size="small"
              sx={{ fontSize: '0.75rem', height: 22 }}
            />
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
              Operador
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
              {maquinario.nome_operador}
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
              Área
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
              {maquinario.area ? maquinario.area.nome : '-'}
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
              Tempo Disponível
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
              {formatarHorasParaHHMM(maquinario.tempo_disponivel_horas || 10)}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2}>
          {/* Checklist de Limpeza - Destaque */}
          {checklistLimpeza.length > 0 && (
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: '#e3f2fd',
                  border: '1px solid',
                  borderColor: 'primary.light',
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'primary.main',
                    mb: 1.5,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Checklist de Limpeza (Limpeza semanal)
                </Typography>
                {maquinario.proxima_limpeza_em && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Próxima limpeza: {new Date(maquinario.proxima_limpeza_em + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </Typography>
                )}
                <List dense sx={{ py: 0 }}>
                  {checklistLimpeza.map((item) => (
                    <ListItem
                      key={item.id}
                      sx={{
                        px: 0,
                        py: 0.75,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:last-child': {
                          borderBottom: 'none',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: 'primary.main',
                          mr: 1.5,
                          mt: 0.5,
                          flexShrink: 0,
                        }}
                      />
                      <ListItemText
                        primary={item.descricao}
                        primaryTypographyProps={{
                          fontSize: '0.875rem',
                          fontWeight: 500,
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          )}

          {/* Checklist de Manutenção */}
          {checklistManutencao.length > 0 && (
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
                  Checklist de Manutenção
                  {maquinario.manutencao_periodo_dias != null && (
                    <> (Manutenção em {maquinario.manutencao_periodo_dias} dias)</>
                  )}
                </Typography>
                <List dense sx={{ py: 0 }}>
                  {checklistManutencao.map((item) => (
                    <ListItem
                      key={item.id}
                      sx={{
                        px: 0,
                        py: 0.75,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:last-child': {
                          borderBottom: 'none',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: 'text.secondary',
                          mr: 1.5,
                          mt: 0.5,
                          flexShrink: 0,
                        }}
                      />
                      <ListItemText
                        primary={item.descricao}
                        primaryTypographyProps={{
                          fontSize: '0.875rem',
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          )}

          {/* Últimas Paradas */}
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
                Últimas Paradas
              </Typography>
              {loadingParadas ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={20} />
                </Box>
              ) : paradas.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, py: 1 }}>
                          Data
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, py: 1 }}>
                          Horário
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, py: 1 }}>
                          Horas Paradas
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, py: 1 }}>
                          Motivo
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, py: 1 }}>
                          Tipo
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paradas.slice(0, 10).map((parada) => (
                        <TableRow key={parada.id}>
                          <TableCell sx={{ fontSize: '0.8125rem', py: 1 }}>
                            {new Date(parada.data_parada).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8125rem', py: 1 }}>
                            {parada.hora_inicio.substring(0, 5)} - {parada.hora_fim.substring(0, 5)}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8125rem', py: 1 }}>
                            {formatarHorasParaHHMM(parada.horas_paradas)}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8125rem', py: 1 }}>
                            {parada.motivo_parada?.descricao || '-'}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8125rem', py: 1 }}>
                            <Chip
                              label={parada.tipo_registro}
                              size="small"
                              color={parada.tipo_registro === 'Automatico' ? 'primary' : 'default'}
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '0.8125rem',
                    color: 'text.secondary',
                    fontStyle: 'italic',
                    textAlign: 'center',
                    py: 2,
                  }}
                >
                  Nenhuma parada registrada
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 2, py: 1.5 }}>
        <Button onClick={onClose} sx={{ fontSize: '0.8125rem' }}>
          Fechar
        </Button>
        {onRegistrarParada && (
          <Button
            onClick={handleRegistrarParada}
            variant="contained"
            sx={{ fontSize: '0.8125rem' }}
          >
            Registrar Parada
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
