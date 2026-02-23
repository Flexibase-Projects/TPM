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
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import WarningIcon from '@mui/icons-material/Warning'
import ErrorIcon from '@mui/icons-material/Error'
import BlockIcon from '@mui/icons-material/Block'
import ImageIcon from '@mui/icons-material/Image'
import type { Maquinario, StatusMaquinarioCalculado } from '../../types/maquinario'
import { formatarHorasParaHHMM } from '../../utils/constants'

interface MaquinariosListProps {
  maquinarios: Maquinario[]
  onEdit: (maquinario: Maquinario) => void
  onDelete: (id: string) => void
  onRowClick?: (maquinario: Maquinario) => void
}

export const MaquinariosList = ({
  maquinarios,
  onEdit,
  onDelete,
  onRowClick,
}: MaquinariosListProps) => {
  // #region agent log
  fetch('http://127.0.0.1:7247/ingest/d688d544-a3d8-45d0-aec4-1bbd8aaad8c9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MaquinariosList.tsx:36',message:'MaquinariosList render',data:{maquinariosCount:maquinarios?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedMaquinario, setSelectedMaquinario] = useState<Maquinario | null>(null)
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null)
  const [clickedRowId, setClickedRowId] = useState<string | null>(null)
  const open = Boolean(anchorEl)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, maquinario: Maquinario) => {
    setAnchorEl(event.currentTarget)
    setSelectedMaquinario(maquinario)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedMaquinario(null)
  }

  const handleEdit = () => {
    if (selectedMaquinario) {
      onEdit(selectedMaquinario)
    }
    handleMenuClose()
  }

  const handleDelete = () => {
    if (selectedMaquinario) {
      onDelete(selectedMaquinario.id)
    }
    handleMenuClose()
  }

  const handleRowClick = (maquinario: Maquinario) => {
    if (onRowClick) {
      onRowClick(maquinario)
    } else {
      setClickedRowId(clickedRowId === maquinario.id ? null : maquinario.id)
    }
  }

  const isRowHighlighted = (maquinarioId: string) => {
    const isMenuOpenForThisItem = open && selectedMaquinario?.id === maquinarioId
    return hoveredRowId === maquinarioId || clickedRowId === maquinarioId || isMenuOpenForThisItem
  }

  const shouldShowActions = (maquinarioId: string) => {
    const isMenuOpenForThisItem = open && selectedMaquinario?.id === maquinarioId
    return hoveredRowId === maquinarioId || clickedRowId === maquinarioId || isMenuOpenForThisItem
  }

  const getStatusIcon = (status: StatusMaquinarioCalculado | undefined) => {
    // #region agent log
    fetch('http://127.0.0.1:7247/ingest/d688d544-a3d8-45d0-aec4-1bbd8aaad8c9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MaquinariosList.tsx:90',message:'getStatusIcon called',data:{status,statusType:typeof status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    switch (status) {
      case 'Disponivel':
        return <CheckCircleIcon sx={{ color: '#4caf50', fontSize: '1.125rem' }} />
      case 'Em Manutencao':
        return <WarningIcon sx={{ color: '#ff9800', fontSize: '1.125rem' }} />
      case 'Desativada':
        return <ErrorIcon sx={{ color: '#f44336', fontSize: '1.125rem' }} />
      case 'Inativa':
        return <BlockIcon sx={{ color: '#757575', fontSize: '1.125rem' }} />
      default:
        // #region agent log
        fetch('http://127.0.0.1:7247/ingest/d688d544-a3d8-45d0-aec4-1bbd8aaad8c9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MaquinariosList.tsx:100',message:'getStatusIcon default case',data:{status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        return <CheckCircleIcon sx={{ color: '#4caf50', fontSize: '1.125rem' }} />
    }
  }

  const getStatusLabel = (status: StatusMaquinarioCalculado | undefined): string => {
    switch (status) {
      case 'Disponivel':
        return 'Disponível'
      case 'Em Manutencao':
        return 'Em Manutenção'
      case 'Desativada':
        return 'Desativada'
      case 'Inativa':
        return 'Inativa'
      default:
        return 'Disponível'
    }
  }

  if (maquinarios.length === 0) {
    return (
      <TableContainer>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ py: 4, fontSize: '0.8125rem', color: 'text.secondary' }}>
                Nenhum maquinário cadastrado
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
              Status
            </TableCell>
            <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontSize: '0.8125rem', fontWeight: 600, py: 1.5 }}>
              Imagem
            </TableCell>
            <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontSize: '0.8125rem', fontWeight: 600, py: 1.5 }}>
              Identificação
            </TableCell>
            <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontSize: '0.8125rem', fontWeight: 600, py: 1.5 }}>
              Área
            </TableCell>
            <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontSize: '0.8125rem', fontWeight: 600, py: 1.5 }}>
              Operador
            </TableCell>
            <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontSize: '0.8125rem', fontWeight: 600, py: 1.5 }}>
              Hrs Disp./Dia
            </TableCell>
            <TableCell sx={{ fontSize: '0.8125rem', fontWeight: 600, py: 1.5 }}>
              Categoria
            </TableCell>
            <TableCell align="right" width={80} sx={{ py: 1.5 }}></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {maquinarios.map((maquinario) => (
            <TableRow
              key={maquinario.id}
              onMouseEnter={() => setHoveredRowId(maquinario.id)}
              onMouseLeave={() => setHoveredRowId(null)}
              onClick={() => handleRowClick(maquinario)}
              sx={{
                cursor: 'pointer',
                backgroundColor: isRowHighlighted(maquinario.id)
                  ? 'action.hover'
                  : 'transparent',
                transition: 'background-color 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontSize: '0.8125rem', py: 1.5 }}>
                {/* #region agent log */}
                {(() => {
                  fetch('http://127.0.0.1:7247/ingest/d688d544-a3d8-45d0-aec4-1bbd8aaad8c9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MaquinariosList.tsx:140',message:'rendering status cell',data:{maquinarioId:maquinario.id,statusCalculado:maquinario.status_calculado},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
                  return null;
                })()}
                {/* #endregion */}
                <Tooltip title={getStatusLabel(maquinario.status_calculado)} arrow>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {getStatusIcon(maquinario.status_calculado)}
                    <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                      {getStatusLabel(maquinario.status_calculado)}
                    </Typography>
                  </Box>
                </Tooltip>
              </TableCell>
              <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontSize: '0.8125rem', py: 1.5 }}>
                {maquinario.imagem_url ? (
                  <Box
                    component="img"
                    src={maquinario.imagem_url}
                    alt=""
                    sx={{
                      width: 40,
                      height: 40,
                      objectFit: 'cover',
                      borderRadius: 1,
                      display: 'block',
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 1,
                      bgcolor: 'action.hover',
                    }}
                  >
                    <ImageIcon sx={{ fontSize: '1.25rem', color: 'text.secondary' }} />
                  </Box>
                )}
              </TableCell>
              <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontSize: '0.8125rem', py: 1.5 }}>
                {maquinario.identificacao}
              </TableCell>
              <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontSize: '0.8125rem', py: 1.5 }}>
                {maquinario.area ? maquinario.area.nome : '-'}
              </TableCell>
              <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontSize: '0.8125rem', py: 1.5 }}>
                {maquinario.nome_operador}
              </TableCell>
              <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontSize: '0.8125rem', py: 1.5 }}>
                {formatarHorasParaHHMM(maquinario.tempo_disponivel_horas || 10)}h
              </TableCell>
              <TableCell sx={{ fontSize: '0.8125rem', py: 1.5 }}>
                <Chip
                  label={maquinario.categoria}
                  color={maquinario.categoria === 'Crítica' ? 'error' : 'default'}
                  size="small"
                  sx={{ fontSize: '0.75rem', height: 22 }}
                />
              </TableCell>
              <TableCell align="right" sx={{ py: 1.5 }}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleMenuOpen(e, maquinario)
                  }}
                  aria-label="menu de ações"
                  sx={{
                    opacity: shouldShowActions(maquinario.id) ? 1 : 0,
                    pointerEvents: shouldShowActions(maquinario.id) ? 'auto' : 'none',
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
