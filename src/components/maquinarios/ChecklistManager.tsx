import { useState } from 'react'
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Typography,
  IconButton,
  Stack,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'

interface ChecklistItem {
  descricao: string
  tipo: 'Limpeza' | 'Manutenção'
  ordem: number
}

interface ChecklistManagerProps {
  items: ChecklistItem[]
  onChange: (items: ChecklistItem[]) => void
  /** Quando definido, só exibe/adiciona itens deste tipo e oculta o seletor de tipo */
  tipoFilter?: 'Limpeza' | 'Manutenção'
}

export const ChecklistManager = ({
  items,
  onChange,
  tipoFilter,
}: ChecklistManagerProps) => {
  const [newItemDescricao, setNewItemDescricao] = useState('')
  const [newItemTipo, setNewItemTipo] = useState<'Limpeza' | 'Manutenção'>(tipoFilter ?? 'Limpeza')
  const effectiveTipo = tipoFilter ?? newItemTipo

  const handleAdd = () => {
    if (newItemDescricao.trim()) {
      const newItem: ChecklistItem = {
        descricao: newItemDescricao.trim(),
        tipo: effectiveTipo,
        ordem: items.length,
      }
      onChange([...items, newItem])
      setNewItemDescricao('')
      if (!tipoFilter) setNewItemTipo('Limpeza')
    }
  }

  const handleRemove = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    // Reordenar
    newItems.forEach((item, i) => {
      item.ordem = i
    })
    onChange(newItems)
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const newItems = [...items]
    const temp = newItems[index]
    newItems[index] = newItems[index - 1]
    newItems[index - 1] = temp
    // Atualizar ordens
    newItems.forEach((item, i) => {
      item.ordem = i
    })
    onChange(newItems)
  }

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return
    const newItems = [...items]
    const temp = newItems[index]
    newItems[index] = newItems[index + 1]
    newItems[index + 1] = temp
    // Atualizar ordens
    newItems.forEach((item, i) => {
      item.ordem = i
    })
    onChange(newItems)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Descrição do item"
          value={newItemDescricao}
          onChange={(e) => setNewItemDescricao(e.target.value)}
        />
        {!tipoFilter && (
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={newItemTipo}
              onChange={(e) =>
                setNewItemTipo(e.target.value as 'Limpeza' | 'Manutenção')
              }
              label="Tipo"
            >
              <MenuItem value="Limpeza">Limpeza</MenuItem>
              <MenuItem value="Manutenção">Manutenção</MenuItem>
            </Select>
          </FormControl>
        )}
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          disabled={!newItemDescricao.trim()}
        >
          Adicionar
        </Button>
      </Box>

      {items.length > 0 && (
        <Stack spacing={1}>
          {items.map((item, index) => (
            <Paper
              key={index}
              variant="outlined"
              sx={{
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <DragIndicatorIcon sx={{ color: 'text.secondary', cursor: 'grab' }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" fontWeight={500}>
                  {item.descricao}
                </Typography>
                {!tipoFilter && (
                  <Typography variant="caption" color="text.secondary">
                    Tipo: {item.tipo}
                  </Typography>
                )}
              </Box>
              <IconButton
                size="small"
                onClick={() => handleMoveUp(index)}
                disabled={index === 0}
                title="Mover para cima"
              >
                <ArrowUpwardIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleMoveDown(index)}
                disabled={index === items.length - 1}
                title="Mover para baixo"
              >
                <ArrowDownwardIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={() => handleRemove(index)}
              >
                <DeleteIcon />
              </IconButton>
            </Paper>
          ))}
        </Stack>
      )}

      {items.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          Nenhum item de checklist cadastrado
        </Typography>
      )}
    </Box>
  )
}
