import { useState } from 'react'
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { createArea } from '../../services/maquinarioService'
import type { Area } from '../../types/maquinario'

interface AreasManagerProps {
  areas: Area[]
  selectedAreaId: string
  onAreaChange: (areaId: string) => void
  onAreasUpdated: () => void
}

export const AreasManager = ({
  areas,
  selectedAreaId,
  onAreaChange,
  onAreasUpdated,
}: AreasManagerProps) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newAreaNome, setNewAreaNome] = useState('')
  const [newAreaDescricao, setNewAreaDescricao] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreateArea = async () => {
    if (!newAreaNome.trim()) {
      setError('O nome da área é obrigatório')
      return
    }

    try {
      setError(null)
      setLoading(true)
      const area = await createArea(newAreaNome.trim(), newAreaDescricao.trim() || undefined)
      setNewAreaNome('')
      setNewAreaDescricao('')
      setError(null)
      setDialogOpen(false)
      await onAreasUpdated()
      onAreaChange(area.id)
    } catch (error) {
      console.error('Erro ao criar área:', error)
      let errorMessage = 'Erro ao criar área.'
      if (error instanceof Error) {
        errorMessage = error.message
        // Verificar se é erro de RLS
        if (error.message.includes('permission') || error.message.includes('policy')) {
          errorMessage = 'Erro de permissão. Verifique as políticas RLS no Supabase.'
        } else if (error.message.includes('duplicate') || error.message.includes('unique')) {
          errorMessage = 'Já existe uma área com este nome.'
        }
      }
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
        <FormControl fullWidth>
          <InputLabel>Área do Maquinário</InputLabel>
          <Select
            value={selectedAreaId}
            onChange={(e) => onAreaChange(e.target.value)}
            label="Área do Maquinário"
            required
          >
            {areas.map((area) => (
              <MenuItem key={area.id} value={area.id}>
                {area.nome}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Tooltip title="Nova Área" placement="top">
          <IconButton
            onClick={() => setDialogOpen(true)}
            sx={{
              height: 56,
              width: 56,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              '&:hover': {
                backgroundColor: 'action.hover',
                borderColor: 'primary.main',
              },
            }}
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Dialog 
        open={dialogOpen} 
        onClose={() => {
          setDialogOpen(false)
          setError(null)
          setNewAreaNome('')
          setNewAreaDescricao('')
        }} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Cadastrar Nova Área</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
            <TextField
              fullWidth
              label="Nome da Área"
              value={newAreaNome}
              onChange={(e) => {
                setNewAreaNome(e.target.value)
                setError(null)
              }}
              required
              sx={{ mb: 2 }}
              error={!!error && !error.includes('permissão')}
            />
            <TextField
              fullWidth
              label="Descrição (opcional)"
              value={newAreaDescricao}
              onChange={(e) => setNewAreaDescricao(e.target.value)}
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setDialogOpen(false)
              setError(null)
              setNewAreaNome('')
              setNewAreaDescricao('')
            }}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCreateArea}
            variant="contained"
            disabled={loading || !newAreaNome.trim()}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
