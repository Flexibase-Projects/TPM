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
} from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import type { Parada } from '../../types/parada'
import { formatarHorasParaHHMM } from '../../utils/constants'

interface ParadasListProps {
  paradas: Parada[]
  onRowClick?: (parada: Parada) => void
  onEdit?: (parada: Parada) => void
  onDelete?: (id: string) => void
}

export const ParadasList = ({ paradas, onRowClick, onEdit, onDelete }: ParadasListProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedParada, setSelectedParada] = useState<Parada | null>(null)
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null)
  const [clickedRowId, setClickedRowId] = useState<string | null>(null)
  const open = Boolean(anchorEl)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, parada: Parada) => {
    setAnchorEl(event.currentTarget)
    setSelectedParada(parada)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedParada(null)
  }

  const handleEdit = () => {
    if (selectedParada && onEdit) {
      onEdit(selectedParada)
    }
    handleMenuClose()
  }

  const handleDelete = () => {
    if (selectedParada && onDelete) {
      onDelete(selectedParada.id)
    }
    handleMenuClose()
  }

  const handleRowClick = (parada: Parada) => {
    if (onRowClick) {
      onRowClick(parada)
    } else {
      setClickedRowId(clickedRowId === parada.id ? null : parada.id)
    }
  }

  const isRowHighlighted = (paradaId: string) => {
    const isMenuOpenForThisItem = open && selectedParada?.id === paradaId
    return hoveredRowId === paradaId || clickedRowId === paradaId || isMenuOpenForThisItem
  }

  const shouldShowActions = (paradaId: string) => {
    const isMenuOpenForThisItem = open && selectedParada?.id === paradaId
    return hoveredRowId === paradaId || clickedRowId === paradaId || isMenuOpenForThisItem
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  if (paradas.length === 0) {
    return (
      <TableContainer>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 4, fontSize: '0.8125rem', color: 'text.secondary' }}>
                Nenhuma parada cadastrada
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    )
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontSize: '0.8125rem', fontWeight: 600, py: 1.5 }}>
              Data
            </TableCell>
            <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontSize: '0.8125rem', fontWeight: 600, py: 1.5 }}>
              Tempo Parado
            </TableCell>
            <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontSize: '0.8125rem', fontWeight: 600, py: 1.5 }}>
              Máquina
            </TableCell>
            <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontSize: '0.8125rem', fontWeight: 600, py: 1.5 }}>
              Motivo
            </TableCell>
            <TableCell sx={{ fontSize: '0.8125rem', fontWeight: 600, py: 1.5 }}>
              Categoria
            </TableCell>
            <TableCell align="right" width={80} sx={{ py: 1.5 }}></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paradas.map((parada) => (
            <TableRow
              key={parada.id}
              onMouseEnter={() => setHoveredRowId(parada.id)}
              onMouseLeave={() => setHoveredRowId(null)}
              onClick={() => handleRowClick(parada)}
              sx={{
                cursor: 'pointer',
                backgroundColor: isRowHighlighted(parada.id)
                  ? 'action.hover'
                  : 'transparent',
                transition: 'background-color 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontSize: '0.8125rem', py: 1.5 }}>
                {formatDate(parada.data_parada)}
              </TableCell>
              <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontSize: '0.8125rem', py: 1.5 }}>
                {formatarHorasParaHHMM(parada.horas_paradas)}
              </TableCell>
              <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontSize: '0.8125rem', py: 1.5 }}>
                {parada.maquinario?.identificacao || '-'}
              </TableCell>
              <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontSize: '0.8125rem', py: 1.5 }}>
                {parada.motivo_parada?.descricao || '-'}
              </TableCell>
              <TableCell sx={{ fontSize: '0.8125rem', py: 1.5 }}>
                {parada.maquinario?.categoria ? (
                  <Chip
                    label={parada.maquinario.categoria}
                    color={parada.maquinario.categoria === 'Crítica' ? 'error' : 'default'}
                    size="small"
                    sx={{ fontSize: '0.75rem', height: 22 }}
                  />
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell align="right" sx={{ py: 1.5 }}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleMenuOpen(e, parada)
                  }}
                  aria-label="menu de ações"
                  sx={{
                    opacity: shouldShowActions(parada.id) ? 1 : 0,
                    pointerEvents: shouldShowActions(parada.id) ? 'auto' : 'none',
                    transition: 'opacity 0.2s ease-in-out',
                    width: 32,
                    height: 32,
                    '& svg': {
                      fontSize: '1.125rem',
                    },
                  }}
                >
                  <SettingsIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
        PaperProps={{
          sx: {
            borderRadius: 2,
            mt: 0.5,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            '& .MuiMenuItem-root': {
              fontSize: '0.8125rem',
              py: 1,
              px: 1.5,
            },
          },
        }}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon sx={{ minWidth: 36 }}>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon sx={{ minWidth: 36 }}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Excluir</ListItemText>
        </MenuItem>
      </Menu>
    </TableContainer>
  )
}
