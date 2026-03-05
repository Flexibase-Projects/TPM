import { useState, useEffect } from 'react'
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
} from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import WarningIcon from '@mui/icons-material/Warning'
import ErrorIcon from '@mui/icons-material/Error'
import BlockIcon from '@mui/icons-material/Block'
import ImageIcon from '@mui/icons-material/Image'
import type { Maquinario, StatusMaquinarioCalculado } from '../../types/maquinario'
import { getImagemDisplayUrl } from '../../services/maquinarioService'

interface MaquinariosListProps {
  maquinarios: Maquinario[]
  onEdit: (maquinario: Maquinario) => void
  onDelete: (id: string) => void
  onDuplicate?: (maquinario: Maquinario) => void
  onRowClick?: (maquinario: Maquinario) => void
}

export const MaquinariosList = ({
  maquinarios,
  onEdit,
  onDelete,
  onDuplicate,
  onRowClick,
}: MaquinariosListProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedMaquinario, setSelectedMaquinario] = useState<Maquinario | null>(null)
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null)
  const [clickedRowId, setClickedRowId] = useState<string | null>(null)
  const [imagemLoadErrors, setImagemLoadErrors] = useState<Set<string>>(new Set())
  const open = Boolean(anchorEl)

  const handleImagemError = (maquinarioId: string) => {
    setImagemLoadErrors((prev) => new Set(prev).add(maquinarioId))
  }

  useEffect(() => {
    setImagemLoadErrors(new Set())
  }, [maquinarios])

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

  const handleDuplicate = () => {
    if (selectedMaquinario && onDuplicate) {
      onDuplicate(selectedMaquinario)
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
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell colSpan={9} align="center" sx={{ py: 4, fontSize: '0.8125rem', color: 'text.secondary' }}>
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
            <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontSize: '0.75rem', fontWeight: 600, py: 1, width: 40 }} title="Status">
              •
            </TableCell>
            <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontSize: '0.75rem', fontWeight: 600, py: 1, width: 44 }}>
              Img
            </TableCell>
            <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontSize: '0.75rem', fontWeight: 600, py: 1 }}>
              Ident.
            </TableCell>
            <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontSize: '0.75rem', fontWeight: 600, py: 1 }}>
              Nome
            </TableCell>
            <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontSize: '0.75rem', fontWeight: 600, py: 1 }}>
              Área
            </TableCell>
            <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontSize: '0.75rem', fontWeight: 600, py: 1 }}>
              Operador
            </TableCell>
            <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontSize: '0.75rem', fontWeight: 600, py: 1 }}>
              Valor
            </TableCell>
            <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, py: 1 }}>
              Cat.
            </TableCell>
            <TableCell align="right" width={48} sx={{ py: 1 }}></TableCell>
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
              <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontSize: '0.8125rem', py: 1, verticalAlign: 'middle' }}>
                <Tooltip title={getStatusLabel(maquinario.status_calculado)} arrow>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    {getStatusIcon(maquinario.status_calculado)}
                  </Box>
                </Tooltip>
              </TableCell>
              <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontSize: '0.8125rem', py: 1 }}>
                {(() => {
                  const displayUrl = getImagemDisplayUrl(maquinario.imagem_url)
                  const showPlaceholder = !displayUrl || imagemLoadErrors.has(maquinario.id)
                  if (showPlaceholder) {
                    const placeholderBox = (
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 1,
                          bgcolor: 'action.hover',
                        }}
                      >
                        <ImageIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                      </Box>
                    )
                    const failedLoadTooltip = maquinario.imagem_url
                      ? 'Imagem não carregada. Verifique se o bucket "maquinarios" está público no Supabase (Storage).'
                      : undefined
                    return failedLoadTooltip ? (
                      <Tooltip title={failedLoadTooltip} arrow>
                        {placeholderBox}
                      </Tooltip>
                    ) : (
                      placeholderBox
                    )
                  }
                  return (
                    <Box
                      component="img"
                      src={displayUrl}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      onError={() => handleImagemError(maquinario.id)}
                      key={`${maquinario.id}-${displayUrl}`}
                      sx={{
                        width: 40,
                        height: 40,
                        objectFit: 'cover',
                        borderRadius: 1,
                        display: 'block',
                      }}
                    />
                  )
                })()}
              </TableCell>
              <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontSize: '0.8125rem', py: 1 }}>
                {maquinario.identificacao}
              </TableCell>
              <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontSize: '0.8125rem', py: 1 }}>
                {maquinario.nome || '-'}
              </TableCell>
              <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontSize: '0.8125rem', py: 1 }}>
                {maquinario.area ? maquinario.area.nome : '-'}
              </TableCell>
              <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontSize: '0.8125rem', py: 1 }}>
                {maquinario.nome_operador}
              </TableCell>
              <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontSize: '0.8125rem', py: 1 }}>
                {maquinario.valor_maquinario != null && maquinario.valor_maquinario > 0
                  ? Number(maquinario.valor_maquinario).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                  : '-'}
              </TableCell>
              <TableCell sx={{ fontSize: '0.8125rem', py: 1 }}>
                <Chip
                  label={maquinario.categoria}
                  color={maquinario.categoria === 'Crítica' ? 'error' : 'default'}
                  size="small"
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
              </TableCell>
              <TableCell align="right" sx={{ py: 1 }}>
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
                    width: 28,
                    height: 28,
                    '& svg': { fontSize: '1rem' },
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
        {onDuplicate && (
          <MenuItem onClick={handleDuplicate}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <ContentCopyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Duplicar</ListItemText>
          </MenuItem>
        )}
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
