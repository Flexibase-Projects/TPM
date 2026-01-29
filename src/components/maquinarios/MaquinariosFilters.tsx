import { useState, useEffect } from 'react'
import {
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { getAreas } from '../../services/maquinarioService'
import type { Area } from '../../types/maquinario'

export interface MaquinariosFilters {
  categoria: 'Crítica' | 'Normal' | 'Todos'
  areaId: string
  searchTerm: string
}

interface MaquinariosFiltersProps {
  filters: MaquinariosFilters
  onFiltersChange: (filters: MaquinariosFilters) => void
}

export const MaquinariosFiltersComponent = ({
  filters,
  onFiltersChange,
}: MaquinariosFiltersProps) => {
  const [areas, setAreas] = useState<Area[]>([])

  useEffect(() => {
    loadAreas()
  }, [])

  const loadAreas = async () => {
    try {
      const data = await getAreas()
      setAreas(data)
    } catch (error) {
      console.error('Erro ao carregar áreas:', error)
    }
  }

  const handleCategoriaChange = (categoria: 'Crítica' | 'Normal' | 'Todos') => {
    onFiltersChange({ ...filters, categoria })
  }

  const handleAreaChange = (areaId: string) => {
    onFiltersChange({ ...filters, areaId })
  }

  const handleSearchChange = (searchTerm: string) => {
    onFiltersChange({ ...filters, searchTerm })
  }

  return (
    <Paper sx={{ p: 1.5, mb: 2, borderRadius: 2 }}>
      <Grid container spacing={1.5} alignItems="center">
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Pesquisar máquina"
            placeholder="Identificação, operador ou nome..."
            value={filters.searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary', fontSize: '1.125rem' }} />,
            }}
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '0.8125rem',
              },
            }}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel sx={{ fontSize: '0.8125rem' }}>Categoria</InputLabel>
            <Select
              value={filters.categoria}
              label="Categoria"
              onChange={(e) =>
                handleCategoriaChange(e.target.value as 'Crítica' | 'Normal' | 'Todos')
              }
              sx={{
                fontSize: '0.8125rem',
                '& .MuiSelect-select': {
                  fontSize: '0.8125rem',
                },
              }}
            >
              <MenuItem value="Todos" sx={{ fontSize: '0.8125rem' }}>Todos</MenuItem>
              <MenuItem value="Crítica" sx={{ fontSize: '0.8125rem' }}>Crítica</MenuItem>
              <MenuItem value="Normal" sx={{ fontSize: '0.8125rem' }}>Normal</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel sx={{ fontSize: '0.8125rem' }}>Área</InputLabel>
            <Select
              value={filters.areaId}
              label="Área"
              onChange={(e) => handleAreaChange(e.target.value)}
              sx={{
                fontSize: '0.8125rem',
                '& .MuiSelect-select': {
                  fontSize: '0.8125rem',
                },
              }}
            >
              <MenuItem value="" sx={{ fontSize: '0.8125rem' }}>Todos</MenuItem>
              {areas.map((area) => (
                <MenuItem key={area.id} value={area.id} sx={{ fontSize: '0.8125rem' }}>
                  {area.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  )
}
