import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Grid,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import { AreasManager } from './AreasManager'
import { MotivosParadaManager } from './MotivosParadaManager'
import { ChecklistManager } from './ChecklistManager'
import { createMaquinario, updateMaquinario, getAreas, uploadImagemMaquinario, getImagemDisplayUrl } from '../../services/maquinarioService'
import { createParadaAutomaticaDesativacao } from '../../services/paradaService'
import { getMateriaisByMaquinario, saveMateriaisMaquinario } from '../../services/materialService'
import type { Maquinario, MaquinarioFormData, Area, StatusMaquinario } from '../../types/maquinario'
import type { MaterialMaquinarioFormItem } from '../../types/material'

const MAX_IMAGE_SIZE_MB = 5
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

interface MaquinarioFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: () => void | Promise<void>
  maquinario?: Maquinario | null
}

export const MaquinarioFormDialog = ({
  open,
  onClose,
  onSubmit,
  maquinario,
}: MaquinarioFormDialogProps) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [areas, setAreas] = useState<Area[]>([])
  const [formData, setFormData] = useState<MaquinarioFormData>({
    identificacao: '',
    nome_operador: '',
    area_id: '',
    categoria: 'Normal',
    tempo_disponivel_horas: 9,
    status_maquinario: 'Disponivel',
    motivo_inativacao: null,
    imagem_url: null,
    manutencao_periodo_dias: 30,
    proxima_limpeza_em: null,
    motivos_parada: [],
    checklist_itens: [],
  })
  const [imagemFile, setImagemFile] = useState<File | null>(null)
  const [imagemPreviewUrl, setImagemPreviewUrl] = useState<string | null>(null)
  const [materiaisMaquinario, setMateriaisMaquinario] = useState<MaterialMaquinarioFormItem[]>([])

  useEffect(() => {
    if (open) {
      setError(null)
      loadAreas()
      setImagemFile(null)
      setImagemPreviewUrl(null)
      if (maquinario) {
        setFormData({
          identificacao: maquinario.identificacao,
          nome_operador: maquinario.nome_operador,
          area_id: maquinario.area_id,
          categoria: maquinario.categoria,
          tempo_disponivel_horas: maquinario.tempo_disponivel_horas,
          status_maquinario: maquinario.status_maquinario || 'Disponivel',
          motivo_inativacao: maquinario.motivo_inativacao || null,
          imagem_url: maquinario.imagem_url ?? null,
          manutencao_periodo_dias: maquinario.manutencao_periodo_dias ?? 30,
          proxima_limpeza_em: maquinario.proxima_limpeza_em ?? null,
          motivos_parada: maquinario.motivos_parada?.map(m => m.descricao) || [],
          checklist_itens: maquinario.checklist_itens?.map(item => ({
            descricao: item.descricao,
            tipo: item.tipo,
            ordem: item.ordem,
          })) || [],
        })
        loadMateriaisMaquinario(maquinario.id)
      } else {
        setFormData({
          identificacao: '',
          nome_operador: '',
          area_id: '',
          categoria: 'Normal',
          tempo_disponivel_horas: 9,
          status_maquinario: 'Disponivel',
          motivo_inativacao: null,
          imagem_url: null,
          manutencao_periodo_dias: 30,
          proxima_limpeza_em: null,
          motivos_parada: [],
          checklist_itens: [],
        })
        setMateriaisMaquinario([])
      }
    }
  }, [open, maquinario])

  const loadMateriaisMaquinario = async (maquinarioId: string) => {
    try {
      const data = await getMateriaisByMaquinario(maquinarioId)
      setMateriaisMaquinario(data.map(m => ({
        descricao: m.descricao,
        marca: m.marca ?? undefined,
        valor_unitario: Number(m.valor_unitario),
        quantidade: Number(m.quantidade),
        unidade: m.unidade ?? undefined,
        observacao: m.observacao ?? undefined,
        data_compra: m.data_compra ?? undefined,
      })))
    } catch (err) {
      console.error('Erro ao carregar materiais do maquinário:', err)
      setMateriaisMaquinario([])
    }
  }

  useEffect(() => {
    return () => {
      if (imagemPreviewUrl) URL.revokeObjectURL(imagemPreviewUrl)
    }
  }, [imagemPreviewUrl])

  const loadAreas = async () => {
    try {
      const data = await getAreas()
      setAreas(data)
    } catch (error) {
      console.error('Erro ao carregar áreas:', error)
    }
  }

  const handleImagemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError('Formato inválido. Use JPEG, PNG ou WebP.')
      return
    }
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      setError(`Imagem deve ter no máximo ${MAX_IMAGE_SIZE_MB} MB.`)
      return
    }
    setError(null)
    if (imagemPreviewUrl) URL.revokeObjectURL(imagemPreviewUrl)
    setImagemPreviewUrl(URL.createObjectURL(file))
    setImagemFile(file)
  }

  const handleRemoverImagem = () => {
    if (imagemPreviewUrl) URL.revokeObjectURL(imagemPreviewUrl)
    setImagemPreviewUrl(null)
    setImagemFile(null)
    setFormData((prev) => ({ ...prev, imagem_url: null }))
  }

  const handleSubmit = async () => {
    // Validação: motivo obrigatório para Inativa
    if (formData.status_maquinario === 'Inativa' && (!formData.motivo_inativacao || formData.motivo_inativacao.trim() === '')) {
      setError('Motivo de inativação é obrigatório quando o status é Inativa')
      return
    }

    try {
      setLoading(true)
      setError(null)
      let maquinarioId: string
      if (maquinario) {
        let payload: MaquinarioFormData = { ...formData }
        if (imagemFile) {
          const url = await uploadImagemMaquinario(maquinario.id, imagemFile)
          payload = { ...formData, imagem_url: url }
        }
        await updateMaquinario(maquinario.id, payload)
        maquinarioId = maquinario.id
        if (payload.status_maquinario === 'Desativada') {
          try {
            await createParadaAutomaticaDesativacao(maquinario.id)
          } catch (_) {
            // Parada automática é best-effort; não bloqueia o sucesso do salvamento
          }
        }
      } else {
        const created = await createMaquinario({ ...formData, imagem_url: imagemFile ? null : formData.imagem_url ?? null })
        maquinarioId = created.id
        if (imagemFile) {
          const url = await uploadImagemMaquinario(created.id, imagemFile)
          await updateMaquinario(created.id, { ...formData, imagem_url: url })
        }
        if (formData.status_maquinario === 'Desativada') {
          try {
            await createParadaAutomaticaDesativacao(created.id)
          } catch (_) {
            // Parada automática é best-effort; não bloqueia o sucesso do salvamento
          }
        }
      }
      const itensValidos = materiaisMaquinario.filter(
        (m) => (m.descricao ?? '').trim() !== '' && Number(m.quantidade) > 0 && Number(m.valor_unitario) >= 0
      )
      try {
        await saveMateriaisMaquinario(maquinarioId, itensValidos)
      } catch (errMaterial) {
        const msg = (errMaterial as { message?: string })?.message ?? (errMaterial instanceof Error ? errMaterial.message : String(errMaterial))
        const hint = msg.includes('does not exist') || msg.includes('não existe')
          ? ' Execute a migration 026_create_materiais_maquinario.sql no Supabase (SQL Editor).'
          : ''
        setError(`Erro ao salvar custos e materiais: ${msg}.${hint}`)
        setLoading(false)
        return
      }
      await onSubmit()
    } catch (error) {
      console.error('Erro ao salvar maquinário:', error)
      const rawMessage = (error as { message?: string })?.message ?? (error instanceof Error ? error.message : 'Erro ao salvar maquinário. Verifique os dados e tente novamente.')
      const errorMessage =
        rawMessage === 'Failed to fetch'
          ? 'Sem conexão com o Supabase. Verifique VITE_SUPABASE_URL no .env e se o servidor está acessível.'
          : rawMessage
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { maxHeight: '90vh' }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h5" component="div" fontWeight={600}>
          {maquinario ? 'Editar Maquinário' : 'Cadastrar Novo Maquinário'}
        </Typography>
      </DialogTitle>
      <DialogContent dividers sx={{ position: 'relative' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {/* Categoria Flutuante */}
        <Paper
          elevation={0}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 10,
            backgroundColor: 'white',
            borderRadius: 2,
            p: 0.5,
            ...(formData.categoria === 'Crítica' && {
              boxShadow: '0 0 20px rgba(211, 47, 47, 0.4), 0 0 40px rgba(211, 47, 47, 0.2)',
            }),
            ...(formData.categoria === 'Normal' && {
              boxShadow: '0 0 15px rgba(25, 118, 210, 0.3), 0 0 30px rgba(25, 118, 210, 0.15)',
            }),
          }}
        >
          <ToggleButtonGroup
            value={formData.categoria}
            exclusive
            onChange={(_, newValue) => {
              if (newValue !== null) {
                setFormData({
                  ...formData,
                  categoria: newValue as 'Crítica' | 'Normal',
                })
              }
            }}
            size="medium"
            sx={{
              backgroundColor: 'transparent',
              '& .MuiToggleButton-root': {
                border: 'none',
                px: 2.5,
                py: 1,
                fontWeight: 500,
                textTransform: 'none',
                backgroundColor: 'white',
                color: 'text.primary',
                borderRadius: 1.5,
                '&:hover': {
                  backgroundColor: 'grey.100',
                },
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                },
              },
              ...(formData.categoria === 'Crítica' && {
                '& .MuiToggleButton-root.Mui-selected': {
                  backgroundColor: '#d32f2f',
                  color: 'white',
                  fontWeight: 700,
                  boxShadow: '0 0 15px rgba(211, 47, 47, 0.6)',
                  '&:hover': {
                    backgroundColor: '#c62828',
                    boxShadow: '0 0 20px rgba(211, 47, 47, 0.8)',
                  },
                },
                '& .MuiToggleButton-root:not(.Mui-selected)': {
                  backgroundColor: 'white',
                  color: 'text.primary',
                },
              }),
              ...(formData.categoria === 'Normal' && {
                '& .MuiToggleButton-root.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  fontWeight: 600,
                  boxShadow: '0 0 12px rgba(25, 118, 210, 0.5)',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                    boxShadow: '0 0 15px rgba(25, 118, 210, 0.6)',
                  },
                },
                '& .MuiToggleButton-root:not(.Mui-selected)': {
                  backgroundColor: 'white',
                  color: 'text.primary',
                },
              }),
            }}
          >
            <ToggleButton value="Normal" aria-label="normal">
              Normal
            </ToggleButton>
            <ToggleButton value="Crítica" aria-label="crítica">
              Crítica
            </ToggleButton>
          </ToggleButtonGroup>
        </Paper>

        <Box sx={{ pt: 1 }}>
          <Grid container spacing={3}>
            {/* Seção: Informações Básicas */}
            <Grid item xs={12}>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2.5, 
                  bgcolor: 'grey.50',
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.3s ease',
                  ...(formData.categoria === 'Crítica' && {
                    border: '2px solid',
                    borderColor: '#d32f2f',
                    boxShadow: '0 0 25px rgba(211, 47, 47, 0.3), inset 0 0 15px rgba(211, 47, 47, 0.05)',
                    bgcolor: 'rgba(211, 47, 47, 0.02)',
                  }),
                }}
              >
                <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
                  Informações Básicas
                </Typography>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Identificação do Maquinário"
                      value={formData.identificacao}
                      onChange={(e) =>
                        setFormData({ ...formData, identificacao: e.target.value })
                      }
                      required
                      variant="outlined"
                      size="medium"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Nome do Operador"
                      value={formData.nome_operador}
                      onChange={(e) =>
                        setFormData({ ...formData, nome_operador: e.target.value })
                      }
                      variant="outlined"
                      size="medium"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <AreasManager
                      areas={areas}
                      selectedAreaId={formData.area_id}
                      onAreaChange={(areaId) =>
                        setFormData({ ...formData, area_id: areaId })
                      }
                      onAreasUpdated={loadAreas}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Tempo Disponível (horas)"
                      value={formData.tempo_disponivel_horas}
                      onChange={(e) => {
                        const value = e.target.value
                        const parsed = parseFloat(value)
                        setFormData({
                          ...formData,
                          tempo_disponivel_horas: isNaN(parsed) ? 9 : parsed,
                        })
                      }}
                      inputProps={{ min: 0, step: 0.01 }}
                      required
                      variant="outlined"
                      size="medium"
                      helperText="Tempo disponível de operação em horas"
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Seção: Status do Maquinário */}
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
                  Status do Maquinário
                </Typography>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={formData.status_maquinario || 'Disponivel'}
                        label="Status"
                        onChange={(e) => {
                          const newStatus = e.target.value as StatusMaquinario
                          setFormData({
                            ...formData,
                            status_maquinario: newStatus,
                            motivo_inativacao: newStatus !== 'Inativa' ? null : formData.motivo_inativacao,
                          })
                        }}
                      >
                        <MenuItem value="Disponivel">Disponível</MenuItem>
                        <MenuItem value="Desativada">Desativada</MenuItem>
                        <MenuItem value="Inativa">Inativa</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  {formData.status_maquinario === 'Inativa' && (
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Motivo da Inativação"
                        placeholder="Descreva o motivo da inativação (ex: máquina descartada, vendida, etc.)"
                        value={formData.motivo_inativacao || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, motivo_inativacao: e.target.value })
                        }
                        multiline
                        rows={3}
                        required
                        error={!formData.motivo_inativacao || formData.motivo_inativacao.trim() === ''}
                        helperText={
                          (!formData.motivo_inativacao || formData.motivo_inativacao.trim() === '')
                            ? 'Motivo de inativação é obrigatório'
                            : ''
                        }
                      />
                    </Grid>
                  )}
                </Grid>
                {formData.status_maquinario === 'Desativada' && (
                  <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                    Uma máquina desativada pode ser reativada a qualquer momento. Se houver uma OM aberta,
                    o status será exibido como "Em Manutenção".
                  </Alert>
                )}
                {formData.status_maquinario === 'Inativa' && (
                  <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                    Uma máquina inativa não será considerada para operações. O motivo de inativação é
                    obrigatório para documentação.
                  </Alert>
                )}
              </Paper>
            </Grid>

            {/* Seção: Imagem do maquinário */}
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
                  Imagem do Maquinário
                </Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    {(() => {
                      const previewSrc = imagemPreviewUrl || getImagemDisplayUrl(formData.imagem_url) || ''
                      return previewSrc ? (
                        <Box
                          component="img"
                          src={previewSrc}
                          alt="Preview"
                          key={imagemPreviewUrl ? 'file-preview' : (formData.imagem_url || '')}
                          sx={{
                            width: 80,
                            height: 80,
                            objectFit: 'cover',
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        />
                      ) : (
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 1,
                          border: '1px dashed',
                          borderColor: 'divider',
                          color: 'text.secondary',
                          fontSize: '0.75rem',
                          textAlign: 'center',
                          px: 1,
                        }}
                      >
                        Nenhuma imagem
                      </Box>
                      )
                    })()}
                  </Grid>
                  <Grid item xs={12} sm="auto">
                    <Button variant="outlined" component="label" size="medium" disabled={loading}>
                      {(imagemPreviewUrl || getImagemDisplayUrl(formData.imagem_url)) ? 'Trocar imagem' : 'Selecionar imagem'}
                      <input
                        key={`imagem-${open ? maquinario?.id ?? 'new' : 'closed'}`}
                        type="file"
                        hidden
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImagemChange}
                      />
                    </Button>
                    {(imagemPreviewUrl || getImagemDisplayUrl(formData.imagem_url)) && (
                      <Button
                        variant="text"
                        color="error"
                        size="medium"
                        onClick={handleRemoverImagem}
                        disabled={loading}
                        sx={{ ml: 1 }}
                      >
                        Remover
                      </Button>
                    )}
                  </Grid>
                </Grid>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  JPEG, PNG ou WebP. Máximo {MAX_IMAGE_SIZE_MB} MB.
                </Typography>
              </Paper>
            </Grid>

            {/* Seção: Motivos de Parada */}
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
                  Motivos de Parada
                </Typography>
                <MotivosParadaManager
                  motivos={formData.motivos_parada}
                  onChange={(motivos) =>
                    setFormData({ ...formData, motivos_parada: motivos })
                  }
                />
              </Paper>
            </Grid>

            {/* Seção: Checklist de Limpeza */}
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
                  Checklist de Limpeza (Limpeza semanal)
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
                  <DatePicker
                    label="Próxima limpeza em"
                    format="DD/MM/YYYY"
                    value={formData.proxima_limpeza_em ? dayjs(formData.proxima_limpeza_em) : null}
                    onChange={(d) =>
                      setFormData({
                        ...formData,
                        proxima_limpeza_em: d ? d.format('YYYY-MM-DD') : null,
                      })
                    }
                    slotProps={{ textField: { size: 'small', fullWidth: true, sx: { maxWidth: 220, mb: 2 } } }}
                  />
                </LocalizationProvider>
                <ChecklistManager
                  items={formData.checklist_itens.filter((i) => i.tipo === 'Limpeza')}
                  onChange={(items) =>
                    setFormData({
                      ...formData,
                      checklist_itens: [
                        ...formData.checklist_itens.filter((i) => i.tipo !== 'Limpeza'),
                        ...items,
                      ],
                    })
                  }
                  tipoFilter="Limpeza"
                />
              </Paper>
            </Grid>

            {/* Seção: Checklist de Manutenção */}
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600} component="span">
                    Checklist de Manutenção (Manutenção em
                  </Typography>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={formData.manutencao_periodo_dias ?? 30}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          manutencao_periodo_dias: (e.target.value as 30 | 60 | 90 | 120) ?? 30,
                        })
                      }
                      displayEmpty
                      sx={{ height: 32, fontSize: '0.875rem' }}
                    >
                      <MenuItem value={30}>30 dias</MenuItem>
                      <MenuItem value={60}>60 dias</MenuItem>
                      <MenuItem value={90}>90 dias</MenuItem>
                      <MenuItem value={120}>120 dias</MenuItem>
                    </Select>
                  </FormControl>
                  <Typography variant="subtitle1" fontWeight={600} component="span">
                    )
                  </Typography>
                </Box>
                <ChecklistManager
                  items={formData.checklist_itens.filter((i) => i.tipo === 'Manutenção')}
                  onChange={(items) =>
                    setFormData({
                      ...formData,
                      checklist_itens: [
                        ...formData.checklist_itens.filter((i) => i.tipo !== 'Manutenção'),
                        ...items,
                      ],
                    })
                  }
                  tipoFilter="Manutenção"
                />
              </Paper>
            </Grid>

            {/* Seção: Custos e materiais */}
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  Custos e materiais
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() =>
                      setMateriaisMaquinario((prev) => [
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
                  >
                    Adicionar
                  </Button>
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Descrição</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Marca</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Valor unitário</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Quantidade</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Data da compra</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Total</TableCell>
                        <TableCell sx={{ width: 56 }} />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {materiaisMaquinario.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell sx={{ py: 0.5, verticalAlign: 'middle' }}>
                            <TextField
                              size="small"
                              fullWidth
                              placeholder="Descrição"
                              value={item.descricao ?? ''}
                              onChange={(e) => {
                                const next = [...materiaisMaquinario]
                                next[index] = { ...next[index], descricao: e.target.value }
                                setMateriaisMaquinario(next)
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
                                const next = [...materiaisMaquinario]
                                next[index] = { ...next[index], marca: e.target.value || undefined }
                                setMateriaisMaquinario(next)
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
                                const next = [...materiaisMaquinario]
                                next[index] = { ...next[index], valor_unitario: Number(e.target.value) || 0 }
                                setMateriaisMaquinario(next)
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
                                const next = [...materiaisMaquinario]
                                next[index] = { ...next[index], quantidade: Number(e.target.value) || 0 }
                                setMateriaisMaquinario(next)
                              }}
                              sx={{ width: 90, '& .MuiInputBase-input': { fontSize: '0.8125rem' } }}
                            />
                          </TableCell>
                          <TableCell sx={{ py: 0.5, verticalAlign: 'middle' }}>
                            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
                              <DatePicker
                                value={item.data_compra ? dayjs(item.data_compra, 'YYYY-MM-DD') : null}
                                onChange={(date) => {
                                  const next = [...materiaisMaquinario]
                                  next[index] = {
                                    ...next[index],
                                    data_compra: date ? dayjs(date).format('YYYY-MM-DD') : undefined,
                                  }
                                  setMateriaisMaquinario(next)
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
                              onClick={() => setMateriaisMaquinario((prev) => prev.filter((_, i) => i !== index))}
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
                {materiaisMaquinario.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    Nenhum material. Clique em Adicionar para incluir peças e custos.
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose} disabled={loading} size="large">
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.identificacao || !formData.area_id}
          size="large"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
