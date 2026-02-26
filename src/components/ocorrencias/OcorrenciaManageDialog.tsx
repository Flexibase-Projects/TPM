import { useState, useEffect, useRef } from 'react'
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import WarningIcon from '@mui/icons-material/Warning'
import CloseIcon from '@mui/icons-material/Close'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import PersonIcon from '@mui/icons-material/Person'
import type { 
  OcorrenciaManutencao, 
  StatusOcorrencia, 
  CategoriaOcorrencia,
  StatusHistorico,
  TemposCalculados 
} from '../../types/ocorrencia'
import { 
  assumirOcorrencia, 
  transicionarStatus, 
  getHistoricoStatus, 
  calcularTempos,
  atualizarCategoria 
} from '../../services/ocorrenciaService'
import { getMateriaisByMaquinario, saveMateriaisMaquinario } from '../../services/materialService'
import type { MaterialMaquinarioFormItem } from '../../types/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'

interface OcorrenciaManageDialogProps {
  open: boolean
  onClose: () => void
  ocorrencia: OcorrenciaManutencao | null
  onUpdate: () => void
}

export const OcorrenciaManageDialog = ({
  open,
  onClose,
  ocorrencia,
  onUpdate,
}: OcorrenciaManageDialogProps) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [historico, setHistorico] = useState<StatusHistorico[]>([])
  const [tempos, setTempos] = useState<TemposCalculados | null>(null)
  const [novoStatus, setNovoStatus] = useState<StatusOcorrencia | ''>('')
  const [comentario, setComentario] = useState('')
  const [responsavel, setResponsavel] = useState('')
  const [categoria, setCategoria] = useState<CategoriaOcorrencia | ''>('')
  const [loadingHistorico, setLoadingHistorico] = useState(false)
  const [itensMaterialEdit, setItensMaterialEdit] = useState<MaterialMaquinarioFormItem[]>([])
  const [loadingItensMaterial, setLoadingItensMaterial] = useState(false)
  const [savingItensMaterial, setSavingItensMaterial] = useState(false)
  const [mostrarRetroceder, setMostrarRetroceder] = useState(false)
  const retrocederRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && ocorrencia) {
      setNovoStatus('')
      setComentario('')
      setMostrarRetroceder(false)
      setItensMaterialEdit([])
      // Se status é novo e não tem responsável, deixar vazio para preencher
      // Caso contrário, usar o responsável atual ou vazio
      setResponsavel(ocorrencia.status === 'novo' ? '' : (ocorrencia.responsavel || ''))
      setCategoria(ocorrencia.categoria)
      loadHistorico()
      loadTempos()
      loadItensMaterial()
    }
  }, [open, ocorrencia?.id, ocorrencia?.status])

  const loadHistorico = async () => {
    if (!ocorrencia) {
      return
    }
    setLoadingHistorico(true)
    try {
      const data = await getHistoricoStatus(ocorrencia.id)
      setHistorico(data)
    } catch (err) {
      console.error('Erro ao carregar histórico:', err)
    } finally {
      setLoadingHistorico(false)
    }
  }

  const loadItensMaterial = async () => {
    if (!ocorrencia) return
    setLoadingItensMaterial(true)
    try {
      const data = await getMateriaisByMaquinario(ocorrencia.maquinario_id)
      setItensMaterialEdit(
        data.map((m) => ({
          descricao: m.descricao,
          marca: m.marca ?? undefined,
          valor_unitario: Number(m.valor_unitario),
          quantidade: Number(m.quantidade),
          unidade: m.unidade ?? undefined,
          observacao: m.observacao ?? undefined,
          data_compra: m.data_compra ?? undefined,
        }))
      )
    } catch (err) {
      console.error('Erro ao carregar materiais do maquinário:', err)
      setItensMaterialEdit([])
    } finally {
      setLoadingItensMaterial(false)
    }
  }

  const handleSalvarMateriais = async () => {
    if (!ocorrencia) return
    setSavingItensMaterial(true)
    try {
      await saveMateriaisMaquinario(ocorrencia.maquinario_id, itensMaterialEdit)
      await loadItensMaterial()
      onUpdate()
    } catch (err) {
      console.error('Erro ao salvar materiais:', err)
      setError('Erro ao salvar custos e materiais. Tente novamente.')
    } finally {
      setSavingItensMaterial(false)
    }
  }

  const loadTempos = async () => {
    if (!ocorrencia) return
    try {
      const data = await calcularTempos(ocorrencia.id)
      setTempos(data)
    } catch (err) {
      console.error('Erro ao calcular tempos:', err)
    }
  }

  const handleAssumir = async () => {
    if (!ocorrencia || !responsavel.trim()) {
      setError('Informe o responsável para receber o chamado')
      return
    }

    setLoading(true)
    setError(null)
    try {
      await assumirOcorrencia(ocorrencia.id, responsavel, 'Chamado recebido na manutenção')
      await loadHistorico()
      await loadTempos()
      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao receber chamado')
    } finally {
      setLoading(false)
    }
  }

  const handleTransicionar = async () => {
    if (!ocorrencia || !novoStatus) return

    // Apenas "na fila" requer comentário obrigatório
    if (novoStatus === 'na fila' && !comentario.trim()) {
      setError('Comentário é obrigatório para enviar para fila. Informe o número da ordem de compra ou tipo de serviço solicitado externamente.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      await transicionarStatus(ocorrencia.id, {
        novoStatus,
        comentario: comentario.trim() || undefined,
        responsavel: responsavel || ocorrencia.responsavel || '',
      })
      setNovoStatus('')
      setComentario('')
      await loadHistorico()
      await loadTempos()
      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao transicionar status')
    } finally {
      setLoading(false)
    }
  }

  const handleAtualizarCategoria = async () => {
    if (!ocorrencia || !categoria) return

    setLoading(true)
    setError(null)
    try {
      await atualizarCategoria(ocorrencia.id, categoria)
      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar categoria')
    } finally {
      setLoading(false)
    }
  }

  const handleMostrarRetroceder = () => {
    setMostrarRetroceder(true)
    // Scroll para a seção de retroceder após um pequeno delay para garantir que foi renderizada
    setTimeout(() => {
      retrocederRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  if (!ocorrencia) {
    return null
  }

  const getCategoriaColor = (cat: string) => {
    switch (cat) {
      case 'Vermelho': return '#d32f2f'
      case 'Verde': return '#2e7d32'
      case 'Azul': return '#1976d2'
      default: return '#757575'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'novo': return 'info'
      case 'na fila': return 'warning'
      case 'em execução': return 'primary'
      case 'em espera': return 'default'
      case 'concluído': return 'success'
      case 'cancelado': return 'error'
      default: return 'default'
    }
  }

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm')
  }

  const formatHoras = (horas: number) => {
    const h = Math.floor(horas)
    const m = Math.round((horas - h) * 60)
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
  }

  const statusRequerComentario = novoStatus === 'na fila'
  
  // Calcular progresso para gamificação
  // Ordem correta: Novo → Na Fila → Em Execução → Concluído
  const calcularProgresso = () => {
    if (ocorrencia.status === 'novo') return 0
    if (ocorrencia.status === 'na fila') return 33
    if (ocorrencia.status === 'em execução') return 66
    if (ocorrencia.status === 'concluído') return 100
    return 0
  }
  
  const progresso = calcularProgresso()

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh',
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
          Gerenciar Ordem de Manutenção
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
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2.5}>
          {/* Informações Principais Condensadas */}
          <Grid item xs={12}>
            <Paper sx={{ p: 1.5, backgroundColor: 'background.default' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Máquina:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>
                    {ocorrencia.maquinario?.identificacao || 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{ width: '1px', height: 16, backgroundColor: 'divider' }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Operador:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>
                    {ocorrencia.maquinario?.nome_operador || 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{ width: '1px', height: 16, backgroundColor: 'divider' }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Categoria:
                  </Typography>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={categoria}
                      onChange={(e) => setCategoria(e.target.value as CategoriaOcorrencia)}
                      onBlur={handleAtualizarCategoria}
                      sx={{
                        fontSize: '0.8125rem',
                        height: 28,
                        '& .MuiSelect-select': {
                          fontSize: '0.8125rem',
                          py: 0.5,
                        },
                      }}
                      renderValue={(value) => (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              backgroundColor: getCategoriaColor(value),
                            }}
                          />
                          <Typography sx={{ fontSize: '0.8125rem' }}>{value}</Typography>
                        </Box>
                      )}
                    >
                      <MenuItem value="Vermelho" sx={{ fontSize: '0.8125rem' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: '#d32f2f',
                            }}
                          />
                          Vermelho
                        </Box>
                      </MenuItem>
                      <MenuItem value="Verde" sx={{ fontSize: '0.8125rem' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: '#2e7d32',
                            }}
                          />
                          Verde
                        </Box>
                      </MenuItem>
                      <MenuItem value="Azul" sx={{ fontSize: '0.8125rem' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: '#1976d2',
                            }}
                          />
                          Azul
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ width: '1px', height: 16, backgroundColor: 'divider' }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Status:
                  </Typography>
                  <Chip
                    label={ocorrencia.status}
                    size="small"
                    color={getStatusColor(ocorrencia.status) as any}
                    sx={{ textTransform: 'capitalize', fontWeight: 500, height: 24, fontSize: '0.6875rem' }}
                  />
                </Box>
                {ocorrencia.responsavel && (
                  <>
                    <Box sx={{ width: '1px', height: 16, backgroundColor: 'divider' }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        Responsável:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>
                        {ocorrencia.responsavel}
                      </Typography>
                    </Box>
                  </>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Campo de Responsável (apenas quando status é novo) */}
          {ocorrencia.status === 'novo' && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2, backgroundColor: 'background.default' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, fontSize: '0.875rem' }}>
                  Responsável pela Manutenção
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  placeholder="Nome do técnico responsável"
                  helperText="Informe o nome do técnico que receberá este chamado"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: '0.8125rem',
                    },
                  }}
                />
              </Paper>
            </Grid>
          )}

          {/* Descrição do Problema */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, fontSize: '0.9375rem' }}>
              Descrição do Problema
            </Typography>
            <Paper sx={{ p: 2.5, backgroundColor: 'background.default', minHeight: 120 }}>
              <Typography variant="body1" sx={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {ocorrencia.descricao}
              </Typography>
            </Paper>
          </Grid>

          {/* Barra de Progresso (Gamificação) */}
          {ocorrencia.status !== 'novo' && ocorrencia.status !== 'cancelado' && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2, backgroundColor: 'background.default', border: '1px solid', borderColor: 'primary.main' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                    Progresso do Chamado
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 600 }}>
                    {progresso}%
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: '100%',
                    height: 24,
                    backgroundColor: 'grey.200',
                    borderRadius: 1,
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <Box
                    sx={{
                      width: `${progresso}%`,
                      height: '100%',
                      backgroundColor: progresso === 100 ? 'success.main' : 'primary.main',
                      transition: 'width 0.5s ease-in-out',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      pr: 1,
                    }}
                  >
                    {progresso > 20 && (
                      <Typography variant="caption" sx={{ fontSize: '0.6875rem', color: 'white', fontWeight: 600 }}>
                        {progresso}%
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                  <Typography variant="caption" sx={{ fontSize: '0.6875rem', color: 'text.secondary', fontWeight: (ocorrencia.status as string) === 'novo' ? 600 : 400 }}>
                    NOVO
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: '0.6875rem', color: 'text.secondary', fontWeight: ocorrencia.status === 'na fila' ? 600 : 400 }}>
                    NA FILA
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: '0.6875rem', color: 'text.secondary', fontWeight: ocorrencia.status === 'em execução' ? 600 : 400 }}>
                    EM EXECUÇÃO
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: '0.6875rem', color: 'text.secondary', fontWeight: ocorrencia.status === 'concluído' ? 600 : 400 }}>
                    CONCLUÍDO
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          )}

          {/* Custos e materiais (editável) */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, backgroundColor: 'background.default' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  Custos e materiais
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() =>
                      setItensMaterialEdit((prev) => [
                        ...prev,
                        {
                          descricao: '',
                          marca: undefined,
                          valor_unitario: 0,
                          quantidade: 1,
                          unidade: undefined,
                          observacao: undefined,
                          data_compra: undefined,
                        },
                      ])
                    }
                    disabled={loadingItensMaterial}
                  >
                    Adicionar
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={handleSalvarMateriais}
                    disabled={savingItensMaterial || loadingItensMaterial}
                    startIcon={savingItensMaterial ? <CircularProgress size={16} color="inherit" /> : null}
                  >
                    {savingItensMaterial ? 'Salvando...' : 'Salvar materiais'}
                  </Button>
                </Box>
              </Box>
              {loadingItensMaterial ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={20} />
                </Box>
              ) : itensMaterialEdit.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, py: 1 }}>Descrição</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, py: 1 }}>Marca</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, py: 1 }}>Valor unitário</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, py: 1 }}>Quantidade</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, py: 1 }}>Data da compra</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, py: 1 }}>Total</TableCell>
                        <TableCell sx={{ width: 56 }} />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {itensMaterialEdit.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell sx={{ py: 0.5, verticalAlign: 'middle' }}>
                            <TextField
                              size="small"
                              fullWidth
                              placeholder="Descrição"
                              value={item.descricao ?? ''}
                              onChange={(e) => {
                                const next = [...itensMaterialEdit]
                                next[index] = { ...next[index], descricao: e.target.value }
                                setItensMaterialEdit(next)
                              }}
                              sx={{ '& .MuiInputBase-input': { fontSize: '0.8125rem' } }}
                            />
                          </TableCell>
                          <TableCell sx={{ py: 0.5, verticalAlign: 'middle' }}>
                            <TextField
                              size="small"
                              fullWidth
                              placeholder="Marca"
                              value={item.marca ?? ''}
                              onChange={(e) => {
                                const next = [...itensMaterialEdit]
                                next[index] = { ...next[index], marca: e.target.value || undefined }
                                setItensMaterialEdit(next)
                              }}
                              sx={{ '& .MuiInputBase-input': { fontSize: '0.8125rem' } }}
                            />
                          </TableCell>
                          <TableCell sx={{ py: 0.5, verticalAlign: 'middle' }}>
                            <TextField
                              size="small"
                              type="number"
                              inputProps={{ min: 0, step: 0.01 }}
                              value={item.valor_unitario ?? 0}
                              onChange={(e) => {
                                const next = [...itensMaterialEdit]
                                next[index] = { ...next[index], valor_unitario: Number(e.target.value) || 0 }
                                setItensMaterialEdit(next)
                              }}
                              sx={{ width: 110, '& .MuiInputBase-input': { fontSize: '0.8125rem' } }}
                            />
                          </TableCell>
                          <TableCell sx={{ py: 0.5, verticalAlign: 'middle' }}>
                            <TextField
                              size="small"
                              type="number"
                              inputProps={{ min: 0.01, step: 0.01 }}
                              value={item.quantidade ?? 1}
                              onChange={(e) => {
                                const next = [...itensMaterialEdit]
                                next[index] = { ...next[index], quantidade: Number(e.target.value) || 0 }
                                setItensMaterialEdit(next)
                              }}
                              sx={{ width: 90, '& .MuiInputBase-input': { fontSize: '0.8125rem' } }}
                            />
                          </TableCell>
                          <TableCell sx={{ py: 0.5, verticalAlign: 'middle' }}>
                            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
                              <DatePicker
                                value={item.data_compra ? dayjs(item.data_compra, 'YYYY-MM-DD') : null}
                                onChange={(date) => {
                                  const next = [...itensMaterialEdit]
                                  next[index] = {
                                    ...next[index],
                                    data_compra: date ? dayjs(date).format('YYYY-MM-DD') : undefined,
                                  }
                                  setItensMaterialEdit(next)
                                }}
                                format="DD/MM/YYYY"
                                slotProps={{
                                  textField: {
                                    size: 'small',
                                    placeholder: 'dd/mm/aaaa',
                                    sx: { '& .MuiInputBase-input': { fontSize: '0.8125rem' }, minWidth: 130 },
                                  },
                                }}
                              />
                            </LocalizationProvider>
                          </TableCell>
                          <TableCell sx={{ py: 0.5, verticalAlign: 'middle', fontSize: '0.8125rem' }}>
                            {(Number(item.valor_unitario) * Number(item.quantidade)).toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            })}
                          </TableCell>
                          <TableCell sx={{ py: 0.5, verticalAlign: 'middle' }}>
                            <IconButton
                              size="small"
                              onClick={() => setItensMaterialEdit((prev) => prev.filter((_, i) => i !== index))}
                              aria-label="Remover"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
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
                  Nenhum material registrado. Clique em &quot;Adicionar&quot; para incluir itens.
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Retroceder Chamado Concluído */}
          {ocorrencia.status === 'concluído' && mostrarRetroceder && (
            <Grid item xs={12} ref={retrocederRef}>
              <Paper sx={{ p: 2, backgroundColor: 'background.default', border: '2px solid', borderColor: 'warning.main', position: 'relative' }}>
                <Box
                  sx={{
                    position: 'absolute',
                    top: -12,
                    left: 16,
                    backgroundColor: 'warning.main',
                    color: 'white',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  <WarningIcon sx={{ fontSize: '0.875rem' }} />
                  Ação Especial
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, fontSize: '0.875rem', mt: 1 }}>
                  Retroceder Chamado
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Comentário (opcional)"
                      value={comentario}
                      onChange={(e) => setComentario(e.target.value)}
                      multiline
                      rows={2}
                      placeholder="Ex: Chamado reaberto para correção adicional..."
                      sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          fontSize: '0.8125rem',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel sx={{ fontSize: '0.8125rem' }}>Retroceder para</InputLabel>
                      <Select
                        value={novoStatus}
                        onChange={(e) => setNovoStatus(e.target.value as StatusOcorrencia)}
                        label="Retroceder para"
                        sx={{
                          fontSize: '0.8125rem',
                          '& .MuiSelect-select': {
                            fontSize: '0.8125rem',
                          },
                        }}
                      >
                        <MenuItem value="em execução" sx={{ fontSize: '0.8125rem' }}>Em Execução</MenuItem>
                        <MenuItem value="cancelado" sx={{ fontSize: '0.8125rem' }}>Cancelado</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="contained"
                      color="warning"
                      onClick={handleTransicionar}
                      disabled={loading || !novoStatus}
                      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon />}
                      sx={{ fontSize: '0.8125rem', height: '40px' }}
                      fullWidth
                    >
                      {novoStatus === 'em execução' && 'Reabrir Chamado'}
                      {novoStatus === 'cancelado' && 'Cancelar Chamado'}
                      {!novoStatus && 'Retroceder'}
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          )}

          {/* Transição de Status */}
          {ocorrencia.status !== 'novo' && ocorrencia.status !== 'concluído' && ocorrencia.status !== 'cancelado' && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2, backgroundColor: 'background.default' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, fontSize: '0.875rem' }}>
                  Novo Status:
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label={statusRequerComentario ? 'Comentário (obrigatório)' : 'Comentário (opcional)'}
                      value={comentario}
                      onChange={(e) => setComentario(e.target.value)}
                      multiline
                      rows={3}
                      required={statusRequerComentario}
                      placeholder={
                        statusRequerComentario
                          ? 'Ex: Ordem de compra #12345 ou Serviço externo de solda'
                          : novoStatus === 'concluído'
                          ? 'Descreva o que foi feito (opcional)...'
                          : novoStatus === 'cancelado'
                          ? 'Motivo do cancelamento (opcional)...'
                          : 'Adicione um comentário (opcional)...'
                      }
                      sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          fontSize: '0.8125rem',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel sx={{ fontSize: '0.8125rem' }}>Selecione o novo status</InputLabel>
                      <Select
                        value={novoStatus}
                        onChange={(e) => setNovoStatus(e.target.value as StatusOcorrencia)}
                        label="Selecione o novo status"
                        sx={{
                          fontSize: '0.8125rem',
                          '& .MuiSelect-select': {
                            fontSize: '0.8125rem',
                          },
                        }}
                      >
                        {ocorrencia.status === 'na fila' && (
                          <MenuItem value="em execução" sx={{ fontSize: '0.8125rem' }}>Em Execução</MenuItem>
                        )}
                        {ocorrencia.status === 'em execução' && (
                          <MenuItem value="na fila" sx={{ fontSize: '0.8125rem' }}>Na Fila</MenuItem>
                        )}
                        <MenuItem value="concluído" sx={{ fontSize: '0.8125rem' }}>Concluído</MenuItem>
                        <MenuItem value="cancelado" sx={{ fontSize: '0.8125rem' }}>Cancelado</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      onClick={handleTransicionar}
                      disabled={loading || !novoStatus || (statusRequerComentario && !comentario.trim())}
                      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon />}
                      sx={{ fontSize: '0.8125rem' }}
                      fullWidth
                    >
                      {novoStatus === 'concluído' && 'Finalizar Chamado'}
                      {novoStatus === 'cancelado' && 'Cancelar Chamado'}
                      {novoStatus === 'na fila' && 'Enviar para Fila'}
                      {novoStatus === 'em execução' && 'Colocar em Execução'}
                      {!novoStatus && 'Aplicar Ação'}
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          )}

          {/* Métricas de Tempo */}
          {tempos && ocorrencia.data_recebimento && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2, backgroundColor: 'background.default' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeIcon sx={{ fontSize: '1rem' }} />
                  Métricas de Tempo
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      Tempo em Fila
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                      {formatHoras(tempos.tempo_em_fila)}h
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      Tempo em Execução
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                      {formatHoras(tempos.tempo_em_execucao)}h
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      Tempo Total
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                      {formatHoras(tempos.tempo_total)}h
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      Desde Recebimento
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                      {formatDate(ocorrencia.data_recebimento)}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          )}

          {/* Timeline */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, fontSize: '0.875rem' }}>
              Histórico de Status (Timeline)
            </Typography>
            <Paper sx={{ p: 2.5, backgroundColor: 'background.default', maxHeight: 400, overflow: 'auto' }}>
              {loadingHistorico ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : historico.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem', textAlign: 'center', py: 2 }}>
                  Nenhum histórico registrado ainda
                </Typography>
              ) : (
                <Box sx={{ position: 'relative', pl: 3 }}>
                  {/* Linha vertical da timeline */}
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 8,
                      top: 0,
                      bottom: 0,
                      width: '2px',
                      backgroundColor: 'grey.300',
                    }}
                  />
                  {historico.map((item) => {
                    const statusColorMap: Record<string, string> = {
                      'novo': '#1976d2',
                      'na fila': '#ed6c02',
                      'em execução': '#1976d2',
                      'em espera': '#757575',
                      'concluído': '#2e7d32',
                      'cancelado': '#d32f2f',
                    }
                    const bgColor = statusColorMap[item.status_novo] || '#757575'

                    return (
                      <Box
                        key={item.id}
                        sx={{
                          position: 'relative',
                          mb: 3,
                          '&:last-child': { mb: 0 },
                        }}
                      >
                        {/* Ponto da timeline */}
                        <Box
                          sx={{
                            position: 'absolute',
                            left: -20,
                            top: 8,
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            backgroundColor: '#1976d2',
                            border: '3px solid white',
                            boxShadow: '0 0 0 2px #1976d2',
                            zIndex: 1,
                          }}
                        />
                        {/* Conteúdo */}
                        <Box sx={{ ml: 0 }}>
                          {/* Transição de status com cores */}
                          <Box sx={{ mb: item.comentario ? 1 : 0.5 }}>
                            {item.status_anterior ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                <Chip
                                  label={item.status_anterior}
                                  size="small"
                                  sx={{
                                    textTransform: 'capitalize',
                                    fontSize: '0.6875rem',
                                    fontWeight: 600,
                                    backgroundColor: statusColorMap[item.status_anterior] || '#757575',
                                    color: 'white',
                                    height: 24,
                                  }}
                                />
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontSize: '0.75rem',
                                    color: 'text.secondary',
                                    fontWeight: 500,
                                  }}
                                >
                                  →
                                </Typography>
                                <Chip
                                  label={item.status_novo}
                                  size="small"
                                  sx={{
                                    textTransform: 'capitalize',
                                    fontSize: '0.6875rem',
                                    fontWeight: 600,
                                    backgroundColor: bgColor,
                                    color: 'white',
                                    height: 24,
                                  }}
                                />
                              </Box>
                            ) : (
                              <Chip
                                label={item.status_novo}
                                size="small"
                                sx={{
                                  textTransform: 'capitalize',
                                  fontSize: '0.6875rem',
                                  fontWeight: 600,
                                  backgroundColor: bgColor,
                                  color: 'white',
                                  height: 24,
                                }}
                              />
                            )}
                          </Box>
                          {/* Comentário */}
                          {item.comentario && (
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: '0.8125rem',
                                color: 'text.primary',
                                mb: 0.5,
                                lineHeight: 1.5,
                              }}
                            >
                              {item.comentario}
                            </Typography>
                          )}
                          {/* Data e responsável */}
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: '0.6875rem',
                              color: 'text.secondary',
                              display: 'block',
                            }}
                          >
                            {formatDate(item.created_at)}
                            {item.responsavel && ` • ${item.responsavel}`}
                          </Typography>
                        </Box>
                      </Box>
                    )
                  })}
                </Box>
              )}
              {/* Botão para retroceder chamado concluído */}
              {ocorrencia.status === 'concluído' && !mostrarRetroceder && (
                <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: '0.8125rem',
                      color: 'text.secondary',
                      mb: 2,
                      textAlign: 'center',
                      lineHeight: 1.6,
                    }}
                  >
                    Chamado deu errado ou teve alguma complicação após sua conclusão? Basta clicar em <strong>Retroceder Chamado</strong> para cadastrar as alterações necessárias!
                  </Typography>
                  <Button
                    variant="outlined"
                    color="warning"
                    onClick={handleMostrarRetroceder}
                    startIcon={<WarningIcon />}
                    sx={{
                      fontSize: '0.8125rem',
                      width: '100%',
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2,
                      },
                    }}
                  >
                    Retroceder Chamado
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider', justifyContent: 'space-between' }}>
        <Button onClick={onClose} size="large" sx={{ fontSize: '0.8125rem' }}>
          Fechar
        </Button>
        {ocorrencia.status === 'novo' && !ocorrencia.data_recebimento && (
          <Button
            variant="contained"
            onClick={handleAssumir}
            disabled={loading || !responsavel.trim()}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <PersonIcon />}
            sx={{ fontSize: '0.8125rem' }}
          >
            RECEBER CHAMADO NA MANUTENÇÃO
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
