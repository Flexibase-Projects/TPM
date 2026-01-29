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
import { useState, useEffect } from 'react'
import type { Area } from '../../types/maquinario'

export interface OcorrenciasFilters {
  status: string
  categoria: string
  tipoOM: string
  areaId: string
  searchTerm: string
}

interface OcorrenciasFiltersProps {
  filters: OcorrenciasFilters
  onFiltersChange: (filters: OcorrenciasFilters) => void
}

export const OcorrenciasFiltersComponent = ({
  filters,
  onFiltersChange,
}: OcorrenciasFiltersProps) => {
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

  return (
    <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar por máquina, operador ou descrição..."
            value={filters.searchTerm}
            onChange={(e) => onFiltersChange({ ...filters, searchTerm: e.target.value })}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary', fontSize: '1.125rem' }} />,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '0.8125rem',
              },
            }}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel sx={{ fontSize: '0.8125rem' }}>Status</InputLabel>
            <Select
              value={filters.status}
              onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
              label="Status"
              sx={{
                fontSize: '0.8125rem',
                '& .MuiSelect-select': {
                  fontSize: '0.8125rem',
                },
              }}
            >
              <MenuItem value="Todos" sx={{ fontSize: '0.8125rem' }}>Todos</MenuItem>
              <MenuItem value="novo" sx={{ fontSize: '0.8125rem' }}>Novo</MenuItem>
              <MenuItem value="na fila" sx={{ fontSize: '0.8125rem' }}>Na Fila</MenuItem>
              <MenuItem value="em execução" sx={{ fontSize: '0.8125rem' }}>Em Execução</MenuItem>
              <MenuItem value="em espera" sx={{ fontSize: '0.8125rem' }}>Em Espera</MenuItem>
              <MenuItem value="concluído" sx={{ fontSize: '0.8125rem' }}>Concluído</MenuItem>
              <MenuItem value="cancelado" sx={{ fontSize: '0.8125rem' }}>Cancelado</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel sx={{ fontSize: '0.8125rem' }}>Categoria</InputLabel>
            <Select
              value={filters.categoria}
              onChange={(e) => onFiltersChange({ ...filters, categoria: e.target.value })}
              label="Categoria"
              sx={{
                fontSize: '0.8125rem',
                '& .MuiSelect-select': {
                  fontSize: '0.8125rem',
                },
              }}
            >
              <MenuItem value="Todas" sx={{ fontSize: '0.8125rem' }}>Todas</MenuItem>
              <MenuItem value="Vermelho" sx={{ fontSize: '0.8125rem' }}>Vermelho</MenuItem>
              <MenuItem value="Verde" sx={{ fontSize: '0.8125rem' }}>Verde</MenuItem>
              <MenuItem value="Azul" sx={{ fontSize: '0.8125rem' }}>Azul</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel sx={{ fontSize: '0.8125rem' }}>Tipo OM</InputLabel>
            <Select
              value={filters.tipoOM}
              onChange={(e) => onFiltersChange({ ...filters, tipoOM: e.target.value })}
              label="Tipo OM"
              sx={{
                fontSize: '0.8125rem',
                '& .MuiSelect-select': {
                  fontSize: '0.8125rem',
                },
              }}
            >
              <MenuItem value="Todos" sx={{ fontSize: '0.8125rem' }}>Todos</MenuItem>
              <MenuItem value="Corretiva" sx={{ fontSize: '0.8125rem' }}>Corretiva</MenuItem>
              <MenuItem value="Preventiva" sx={{ fontSize: '0.8125rem' }}>Preventiva</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel sx={{ fontSize: '0.8125rem' }}>Área</InputLabel>
            <Select
              value={filters.areaId}
              onChange={(e) => onFiltersChange({ ...filters, areaId: e.target.value })}
              label="Área"
              sx={{
                fontSize: '0.8125rem',
                '& .MuiSelect-select': {
                  fontSize: '0.8125rem',
                },
              }}
            >
              <MenuItem value="" sx={{ fontSize: '0.8125rem' }}>Todas</MenuItem>
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
