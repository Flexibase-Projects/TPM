import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Box,
  Tooltip,
  Typography,
} from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import type { OcorrenciaManutencao } from '../../types/ocorrencia'
import dayjs from 'dayjs'

const formatHoras = (horas: number | undefined) => {
  if (!horas || horas === 0) return '00:00h'
  const h = Math.floor(horas)
  const m = Math.round((horas - h) * 60)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}h`
}

interface OcorrenciasListProps {
  ocorrencias: OcorrenciaManutencao[]
  onEdit: (ocorrencia: OcorrenciaManutencao) => void
  onDelete: (id: string) => void
  onRowClick?: (ocorrencia: OcorrenciaManutencao) => void
}

export const OcorrenciasList = ({
  ocorrencias,
  onEdit,
  onDelete,
  onRowClick,
}: OcorrenciasListProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedOcorrencia, setSelectedOcorrencia] = useState<OcorrenciaManutencao | null>(null)
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null)
  const [clickedRowId, setClickedRowId] = useState<string | null>(null)
  const open = Boolean(anchorEl)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, ocorrencia: OcorrenciaManutencao) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
    setSelectedOcorrencia(ocorrencia)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedOcorrencia(null)
  }

  const handleEdit = () => {
    if (selectedOcorrencia) {
      onEdit(selectedOcorrencia)
    }
    handleMenuClose()
  }

  const handleDelete = () => {
    if (selectedOcorrencia) {
      onDelete(selectedOcorrencia.id)
    }
    handleMenuClose()
  }

  const handleRowClick = (ocorrencia: OcorrenciaManutencao) => {
    if (onRowClick) {
      onRowClick(ocorrencia)
    } else {
      setClickedRowId(clickedRowId === ocorrencia.id ? null : ocorrencia.id)
    }
  }

  const isRowHighlighted = (ocorrenciaId: string) => {
    const isMenuOpenForThisItem = open && selectedOcorrencia?.id === ocorrenciaId
    return hoveredRowId === ocorrenciaId || clickedRowId === ocorrenciaId || isMenuOpenForThisItem
  }

  const shouldShowActions = (ocorrenciaId: string) => {
    const isMenuOpenForThisItem = open && selectedOcorrencia?.id === ocorrenciaId
    return hoveredRowId === ocorrenciaId || clickedRowId === ocorrenciaId || isMenuOpenForThisItem
  }

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'Vermelho':
        return '#d32f2f'
      case 'Verde':
        return '#2e7d32'
      case 'Azul':
        return '#1976d2'
      default:
        return '#757575'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'novo':
        return 'info'
      case 'na fila':
        return 'warning'
      case 'em execução':
        return 'primary'
      case 'em espera':
        return 'default'
      case 'concluído':
        return 'success'
      case 'cancelado':
        return 'error'
      default:
        return 'default'
    }
  }

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm')
  }

  return (
    <>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontSize: '0.8125rem', fontWeight: 600, py: 1.5, px: 2 }}>Máquina</TableCell>
              <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontSize: '0.8125rem', fontWeight: 600, py: 1.5, px: 2 }}>Status da Máquina</TableCell>
              <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontSize: '0.8125rem', fontWeight: 600, py: 1.5, px: 2 }}>Responsável</TableCell>
              <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontSize: '0.8125rem', fontWeight: 600, py: 1.5, px: 2 }}>Data Ocorrência</TableCell>
              <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontSize: '0.8125rem', fontWeight: 600, py: 1.5, px: 2 }}>Tempo Total</TableCell>
              <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontSize: '0.8125rem', fontWeight: 600, py: 1.5, px: 2 }}>Tipo</TableCell>
              <TableCell sx={{ fontSize: '0.8125rem', fontWeight: 600, py: 1.5, px: 2 }}>Status</TableCell>
              <TableCell align="right" sx={{ width: '52px', px: 1, py: 1.5 }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ocorrencias.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Nenhuma ordem de manutenção encontrada
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              ocorrencias.map((ocorrencia) => {
                const isHighlighted = isRowHighlighted(ocorrencia.id)
                const showActions = shouldShowActions(ocorrencia.id)

                return (
                  <TableRow
                    key={ocorrencia.id}
                    onClick={() => handleRowClick(ocorrencia)}
                    onMouseEnter={() => setHoveredRowId(ocorrencia.id)}
                    onMouseLeave={() => {
                      if (!open || selectedOcorrencia?.id !== ocorrencia.id) {
                        setHoveredRowId(null)
                      }
                    }}
                    sx={{
                      cursor: 'pointer',
                      backgroundColor: isHighlighted ? 'action.hover' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontSize: '0.8125rem', py: 1.5, px: 2 }}>
                      {ocorrencia.maquinario
                        ? `${ocorrencia.maquinario.identificacao} - ${ocorrencia.maquinario.nome_operador}`
                        : 'N/A'}
                    </TableCell>
                    <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontSize: '0.8125rem', py: 1.5, px: 2 }}>
                      {ocorrencia.maquinario?.categoria ? (
                        <Chip
                          label={ocorrencia.maquinario.categoria}
                          size="small"
                          sx={{
                            backgroundColor: ocorrencia.maquinario.categoria === 'Crítica' ? '#d32f2f' : '#1976d2',
                            color: 'white',
                            fontWeight: 500,
                            fontSize: '0.75rem',
                          }}
                        />
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontSize: '0.8125rem', py: 1.5, px: 2 }}>
                      {ocorrencia.responsavel || 'N/A'}
                    </TableCell>
                    <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontSize: '0.8125rem', py: 1.5, px: 2 }}>
                      {formatDate(ocorrencia.data_ocorrencia)}
                    </TableCell>
                    <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontSize: '0.8125rem', py: 1.5, px: 2 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                        {formatHoras(ocorrencia.tempo_total)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontSize: '0.8125rem', py: 1.5, px: 2 }}>
                      <Chip
                        label={ocorrencia.tipo_om || 'Corretiva'}
                        size="small"
                        variant="outlined"
                        sx={{ textTransform: 'capitalize', fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8125rem', py: 1.5, px: 2 }}>
                      <Chip
                        label={ocorrencia.status}
                        size="small"
                        color={getStatusColor(ocorrencia.status) as any}
                        sx={{ textTransform: 'capitalize', fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ width: '52px', px: 1, py: 1.5 }}>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, ocorrencia)}
                        sx={{
                          opacity: showActions ? 1 : 0,
                          transition: 'opacity 0.2s',
                          visibility: showActions ? 'visible' : 'hidden',
                        }}
                      >
                        <SettingsIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Excluir</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}
