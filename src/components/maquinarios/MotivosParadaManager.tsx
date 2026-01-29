import { useState } from 'react'
import { Box, TextField, Button, Chip, Stack, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'

interface MotivosParadaManagerProps {
  motivos: string[]
  onChange: (motivos: string[]) => void
}

export const MotivosParadaManager = ({
  motivos,
  onChange,
}: MotivosParadaManagerProps) => {
  const [newMotivo, setNewMotivo] = useState('')

  const handleAdd = () => {
    if (newMotivo.trim() && !motivos.includes(newMotivo.trim())) {
      onChange([...motivos, newMotivo.trim()])
      setNewMotivo('')
    }
  }

  const handleRemove = (motivo: string) => {
    onChange(motivos.filter((m) => m !== motivo))
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Digite um motivo de parada"
          value={newMotivo}
          onChange={(e) => setNewMotivo(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleAdd()
            }
          }}
        />
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          disabled={!newMotivo.trim()}
        >
          Adicionar
        </Button>
      </Box>

      {motivos.length > 0 && (
        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
          {motivos.map((motivo, index) => (
            <Chip
              key={index}
              label={motivo}
              onDelete={() => handleRemove(motivo)}
              deleteIcon={<DeleteIcon />}
            />
          ))}
        </Stack>
      )}

      {motivos.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          Nenhum motivo de parada cadastrado
        </Typography>
      )}
    </Box>
  )
}
