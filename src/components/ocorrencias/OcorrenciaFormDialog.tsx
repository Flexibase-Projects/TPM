import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  Box,
  Grid,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  Alert,
  CircularProgress,
} from '@mui/material'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs, { type Dayjs } from 'dayjs'
import 'dayjs/locale/pt-br'
import { getMaquinarios } from '../../services/maquinarioService'
import { createOcorrencia, updateOcorrencia } from '../../services/ocorrenciaService'
import type { OcorrenciaManutencao, OcorrenciaFormData, CategoriaOcorrencia, StatusOcorrencia, TipoOM } from '../../types/ocorrencia'
import type { Maquinario } from '../../types/maquinario'

interface OcorrenciaFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: () => void
  ocorrencia?: OcorrenciaManutencao | null
  initialTipoOM?: TipoOM
  initialMaquinarioId?: string
  initialDescricao?: string
  initialDataOcorrencia?: string
}

export const OcorrenciaFormDialog = ({
  open,
  onClose,
  onSubmit,
  ocorrencia,
  initialTipoOM,
  initialMaquinarioId,
  initialDescricao,
  initialDataOcorrencia,
}: OcorrenciaFormDialogProps) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [maquinarios, setMaquinarios] = useState<Maquinario[]>([])
  const [tipoOM, setTipoOM] = useState<TipoOM | ''>('')
  const [showTipoSelection, setShowTipoSelection] = useState(true)
  const [dataOcorrencia, setDataOcorrencia] = useState<Dayjs | null>(dayjs())
  const [formData, setFormData] = useState<OcorrenciaFormData>({
    maquinario_id: '',
    tipo_om: 'Corretiva',
    categoria: 'Azul',
    descricao: '',
    data_ocorrencia: new Date().toISOString().slice(0, 16),
    responsavel: '',
    status: 'novo',
    observacoes: '',
  })

  useEffect(() => {
    if (open) {
      setError(null)
      loadMaquinarios()
      if (ocorrencia) {
        setTipoOM(ocorrencia.tipo_om || 'Corretiva')
        setShowTipoSelection(false)
        setDataOcorrencia(dayjs(ocorrencia.data_ocorrencia))
        setFormData({
          maquinario_id: ocorrencia.maquinario_id,
          tipo_om: ocorrencia.tipo_om || 'Corretiva',
          categoria: ocorrencia.categoria,
          descricao: ocorrencia.descricao,
          data_ocorrencia: ocorrencia.data_ocorrencia.slice(0, 16),
          responsavel: ocorrencia.responsavel || '',
          status: ocorrencia.status,
          observacoes: ocorrencia.observacoes || '',
        })
      } else {
        if (initialTipoOM) {
          setTipoOM(initialTipoOM)
          setShowTipoSelection(false)
          const dataInicial = initialDataOcorrencia
            ? dayjs(initialDataOcorrencia)
            : dayjs()
          setDataOcorrencia(dataInicial)
          setFormData({
            maquinario_id: initialMaquinarioId || '',
            tipo_om: initialTipoOM,
            categoria: 'Azul',
            descricao: initialDescricao || '',
            data_ocorrencia: dataInicial.format('YYYY-MM-DDTHH:mm'),
            responsavel: '',
            status: 'novo',
            observacoes: '',
          })
        } else {
          setTipoOM('')
          setShowTipoSelection(true)
          const now = dayjs()
          setDataOcorrencia(now)
          setFormData({
            maquinario_id: '',
            tipo_om: 'Corretiva',
            categoria: 'Azul',
            descricao: '',
            data_ocorrencia: now.format('YYYY-MM-DDTHH:mm'),
            responsavel: '',
            status: 'novo',
            observacoes: '',
          })
        }
      }
    }
  }, [open, ocorrencia, initialTipoOM, initialMaquinarioId, initialDescricao, initialDataOcorrencia])

  // Preencher responsável automaticamente quando máquina for selecionada
  useEffect(() => {
    if (formData.maquinario_id && !ocorrencia) {
      const maquinarioSelecionado = maquinarios.find(m => m.id === formData.maquinario_id)
      if (maquinarioSelecionado && !formData.responsavel) {
        setFormData(prev => ({
          ...prev,
          responsavel: maquinarioSelecionado.nome_operador,
        }))
      }
    }
  }, [formData.maquinario_id, maquinarios, ocorrencia])

  const loadMaquinarios = async () => {
    try {
      const data = await getMaquinarios()
      setMaquinarios(data)
    } catch (error) {
      console.error('Erro ao carregar maquinários:', error)
    }
  }

  const handleSubmit = async () => {
    setError(null)

    if (!formData.maquinario_id?.trim()) {
      setError('Selecione o maquinário.')
      return
    }
    if (!formData.descricao?.trim()) {
      setError('Preencha a descrição.')
      return
    }

    try {
      setLoading(true)

      const submitData = {
        ...formData,
        data_ocorrencia: dataOcorrencia ? dataOcorrencia.toISOString() : new Date().toISOString(),
      }

      if (ocorrencia) {
        await updateOcorrencia(ocorrencia.id, submitData)
      } else {
        await createOcorrencia(submitData)
      }
      onSubmit()
    } catch (error) {
      console.error('Erro ao salvar ocorrência:', error)
      const err = error as { message?: string; code?: string; details?: string }
      const errorMessage =
        (err?.message && String(err.message).trim()) ||
        (error instanceof Error ? error.message : '') ||
        'Erro ao salvar ocorrência. Verifique os dados e tente novamente.'
      const detail = [err?.code, err?.details].filter(Boolean).join(' — ')
      setError(detail ? `${errorMessage} (${detail})` : errorMessage)
    } finally {
      setLoading(false)
    }
  }


  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '90vh',
          borderRadius: 2,
        }
      }}
    >
      <DialogTitle sx={{ pb: 1.5, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" component="div" fontWeight={600} sx={{ fontSize: '1rem' }}>
          {ocorrencia ? 'Editar Ocorrência' : 'Nova Ordem de Manutenção'}
        </Typography>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
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
          '&': {
            scrollbarWidth: 'thin',
            scrollbarColor: '#e0e0e0 #ffffff',
          },
        }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        <Box sx={{ pt: 1 }}>
          {showTipoSelection && !ocorrencia ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" sx={{ mb: 4, fontWeight: 600 }}>
                Selecione a ordem de Manutenção
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => {
                    setTipoOM('Corretiva')
                    setShowTipoSelection(false)
                    const now = dayjs()
                    setDataOcorrencia(now)
                    setFormData({
                      ...formData,
                      tipo_om: 'Corretiva',
                      status: 'novo',
                      data_ocorrencia: now.format('YYYY-MM-DDTHH:mm'),
                    })
                  }}
                  sx={{
                    minWidth: 200,
                    py: 2,
                    fontSize: '1rem',
                    fontWeight: 600,
                  }}
                >
                  CORRETIVA
                </Button>
              </Box>
            </Box>
          ) : (tipoOM || ocorrencia) && (
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
              <Grid container spacing={2.5} sx={{ mt: !ocorrencia ? 2 : 0 }}>
                <Grid item xs={12}>
                  {(tipoOM === 'Preventiva' || tipoOM === 'Preditiva') && !ocorrencia ? (
                    <Alert severity="success" sx={{ mb: 2, borderRadius: 2, fontSize: '0.8125rem' }}>
                      <Typography variant="body2" sx={{ fontSize: '0.8125rem', fontWeight: 500, mb: 0.5 }}>
                        Criação de Ordem de Manutenção Preventiva
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                        Verifique os dados pré-preenchidos a partir do checklist do maquinário. Ajuste a categoria,
                        responsável e observações conforme necessário antes de salvar.
                      </Typography>
                    </Alert>
                  ) : (
                    <Alert severity="info" sx={{ mb: 2, borderRadius: 2, fontSize: '0.8125rem' }}>
                      <Typography variant="body2" sx={{ fontSize: '0.8125rem', fontWeight: 500, mb: 0.5 }}>
                        {ocorrencia ? 'Edição de Ordem de Manutenção' : 'Criação de Ordem de Manutenção Corretiva'}
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                        Preencha todos os campos com atenção. Na descrição do problema, seja o mais detalhado possível,
                        incluindo sintomas observados, condições em que o problema ocorreu e qualquer informação relevante
                        que possa auxiliar na resolução.
                      </Typography>
                    </Alert>
                  )}
                </Grid>

              {/* Linha 1: Maquinário */}
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel sx={{ fontSize: '0.8125rem' }}>Maquinário</InputLabel>
                  <Select
                    value={formData.maquinario_id}
                    onChange={(e) => {
                      const selectedMaq = maquinarios.find(maq => maq.id === e.target.value)
                      setFormData({
                        ...formData,
                        maquinario_id: e.target.value,
                        responsavel: selectedMaq ? selectedMaq.nome_operador : '',
                      })
                    }}
                    label="Maquinário"
                    sx={{
                      fontSize: '0.8125rem',
                      '& .MuiSelect-select': {
                        fontSize: '0.8125rem',
                      },
                    }}
                  >
                    {maquinarios.map((maq) => (
                      <MenuItem key={maq.id} value={maq.id} sx={{ fontSize: '0.8125rem' }}>
                        {maq.identificacao} - {maq.nome_operador}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Linha 2: Categoria (70%) / Status (30%) */}
              <Grid item xs={12} md={8.4}>
                <FormControl fullWidth required>
                  <InputLabel sx={{ fontSize: '0.8125rem' }}>Categoria</InputLabel>
                <Select
                  value={formData.categoria}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      categoria: e.target.value as CategoriaOcorrencia,
                    })
                  }
                  label="Categoria"
                  sx={{
                    fontSize: '0.8125rem',
                    '& .MuiSelect-select': {
                      fontSize: '0.8125rem',
                    },
                  }}
                  renderValue={(value) => {
                    const colors: Record<CategoriaOcorrencia, string> = {
                      Vermelho: '#d32f2f',
                      Verde: '#2e7d32',
                      Azul: '#1976d2',
                    }
                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            backgroundColor: colors[value as CategoriaOcorrencia],
                            border: '2px solid',
                            borderColor: colors[value as CategoriaOcorrencia],
                          }}
                        />
                        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                          {value}
                        </Typography>
                      </Box>
                    )
                  }}
                >
                  <MenuItem value="Vermelho" sx={{ fontSize: '0.8125rem', py: 1.5 }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: '#d32f2f',
                          }}
                        />
                        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                          Vermelho - Executado pelo time de Manutenção
                        </Typography>
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: '0.75rem',
                          color: 'text.secondary',
                          display: 'block',
                          pl: 2.5,
                        }}
                      >
                        Manutenção técnica e/ou direta no maquinário de alta complexidade
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="Verde" sx={{ fontSize: '0.8125rem', py: 1.5 }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: '#2e7d32',
                          }}
                        />
                        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                          Verde - Executado pelo time de Manutenção
                        </Typography>
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: '0.75rem',
                          color: 'text.secondary',
                          display: 'block',
                          pl: 2.5,
                        }}
                      >
                        Manutenção de Risco à vida ou Segurança do Operador
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="Azul" sx={{ fontSize: '0.8125rem', py: 1.5 }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: '#1976d2',
                          }}
                        />
                        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                          Azul - Executada pelo Operador
                        </Typography>
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: '0.75rem',
                          color: 'text.secondary',
                          display: 'block',
                          pl: 2.5,
                        }}
                      >
                        Manutenção Rotineira ou de menor complexidade
                      </Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
              </Grid>

              <Grid item xs={12} md={3.6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ fontSize: '0.8125rem' }}>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as StatusOcorrencia,
                      })
                    }
                    label="Status"
                    sx={{
                      fontSize: '0.8125rem',
                      '& .MuiSelect-select': {
                        fontSize: '0.8125rem',
                      },
                    }}
                  >
                    <MenuItem value="novo" sx={{ fontSize: '0.8125rem' }}>Novo</MenuItem>
                    <MenuItem value="na fila" sx={{ fontSize: '0.8125rem' }}>Na Fila</MenuItem>
                    <MenuItem value="em execução" sx={{ fontSize: '0.8125rem' }}>Em Execução</MenuItem>
                    <MenuItem value="em espera" sx={{ fontSize: '0.8125rem' }}>Em Espera</MenuItem>
                    <MenuItem value="concluído" sx={{ fontSize: '0.8125rem' }}>Concluído</MenuItem>
                    <MenuItem value="cancelado" sx={{ fontSize: '0.8125rem' }}>Cancelado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Linha 3: Data e Hora */}
              <Grid item xs={12}>
                <DateTimePicker
                  label="Data e Hora da Ocorrência"
                  value={dataOcorrencia}
                  onChange={(newValue) => {
                    setDataOcorrencia(newValue)
                    if (newValue) {
                      setFormData({
                        ...formData,
                        data_ocorrencia: newValue.format('YYYY-MM-DDTHH:mm'),
                      })
                    }
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      sx: {
                        '& .MuiOutlinedInput-root': {
                          fontSize: '0.8125rem',
                        },
                      },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={tipoOM === 'Preventiva' || tipoOM === 'Preditiva' ? 'Descrição da Manutenção' : 'Descrição do Problema'}
                  value={formData.descricao}
                  onChange={(e) =>
                    setFormData({ ...formData, descricao: e.target.value })
                  }
                  required
                  multiline
                  rows={6}
                  placeholder={
                    tipoOM === 'Preventiva' || tipoOM === 'Preditiva'
                      ? 'Itens do checklist de manutenção preventiva...'
                      : 'Descreva detalhadamente o problema encontrado no maquinário...'
                  }
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: '0.8125rem',
                    },
                  }}
                />
              </Grid>
              </Grid>
            </LocalizationProvider>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
        {showTipoSelection && !ocorrencia ? (
          <Button onClick={onClose} size="large">
            Cancelar
          </Button>
        ) : (
          <>
            {!ocorrencia && (
              <Button
                onClick={() => {
                  setShowTipoSelection(true)
                  setTipoOM('')
                }}
                disabled={loading}
                size="large"
              >
                Voltar
              </Button>
            )}
            <Button onClick={onClose} disabled={loading} size="large">
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={loading || !tipoOM || !formData.maquinario_id || !formData.descricao}
              size="large"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  )
}
