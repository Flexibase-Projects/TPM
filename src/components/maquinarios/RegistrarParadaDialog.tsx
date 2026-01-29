import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Alert,
  CircularProgress,
  Box,
  Link,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs, { type Dayjs } from 'dayjs'
import 'dayjs/locale/pt-br'
import CloseIcon from '@mui/icons-material/Close'
import { createParadaManual, updateParada, getTempoDisponivel, calcularHorasParada } from '../../services/paradaService'
import type { Parada } from '../../types/parada'
import { getMaquinarioById } from '../../services/maquinarioService'
import type { Maquinario } from '../../types/maquinario'
import type { ParadaFormData } from '../../types/parada'
import { formatarHorasParaHHMM } from '../../utils/constants'

interface RegistrarParadaDialogProps {
  open: boolean
  onClose: () => void
  maquinario: Maquinario | null
  parada?: Parada | null // Parada existente para edição
  onSuccess?: () => void
}

// Funções auxiliares para conversão de tempo
const timeToMinutes = (time: string): number => {
  const parts = time.split(':')
  const hours = parseInt(parts[0], 10)
  const minutes = parseInt(parts[1] || '0', 10)
  return hours * 60 + minutes
}

const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

export const RegistrarParadaDialog = ({
  open,
  onClose,
  maquinario,
  parada,
  onSuccess,
}: RegistrarParadaDialogProps) => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tempoDisponivel, setTempoDisponivel] = useState<number | null>(null)
  const [dataSelecionada, setDataSelecionada] = useState<Dayjs | null>(dayjs())
  const [formData, setFormData] = useState<ParadaFormData>({
    maquinario_id: '',
    data_parada: dayjs().format('YYYY-MM-DD'),
    hora_inicio: '08:00',
    hora_fim: '',
    horas_paradas: undefined,
    motivo_parada_id: '',
    observacoes: '',
  })

  useEffect(() => {
    if (open && maquinario) {
      if (parada) {
        // Modo edição - preencher com dados da parada
        const dataParada = dayjs(parada.data_parada)
        setDataSelecionada(dataParada)
        setFormData({
          maquinario_id: parada.maquinario_id,
          data_parada: parada.data_parada,
          hora_inicio: parada.hora_inicio.substring(0, 5), // HH:MM
          hora_fim: parada.hora_fim.substring(0, 5), // HH:MM
          horas_paradas: parada.horas_paradas,
          motivo_parada_id: parada.motivo_parada_id || '',
          observacoes: parada.observacoes || '',
        })
        loadTempoDisponivel(parada.data_parada)
      } else {
        // Modo criação - valores padrão
        const hoje = dayjs()
        setDataSelecionada(hoje)
        setFormData({
          maquinario_id: maquinario.id,
          data_parada: hoje.format('YYYY-MM-DD'),
          hora_inicio: '08:00',
          hora_fim: '',
          horas_paradas: undefined,
          motivo_parada_id: '',
          observacoes: '',
        })
        loadTempoDisponivel(hoje.format('YYYY-MM-DD'))
      }
      setError(null)
      loadMaquinarioCompleto()
    }
  }, [open, maquinario, parada])

  const loadMaquinarioCompleto = async () => {
    if (!maquinario) return
    try {
      await getMaquinarioById(maquinario.id)
    } catch (err) {
      console.error('Erro ao carregar maquinário:', err)
    }
  }

  const loadTempoDisponivel = async (data: string) => {
    if (!maquinario) return
    try {
      const tempo = await getTempoDisponivel(maquinario.id, data)
      setTempoDisponivel(tempo ? tempo.horas_disponiveis : 10)
    } catch (err) {
      setTempoDisponivel(10) // Valor padrão em caso de erro
    }
  }

  // Calcular hora_fim quando horas_paradas e hora_inicio mudarem
  useEffect(() => {
    if (formData.horas_paradas && formData.horas_paradas > 0 && formData.hora_inicio) {
      const minutosInicio = timeToMinutes(formData.hora_inicio)
      const minutosFim = minutosInicio + Math.floor(formData.horas_paradas * 60)
      const horaFimCalculada = minutesToTime(minutosFim)
      setFormData((prev) => ({ ...prev, hora_fim: horaFimCalculada }))
    }
  }, [formData.horas_paradas, formData.hora_inicio])

  // Calcular horas_paradas quando hora_inicio e hora_fim mudarem (apenas se não tiver horas_paradas preenchido)
  // Usar timeout para evitar cálculo enquanto usuário está digitando
  useEffect(() => {
    if (
      formData.hora_inicio &&
      formData.hora_fim &&
      formData.hora_fim.length === 5 && // Formato completo HH:MM
      formData.hora_fim.includes(':') &&
      (!formData.horas_paradas || formData.horas_paradas === 0)
    ) {
      // Validar se é um horário válido antes de calcular
      const [hours, minutes] = formData.hora_fim.split(':')
      if (hours && minutes && !isNaN(parseInt(hours)) && !isNaN(parseInt(minutes))) {
        // Usar timeout para dar tempo do usuário terminar de digitar
        const timeoutId = setTimeout(() => {
          const horas = calcularHorasParada(formData.hora_inicio, formData.hora_fim)
          setFormData((prev) => {
            // Só atualizar se ainda não tem horas_paradas (evitar sobrescrever se usuário preencheu manualmente)
            if (!prev.horas_paradas || prev.horas_paradas === 0) {
              return { ...prev, horas_paradas: horas }
            }
            return prev
          })
        }, 300) // 300ms de delay

        return () => clearTimeout(timeoutId)
      }
    }
  }, [formData.hora_inicio, formData.hora_fim])

  const handleSubmit = async () => {
    if (!maquinario) return

    setLoading(true)
    setError(null)

    try {
      // Validar campos obrigatórios
      if (!formData.data_parada) {
        throw new Error('Data da parada é obrigatória')
      }

      // Validar motivo obrigatório
      if (!formData.motivo_parada_id) {
        throw new Error('Motivo da parada é obrigatório')
      }

      // Validar que tem horas paradas OU horário completo
      if (!formData.horas_paradas && (!formData.hora_inicio || !formData.hora_fim)) {
        throw new Error('Informe as horas paradas ou o horário de início e fim')
      }

      // Preparar dados para envio
      const dadosEnvio: ParadaFormData = { ...formData }

      // Se tem horas paradas mas não tem hora_fim, calcular
      if (formData.horas_paradas && formData.horas_paradas > 0 && formData.hora_inicio && !formData.hora_fim) {
        const minutosInicio = timeToMinutes(formData.hora_inicio)
        const minutosFim = minutosInicio + Math.floor(formData.horas_paradas * 60)
        dadosEnvio.hora_fim = minutesToTime(minutosFim)
      }

      if (parada) {
        // Modo edição
        await updateParada(parada.id, dadosEnvio)
      } else {
        // Modo criação
        await createParadaManual(dadosEnvio)
      }

      if (onSuccess) {
        onSuccess()
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar parada')
    } finally {
      setLoading(false)
    }
  }

  const handleDataChange = (novaData: Dayjs | null) => {
    if (novaData) {
      const dataFormatada = novaData.format('YYYY-MM-DD')
      setDataSelecionada(novaData)
      setFormData((prev) => ({ ...prev, data_parada: dataFormatada }))
      loadTempoDisponivel(dataFormatada)
    }
  }

  if (!maquinario) return null

  const motivosParada = maquinario.motivos_parada || []
  const horasParadasPreenchido = formData.horas_paradas && formData.horas_paradas > 0

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
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
          <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, mb: 1 }}>
            {parada ? 'Editar' : 'Registrar'} Parada - {maquinario.identificacao}
          </Typography>
            {!parada && (
              <>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '0.8125rem',
                    color: 'text.secondary',
                    lineHeight: 1.6,
                  }}
                >
                  Este registro é apenas para paradas já concluídas que não foram lançadas como Ordem de Manutenção (OM).
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '0.8125rem',
                    color: 'text.secondary',
                    lineHeight: 1.6,
                    mt: 0.5,
                  }}
                >
                  Se a parada ainda não foi concluída,{' '}
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => {
                      onClose()
                      navigate('/ocorrencias')
                    }}
                    sx={{
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: 'primary.main',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      '&:hover': {
                        color: 'primary.dark',
                      },
                    }}
                  >
                    clique aqui para Abrir OM
                  </Link>
                  .
                </Typography>
              </>
            )}
          </Box>
          <Button
            onClick={onClose}
            sx={{
              minWidth: 'auto',
              p: 0.5,
              color: 'text.secondary',
              ml: 2,
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </Button>
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            pt: 2,
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#ffffff',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#e0e0e0',
              borderRadius: '4px',
              '&:hover': {
                background: '#bdbdbd',
              },
            },
            // Para Firefox
            scrollbarWidth: 'thin',
            scrollbarColor: '#e0e0e0 #ffffff',
          }}
        >
          {tempoDisponivel !== null && (
            <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
              Tempo disponível no dia: <strong>{formatarHorasParaHHMM(tempoDisponivel)}</strong>
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <DatePicker
                label="Data da Parada"
                value={dataSelecionada}
                onChange={handleDataChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    size: 'small',
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        fontSize: '0.875rem',
                      },
                    },
                  },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Horas Paradas"
                type="number"
                value={formData.horas_paradas || ''}
                onChange={(e) => {
                  const horas = parseFloat(e.target.value) || undefined
                  setFormData((prev) => ({
                    ...prev,
                    horas_paradas: horas,
                    // Se horas_paradas foi limpo, limpar também hora_fim para dar folha em branco
                    hora_fim: horas ? prev.hora_fim : '',
                  }))
                }}
                helperText={
                  horasParadasPreenchido
                    ? 'A hora de fim será calculada automaticamente'
                    : 'Informe quantas horas a máquina ficou parada (ou use os campos de horário abaixo)'
                }
                inputProps={{
                  step: 0.5,
                  min: 0,
                  max: tempoDisponivel || 10,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '0.875rem',
                  },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.75rem',
                  color: 'text.secondary',
                  fontStyle: 'italic',
                  mb: 1,
                  display: 'block',
                }}
              >
                {horasParadasPreenchido
                  ? 'Ou informe o horário de início (a hora de fim será calculada automaticamente):'
                  : 'Ou informe o horário de início e fim:'}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Hora de Início"
                type="time"
                value={formData.hora_inicio}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    hora_inicio: e.target.value,
                  }))
                }}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '0.875rem',
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Hora de Fim"
                type="time"
                value={formData.hora_fim}
                onChange={(e) => {
                  setFormData((prev) => {
                    const novoHoraFim = e.target.value
                    // Se horas_paradas está preenchido e usuário está editando hora_fim, limpar horas_paradas
                    const deveLimparHorasParadas = prev.horas_paradas && prev.horas_paradas > 0
                    return {
                      ...prev,
                      hora_fim: novoHoraFim,
                      // Limpar horas_paradas apenas se estava preenchido, para permitir cálculo automático depois
                      horas_paradas: deveLimparHorasParadas ? undefined : prev.horas_paradas,
                    }
                  })
                }}
                InputLabelProps={{
                  shrink: true,
                }}
                disabled={horasParadasPreenchido}
                helperText={horasParadasPreenchido ? 'Calculado automaticamente' : 'As horas paradas serão calculadas automaticamente ao preencher'}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '0.875rem',
                  },
                }}
              />
            </Grid>

            {motivosParada.length > 0 && (
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel sx={{ fontSize: '0.875rem' }}>Motivo da Parada</InputLabel>
                  <Select
                    value={formData.motivo_parada_id || ''}
                    label="Motivo da Parada"
                    onChange={(e) =>
                      setFormData({ ...formData, motivo_parada_id: e.target.value })
                    }
                    error={!formData.motivo_parada_id}
                    sx={{
                      fontSize: '0.875rem',
                      '& .MuiSelect-select': {
                        fontSize: '0.875rem',
                      },
                    }}
                  >
                    {motivosParada.map((motivo) => (
                      <MenuItem key={motivo.id} value={motivo.id} sx={{ fontSize: '0.875rem' }}>
                        {motivo.descricao}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {motivosParada.length === 0 && (
              <Grid item xs={12}>
                <Alert severity="warning" sx={{ borderRadius: 2 }}>
                  Nenhum motivo de parada cadastrado para este maquinário. Cadastre motivos antes de registrar paradas.
                </Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observações"
                multiline
                rows={3}
                value={formData.observacoes || ''}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Descreva o que aconteceu durante a parada para melhor documentação e análise futura..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '0.875rem',
                  },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 2, py: 1.5 }}>
          <Button onClick={onClose} disabled={loading} sx={{ fontSize: '0.8125rem' }}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || motivosParada.length === 0}
            sx={{ fontSize: '0.8125rem' }}
          >
                {loading ? <CircularProgress size={16} /> : parada ? 'Salvar Alterações' : 'Registrar Parada'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  )
}
