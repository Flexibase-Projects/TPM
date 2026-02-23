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
} from '@mui/material'
import { AreasManager } from './AreasManager'
import { MotivosParadaManager } from './MotivosParadaManager'
import { ChecklistManager } from './ChecklistManager'
import { createMaquinario, updateMaquinario, getAreas, uploadImagemMaquinario, getImagemDisplayUrl } from '../../services/maquinarioService'
import type { Maquinario, MaquinarioFormData, Area, StatusMaquinario } from '../../types/maquinario'

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
    motivos_parada: [],
    checklist_itens: [],
  })
  const [imagemFile, setImagemFile] = useState<File | null>(null)
  const [imagemPreviewUrl, setImagemPreviewUrl] = useState<string | null>(null)

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
          motivos_parada: maquinario.motivos_parada?.map(m => m.descricao) || [],
          checklist_itens: maquinario.checklist_itens?.map(item => ({
            descricao: item.descricao,
            tipo: item.tipo,
            ordem: item.ordem,
          })) || [],
        })
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
          motivos_parada: [],
          checklist_itens: [],
        })
      }
    }
  }, [open, maquinario])

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
      // Imagem selecionada é sempre direcionada ao bucket de maquinários e à coluna imagem_url da tabela de maquinários, para aparecer na listagem ao acessar.
      if (maquinario) {
        let payload: MaquinarioFormData = { ...formData }
        if (imagemFile) {
          const url = await uploadImagemMaquinario(maquinario.id, imagemFile)
          payload = { ...formData, imagem_url: url }
        }
        await updateMaquinario(maquinario.id, payload)
      } else {
        const created = await createMaquinario({ ...formData, imagem_url: imagemFile ? null : formData.imagem_url ?? null })
        if (imagemFile) {
          const url = await uploadImagemMaquinario(created.id, imagemFile)
          await updateMaquinario(created.id, { ...formData, imagem_url: url })
        }
      }
      await onSubmit()
    } catch (error) {
      console.error('Erro ao salvar maquinário:', error)
      const rawMessage = error instanceof Error ? error.message : 'Erro ao salvar maquinário. Verifique os dados e tente novamente.'
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

            {/* Seção: Checklist */}
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
                  Checklist de Limpeza e Manutenção
                </Typography>
                <ChecklistManager
                  items={formData.checklist_itens}
                  onChange={(items) =>
                    setFormData({ ...formData, checklist_itens: items })
                  }
                />
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
