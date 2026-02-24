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
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { type Dayjs } from 'dayjs'
import 'dayjs/locale/pt-br'
import { getAreas } from '../../services/maquinarioService'
import type { Area } from '../../types/maquinario'

export interface ParadasFilters {
  categoria: 'Crítica' | 'Normal' | 'Todos'
  areaId: string
  searchTerm: string
  dataFiltro: Dayjs | null
}

interface ParadasFiltersProps {
  filters: ParadasFilters
  onFiltersChange: (filters: ParadasFilters) => void
}

export const ParadasFiltersComponent = ({
  filters,
  onFiltersChange,
}: ParadasFiltersProps) => {
  const [areas, setAreas] = useState<Area[]>([])
  const [areasLoading, setAreasLoading] = useState(true)
  const [areasError, setAreasError] = useState<string | null>(null)

  useEffect(() => {
    loadAreas()
  }, [])

  useEffect(() => {
    if (areasLoading || !filters.areaId) return
    const selectedExists = areas.some((a) => a.id === filters.areaId)
    if (!selectedExists) onFiltersChange({ ...filters, areaId: '' })
  }, [areas, areasLoading, filters.areaId])

  const loadAreas = async () => {
    try {
      setAreasLoading(true)
      setAreasError(null)
      const data = await getAreas()
      setAreas(data)
    } catch (error) {
      console.error('Erro ao carregar áreas:', error)
      setAreasError('Erro ao carregar áreas')
      setAreas([])
    } finally {
      setAreasLoading(false)
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

  const handleDataChange = (data: Dayjs | null) => {
    onFiltersChange({ ...filters, dataFiltro: data })
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      <Paper sx={{ p: 1.5, mb: 2, borderRadius: 2 }}>
        <Grid container spacing={1.5} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Pesquisar"
              placeholder="Máquina, motivo..."
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

          <Grid item xs={12} md={2.25}>
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

          <Grid item xs={12} md={2.25}>
            <FormControl fullWidth size="small">
              <InputLabel id="paradas-filtro-area-label" shrink sx={{ fontSize: '0.8125rem' }}>
                Área
              </InputLabel>
              <Select
                labelId="paradas-filtro-area-label"
                value={filters.areaId}
                label="Área"
                onChange={(e) => handleAreaChange(e.target.value)}
                displayEmpty
                renderValue={(v) => {
                  if (v === '') return 'Todos'
                  const area = areas.find((a) => a.id === v)
                  return area ? area.nome : 'Todos'
                }}
                sx={{
                  fontSize: '0.8125rem',
                  '& .MuiSelect-select': {
                    fontSize: '0.8125rem',
                  },
                }}
                disabled={areasLoading}
              >
                <MenuItem value="" sx={{ fontSize: '0.8125rem' }}>
                  {areasLoading ? 'Carregando áreas...' : 'Todos'}
                </MenuItem>
                {!areasLoading && areas.map((area) => (
                  <MenuItem key={area.id} value={area.id} sx={{ fontSize: '0.8125rem' }}>
                    {area.nome}
                  </MenuItem>
                ))}
                {!areasLoading && areas.length === 0 && !areasError && (
                  <MenuItem value="_empty" disabled sx={{ fontSize: '0.8125rem' }}>
                    Nenhuma área cadastrada
                  </MenuItem>
                )}
                {areasError && (
                  <MenuItem value="_error" disabled sx={{ fontSize: '0.8125rem' }}>
                    {areasError}
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4.5}>
            <DatePicker
              label="Filtrar por Data"
              value={filters.dataFiltro}
              onChange={handleDataChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                  sx: {
                    '& .MuiOutlinedInput-root': {
                      fontSize: '0.8125rem',
                    },
                  },
                },
              }}
            />
          </Grid>
        </Grid>
      </Paper>
    </LocalizationProvider>
  )
}
