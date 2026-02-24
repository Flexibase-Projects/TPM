import { useState, useEffect } from 'react'
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
  Typography,
  Alert,
} from '@mui/material'
import type { Maquinario, StatusMaquinario } from '../../types/maquinario'
import { updateStatusMaquinario } from '../../services/maquinarioService'
import { createParadaAutomaticaDesativacao } from '../../services/paradaService'

interface StatusMaquinarioDialogProps {
  open: boolean
  onClose: () => void
  maquinario: Maquinario | null
  onSuccess: () => void
}

export const StatusMaquinarioDialog = ({
  open,
  onClose,
  maquinario,
  onSuccess,
}: StatusMaquinarioDialogProps) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<StatusMaquinario>('Disponivel')
  const [motivoInativacao, setMotivoInativacao] = useState<string>('')

  useEffect(() => {
    if (open && maquinario) {
      setStatus(maquinario.status_maquinario || 'Disponivel')
      setMotivoInativacao(maquinario.motivo_inativacao || '')
      setError(null)
    }
  }, [open, maquinario])

  const handleSubmit = async () => {
    if (!maquinario) return

    // Validação: motivo obrigatório para Inativa
    if (status === 'Inativa' && (!motivoInativacao || motivoInativacao.trim() === '')) {
      setError('Motivo de inativação é obrigatório')
      return
    }

    try {
      setLoading(true)
      setError(null)

      await updateStatusMaquinario(
        maquinario.id,
        status,
        status === 'Inativa' ? motivoInativacao : null
      )

      if (status === 'Desativada') {
        try {
          await createParadaAutomaticaDesativacao(maquinario.id)
        } catch (_) {
          // Parada automática é best-effort; não bloqueia o sucesso da alteração de status
        }
      }

      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar status')
    } finally {
      setLoading(false)
    }
  }

  const handleReativar = async () => {
    if (!maquinario) return

    try {
      setLoading(true)
      setError(null)

      await updateStatusMaquinario(maquinario.id, 'Disponivel', null)

      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao reativar maquinário')
    } finally {
      setLoading(false)
    }
  }

  const isInativa = status === 'Inativa'
  const isDesativada = status === 'Desativada'
  const podeReativar = isInativa || isDesativada

  return (
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
      <DialogTitle sx={{ fontSize: '1rem', fontWeight: 600, pb: 1 }}>
        Gerenciar Status do Maquinário
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Typography variant="body2" sx={{ mb: 2, fontSize: '0.8125rem', color: 'text.secondary' }}>
          Maquinário: <strong>{maquinario?.identificacao}</strong>
        </Typography>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel sx={{ fontSize: '0.8125rem' }}>Status</InputLabel>
          <Select
            value={status}
            label="Status"
            onChange={(e) => {
              setStatus(e.target.value as StatusMaquinario)
              if (e.target.value !== 'Inativa') {
                setMotivoInativacao('')
              }
            }}
            sx={{
              fontSize: '0.8125rem',
              '& .MuiSelect-select': {
                fontSize: '0.8125rem',
              },
            }}
          >
            <MenuItem value="Disponivel" sx={{ fontSize: '0.8125rem' }}>
              Disponível
            </MenuItem>
            <MenuItem value="Desativada" sx={{ fontSize: '0.8125rem' }}>
              Desativada
            </MenuItem>
            <MenuItem value="Inativa" sx={{ fontSize: '0.8125rem' }}>
              Inativa
            </MenuItem>
          </Select>
        </FormControl>

        {isInativa && (
          <TextField
            fullWidth
            label="Motivo da Inativação"
            placeholder="Descreva o motivo da inativação (ex: máquina descartada, vendida, etc.)"
            value={motivoInativacao}
            onChange={(e) => setMotivoInativacao(e.target.value)}
            multiline
            rows={3}
            required
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                fontSize: '0.8125rem',
              },
            }}
          />
        )}

        {isDesativada && (
          <Alert severity="info" sx={{ mb: 2, borderRadius: 2, fontSize: '0.8125rem' }}>
            Uma máquina desativada pode ser reativada a qualquer momento. Se houver uma OM aberta,
            o status será exibido como "Em Manutenção".
          </Alert>
        )}

        {isInativa && (
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 2, fontSize: '0.8125rem' }}>
            Uma máquina inativa não será considerada para operações. O motivo de inativação é
            obrigatório para documentação.
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2, py: 1.5 }}>
        {podeReativar && (
          <Button
            onClick={handleReativar}
            disabled={loading}
            sx={{ fontSize: '0.8125rem', mr: 'auto' }}
          >
            Reativar
          </Button>
        )}
        <Button onClick={onClose} sx={{ fontSize: '0.8125rem' }}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{ fontSize: '0.8125rem' }}
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
