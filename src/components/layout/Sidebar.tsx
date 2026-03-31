import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
  Box,
  Divider,
} from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ConstructionIcon from '@mui/icons-material/Construction'
import BuildIcon from '@mui/icons-material/Build'
import ListAltIcon from '@mui/icons-material/ListAlt'
import PauseCircleIcon from '@mui/icons-material/PauseCircle'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import HelpIcon from '@mui/icons-material/Help'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import { useThemeMode } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import { usePermissions } from '../../contexts/PermissionsContext'
import PersonIcon from '@mui/icons-material/Person'
import DashboardIcon from '@mui/icons-material/Dashboard'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import { GearLogo } from './GearLogo'

export const drawerWidthExpanded = 240
export const drawerWidthCollapsed = 64

interface SidebarProps {
  open: boolean
  onToggle: () => void
  mobileDrawerOpen?: boolean
  onMobileDrawerClose?: () => void
  isMobile?: boolean
}

export const Sidebar = ({ open, onToggle, mobileDrawerOpen = false, onMobileDrawerClose, isMobile: isMobileProp }: SidebarProps) => {
  const theme = useTheme()
  const isMobileQuery = useMediaQuery(theme.breakpoints.down('md'))
  const isMobile = isMobileProp ?? isMobileQuery
  const navigate = useNavigate()
  const location = useLocation()
  const { mode, toggleTheme } = useThemeMode()
  const { user, signOut } = useAuth()
  const {
    canAccessDashboard,
    canAccessAdmin,
    canManageOM,
    canAccessMaquinarios,
    canAccessParadas,
  } = usePermissions()

  const effectiveOpen = isMobile && mobileDrawerOpen ? true : open
  const prevPathnameRef = useRef(location.pathname)

  const handleNav = (path: string) => {
    navigate(path)
  }

  useEffect(() => {
    if (!isMobile) return
    const prev = prevPathnameRef.current
    prevPathnameRef.current = location.pathname
    if (prev !== location.pathname) {
      onMobileDrawerClose?.()
    }
  }, [location.pathname, isMobile, onMobileDrawerClose])

  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          px: effectiveOpen ? 1.5 : 1,
          py: 1.25,
          minHeight: { xs: 52, sm: 56 },
          gap: 0.5,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: effectiveOpen ? 'space-between' : 'center',
            width: '100%',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: effectiveOpen ? undefined : 'center',
              gap: 0.25,
              minWidth: 0,
              ...(!effectiveOpen && { width: '100%' }),
            }}
          >
            <IconButton
              onClick={() => handleNav('/')}
              aria-label="Início"
              size="small"
              sx={{
                color: 'primary.main',
                p: effectiveOpen ? 1.25 : 0.75,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': { backgroundColor: 'action.hover' },
              }}
            >
              <GearLogo size={effectiveOpen ? 36 : 26} color="currentColor" />
            </IconButton>
            {effectiveOpen && (
              <Typography
                component="span"
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  letterSpacing: '0.02em',
                  fontSize: '0.875rem',
                }}
              >
                TPM
              </Typography>
            )}
          </Box>
          {effectiveOpen && (
            <IconButton 
              onClick={isMobile ? onMobileDrawerClose : onToggle}
              size="small"
              sx={{
                ml: 'auto',
              }}
            >
              {theme.direction === 'rtl' ? (
                <ChevronRightIcon />
              ) : (
                <ChevronLeftIcon />
              )}
            </IconButton>
          )}
        </Box>
      </Toolbar>
      <Divider />
      {!effectiveOpen && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.5 }}>
          <IconButton
            onClick={isMobile ? onMobileDrawerClose : onToggle}
            size="small"
          >
            {theme.direction === 'rtl' ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </Box>
      )}
      {!effectiveOpen && <Divider />}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column', py: 0.5 }}>
      <List
        dense
        disablePadding
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: effectiveOpen ? 'stretch' : 'center',
          px: effectiveOpen ? 1.5 : 0,
        }}
      >
        {/* Dashboard - apenas Gerente e Admin */}
        {canAccessDashboard && (
        <ListItem disablePadding sx={{ display: 'block', mb: 0.5, px: effectiveOpen ? 0 : 0.5 }}>
          <ListItemButton
            onClick={() => handleNav('/')}
            selected={location.pathname === '/'}
            sx={{
              minHeight: 36,
              justifyContent: effectiveOpen ? 'initial' : 'center',
              px: effectiveOpen ? 1.5 : 0,
              py: 0.25,
              backgroundColor: location.pathname === '/' 
                ? (effectiveOpen ? '#e3f2fd' : 'transparent')
                : 'transparent',
              color: location.pathname === '/' 
                ? 'primary.main'
                : 'text.secondary',
              '&:hover': {
                '& > div': {
                  backgroundColor: !effectiveOpen ? '#e3f2fd' : undefined,
                },
                backgroundColor: effectiveOpen 
                  ? (location.pathname === '/' ? '#e3f2fd' : 'action.hover')
                  : 'transparent',
              },
              borderRadius: 1.5,
              fontSize: '0.8125rem',
              position: 'relative',
              ...(effectiveOpen && {
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  right: 6,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: location.pathname === '/' ? 'primary.main' : 'transparent',
                },
              }),
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: effectiveOpen ? 'flex-start' : 'center',
                width: effectiveOpen ? 'auto' : 36,
                height: 36,
                borderRadius: 1.5,
                backgroundColor: !effectiveOpen && location.pathname === '/' ? '#e3f2fd' : 'transparent',
                boxSizing: 'content-box',
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: effectiveOpen ? 1.5 : 0,
                  justifyContent: 'center',
                  color: location.pathname === '/' ? 'primary.main' : 'text.secondary',
                  '& svg': { fontSize: '1.125rem' },
                }}
              >
                <DashboardIcon />
              </ListItemIcon>
            </Box>
            {effectiveOpen && (
              <ListItemText 
                primary="Dashboard" 
                sx={{ 
'& .MuiListItemText-primary': {
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    color: location.pathname === '/' ? 'primary.main' : 'text.secondary',
                  } 
                }} 
              />
            )}
          </ListItemButton>
        </ListItem>
        )}

        {/* Seção de Perfil - MINHAS OM's */}
        <ListItem disablePadding sx={{ display: 'block', mb: 0.5, px: effectiveOpen ? 0 : 0.5 }}>
          <ListItemButton
            onClick={() => handleNav('/minhas-oms')}
            selected={location.pathname === '/minhas-oms'}
            sx={{
              minHeight: 36,
              justifyContent: effectiveOpen ? 'initial' : 'center',
              px: effectiveOpen ? 1.5 : 0,
              py: 0.25,
              backgroundColor: location.pathname === '/minhas-oms' 
                ? (effectiveOpen ? '#e3f2fd' : 'transparent')
                : 'transparent',
              color: location.pathname === '/minhas-oms' 
                ? 'primary.main'
                : 'text.secondary',
              '&:hover': {
                '& > div': {
                  backgroundColor: !effectiveOpen ? '#e3f2fd' : undefined,
                },
                backgroundColor: effectiveOpen 
                  ? (location.pathname === '/minhas-oms' ? '#e3f2fd' : 'action.hover')
                  : 'transparent',
              },
              borderRadius: 1.5,
              fontSize: '0.8125rem',
              position: 'relative',
              ...(effectiveOpen && {
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  right: 6,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: location.pathname === '/minhas-oms' ? 'primary.main' : 'transparent',
                },
              }),
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: effectiveOpen ? 'flex-start' : 'center',
                width: effectiveOpen ? 'auto' : 36,
                height: 36,
                borderRadius: 1.5,
                backgroundColor: !effectiveOpen && location.pathname === '/minhas-oms' ? '#e3f2fd' : 'transparent',
                boxSizing: 'content-box',
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: effectiveOpen ? 1.5 : 0,
                  justifyContent: 'center',
                  color: location.pathname === '/minhas-oms' ? 'primary.main' : 'text.secondary',
                  '& svg': { fontSize: '1.125rem' },
                }}
              >
                <PersonIcon />
              </ListItemIcon>
            </Box>
            {effectiveOpen && (
              <ListItemText 
                primary="MINHAS OM's" 
                sx={{ 
'& .MuiListItemText-primary': {
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    color: location.pathname === '/minhas-oms' ? 'primary.main' : 'text.secondary',
                  } 
                }} 
              />
            )}
          </ListItemButton>
        </ListItem>

        {/* Categoria MANUTENÇÃO */}
        {effectiveOpen && (
          <Typography
            variant="caption"
            sx={{
              px: 2,
              py: 1,
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            MANUTENÇÃO
          </Typography>
        )}
        
        <ListItem disablePadding sx={{ display: 'block', mb: 0.5, px: effectiveOpen ? 0 : 0.5 }}>
          <ListItemButton
            onClick={() => handleNav('/ocorrencias')}
            selected={location.pathname === '/ocorrencias'}
            sx={{
              minHeight: 36,
              justifyContent: effectiveOpen ? 'initial' : 'center',
              px: effectiveOpen ? 1.5 : 0,
              py: 0.25,
              backgroundColor: location.pathname === '/ocorrencias' 
                ? (effectiveOpen ? '#e3f2fd' : 'transparent')
                : 'transparent',
              color: location.pathname === '/ocorrencias' 
                ? 'primary.main'
                : 'text.secondary',
              '&:hover': {
                '& > div': {
                  backgroundColor: !effectiveOpen ? '#e3f2fd' : undefined,
                },
                backgroundColor: effectiveOpen 
                  ? (location.pathname === '/ocorrencias' ? '#e3f2fd' : 'action.hover')
                  : 'transparent',
              },
              borderRadius: 1.5,
              fontWeight: 500,
              fontSize: '0.8125rem',
              position: 'relative',
              ...(effectiveOpen && {
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  right: 6,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: location.pathname === '/ocorrencias' ? 'primary.main' : 'transparent',
                },
              }),
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: effectiveOpen ? 'flex-start' : 'center',
                width: effectiveOpen ? 'auto' : 36,
                height: 36,
                borderRadius: 1.5,
                backgroundColor: !effectiveOpen && location.pathname === '/ocorrencias' ? '#e3f2fd' : 'transparent',
                boxSizing: 'content-box',
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: effectiveOpen ? 1.5 : 0,
                  justifyContent: 'center',
                  color: location.pathname === '/ocorrencias' ? 'primary.main' : 'text.secondary',
                  '& svg': { fontSize: '1.125rem' },
                }}
              >
                <BuildIcon />
              </ListItemIcon>
            </Box>
            {effectiveOpen && (
              <>
                <ListItemText 
                  primary="Abrir OM" 
                  sx={{ 
'& .MuiListItemText-primary': {
                    fontSize: '0.8125rem',
                      fontWeight: 500,
                      color: location.pathname === '/ocorrencias' ? 'primary.main' : 'text.secondary',
                    } 
                  }} 
                />
              </>
            )}
          </ListItemButton>
        </ListItem>
        
        {canManageOM && (
        <ListItem disablePadding sx={{ display: 'block', mb: 0.5, px: effectiveOpen ? 0 : 0.5 }}>
          <ListItemButton
            onClick={() => handleNav('/visualizar-om')}
            selected={location.pathname === '/visualizar-om'}
            sx={{
              minHeight: 36,
              justifyContent: effectiveOpen ? 'initial' : 'center',
              px: effectiveOpen ? 1.5 : 0,
              py: 0.25,
              backgroundColor: location.pathname === '/visualizar-om' 
                ? (effectiveOpen ? '#e3f2fd' : 'transparent')
                : 'transparent',
              color: location.pathname === '/visualizar-om' 
                ? 'primary.main'
                : 'text.secondary',
              '&:hover': {
                '& > div': {
                  backgroundColor: !effectiveOpen ? '#e3f2fd' : undefined,
                },
                backgroundColor: effectiveOpen 
                  ? (location.pathname === '/visualizar-om' ? '#e3f2fd' : 'action.hover')
                  : 'transparent',
              },
              borderRadius: 1.5,
              fontSize: '0.8125rem',
              position: 'relative',
              ...(effectiveOpen && {
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  right: 6,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: location.pathname === '/visualizar-om' ? 'primary.main' : 'transparent',
                },
              }),
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: effectiveOpen ? 'flex-start' : 'center',
                width: effectiveOpen ? 'auto' : 36,
                height: 36,
                borderRadius: 1.5,
                backgroundColor: !effectiveOpen && location.pathname === '/visualizar-om' ? '#e3f2fd' : 'transparent',
                boxSizing: 'content-box',
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: effectiveOpen ? 1.5 : 0,
                  justifyContent: 'center',
                  color: location.pathname === '/visualizar-om' ? 'primary.main' : 'text.secondary',
                  '& svg': { fontSize: '1.125rem' },
                }}
              >
                <ListAltIcon />
              </ListItemIcon>
            </Box>
            {effectiveOpen && (
              <ListItemText 
                primary="Visualizar OM" 
                sx={{ 
'& .MuiListItemText-primary': {
                    fontSize: '0.8125rem',
                    color: location.pathname === '/visualizar-om' ? 'primary.main' : 'text.secondary',
                  } 
                }} 
              />
            )}
          </ListItemButton>
        </ListItem>
        )}
        
        {canAccessMaquinarios && (
        <ListItem disablePadding sx={{ display: 'block', mb: 0.5, px: effectiveOpen ? 0 : 0.5 }}>
          <ListItemButton
            onClick={() => handleNav('/maquinarios')}
            selected={location.pathname === '/maquinarios'}
            sx={{
              minHeight: 36,
              justifyContent: effectiveOpen ? 'initial' : 'center',
              px: effectiveOpen ? 1.5 : 0,
              py: 0.25,
              backgroundColor: location.pathname === '/maquinarios' 
                ? (effectiveOpen ? '#e3f2fd' : 'transparent')
                : 'transparent',
              color: location.pathname === '/maquinarios' 
                ? 'primary.main'
                : 'text.secondary',
              '&:hover': {
                '& > div': {
                  backgroundColor: !effectiveOpen ? '#e3f2fd' : undefined,
                },
                backgroundColor: effectiveOpen 
                  ? (location.pathname === '/maquinarios' ? '#e3f2fd' : 'action.hover')
                  : 'transparent',
              },
              borderRadius: 1.5,
              fontSize: '0.8125rem',
              position: 'relative',
              ...(effectiveOpen && {
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  right: 6,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: location.pathname === '/maquinarios' ? 'primary.main' : 'transparent',
                },
              }),
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: effectiveOpen ? 'flex-start' : 'center',
                width: effectiveOpen ? 'auto' : 36,
                height: 36,
                borderRadius: 1.5,
                backgroundColor: !effectiveOpen && location.pathname === '/maquinarios' ? '#e3f2fd' : 'transparent',
                boxSizing: 'content-box',
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: effectiveOpen ? 1.5 : 0,
                  justifyContent: 'center',
                  color: location.pathname === '/maquinarios' ? 'primary.main' : 'text.secondary',
                  '& svg': { fontSize: '1.125rem' },
                }}
              >
                <ConstructionIcon />
              </ListItemIcon>
            </Box>
            {effectiveOpen && (
              <ListItemText 
                primary="Maquinários" 
                sx={{ 
'& .MuiListItemText-primary': {
                    fontSize: '0.8125rem',
                    color: location.pathname === '/maquinarios' ? 'primary.main' : 'text.secondary',
                  } 
                }} 
              />
            )}
          </ListItemButton>
        </ListItem>
        )}
        
        {canAccessParadas && (
        <ListItem disablePadding sx={{ display: 'block', mb: 0.5, px: effectiveOpen ? 0 : 0.5 }}>
          <ListItemButton
            onClick={() => handleNav('/paradas')}
            selected={location.pathname === '/paradas'}
            sx={{
              minHeight: 36,
              justifyContent: effectiveOpen ? 'initial' : 'center',
              px: effectiveOpen ? 1.5 : 0,
              py: 0.25,
              backgroundColor: location.pathname === '/paradas' 
                ? (effectiveOpen ? '#e3f2fd' : 'transparent')
                : 'transparent',
              color: location.pathname === '/paradas' 
                ? 'primary.main'
                : 'text.secondary',
              '&:hover': {
                '& > div': {
                  backgroundColor: !effectiveOpen ? '#e3f2fd' : undefined,
                },
                backgroundColor: effectiveOpen 
                  ? (location.pathname === '/paradas' ? '#e3f2fd' : 'action.hover')
                  : 'transparent',
              },
              borderRadius: 1.5,
              fontSize: '0.8125rem',
              position: 'relative',
              ...(effectiveOpen && {
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  right: 6,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: location.pathname === '/paradas' ? 'primary.main' : 'transparent',
                },
              }),
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: effectiveOpen ? 'flex-start' : 'center',
                width: effectiveOpen ? 'auto' : 36,
                height: 36,
                borderRadius: 1.5,
                backgroundColor: !effectiveOpen && location.pathname === '/paradas' ? '#e3f2fd' : 'transparent',
                boxSizing: 'content-box',
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: effectiveOpen ? 1.5 : 0,
                  justifyContent: 'center',
                  color: location.pathname === '/paradas' ? 'primary.main' : 'text.secondary',
                  '& svg': { fontSize: '1.125rem' },
                }}
              >
                <PauseCircleIcon />
              </ListItemIcon>
            </Box>
            {effectiveOpen && (
              <ListItemText 
                primary="Paradas" 
                sx={{ 
'& .MuiListItemText-primary': {
                    fontSize: '0.8125rem',
                    color: location.pathname === '/paradas' ? 'primary.main' : 'text.secondary',
                  } 
                }} 
              />
            )}
          </ListItemButton>
        </ListItem>
        )}

        {/* Painel Administrativo - Gerente e Admin */}
        {canAccessAdmin && (
        <ListItem disablePadding sx={{ display: 'block', mb: 0.5, px: effectiveOpen ? 0 : 0.5 }}>
          <ListItemButton
            onClick={() => handleNav('/admin/permissoes')}
            selected={location.pathname === '/admin/permissoes'}
            sx={{
              minHeight: 36,
              justifyContent: effectiveOpen ? 'initial' : 'center',
              px: effectiveOpen ? 1.5 : 0,
              py: 0.25,
              backgroundColor: location.pathname === '/admin/permissoes' ? (effectiveOpen ? '#e3f2fd' : 'transparent') : 'transparent',
              color: location.pathname === '/admin/permissoes' ? 'primary.main' : 'text.secondary',
              '&:hover': {
                backgroundColor: effectiveOpen ? (location.pathname === '/admin/permissoes' ? '#e3f2fd' : 'action.hover') : 'transparent',
              },
              borderRadius: 1.5,
              fontSize: '0.8125rem',
              position: 'relative',
              ...(effectiveOpen && {
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  right: 6,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: location.pathname === '/admin/permissoes' ? 'primary.main' : 'transparent',
                },
              }),
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: effectiveOpen ? 'flex-start' : 'center', width: effectiveOpen ? 'auto' : 36, height: 36, borderRadius: 1.5, boxSizing: 'content-box' }}>
              <ListItemIcon sx={{ minWidth: 0, mr: effectiveOpen ? 1.5 : 0, justifyContent: 'center', color: location.pathname === '/admin/permissoes' ? 'primary.main' : 'text.secondary', '& svg': { fontSize: '1.25rem' } }}>
                <AdminPanelSettingsIcon />
              </ListItemIcon>
            </Box>
            {effectiveOpen && (
              <ListItemText
                primary="Painel Administrativo"
                sx={{ '& .MuiListItemText-primary': { fontSize: '0.8125rem', fontWeight: 500, color: location.pathname === '/admin/permissoes' ? 'primary.main' : 'text.secondary' } }}
              />
            )}
          </ListItemButton>
        </ListItem>
        )}

      </List>
      </Box>

      {/* Seção inferior fixa: Modo tema, Ajuda, usuário + Sair */}
      <Box
        sx={{
          flexShrink: 0,
          mt: 'auto',
          borderTop: 1,
          borderColor: 'divider',
          py: 0.75,
          px: effectiveOpen ? 1.5 : 0.5,
        }}
      >
        <List dense disablePadding sx={{ display: 'flex', flexDirection: 'column', alignItems: effectiveOpen ? 'stretch' : 'center' }}>
          {/* Modo Escuro/Claro */}
          <ListItem disablePadding sx={{ mb: 0.25 }}>
            <ListItemButton
              onClick={toggleTheme}
              sx={{
                minHeight: 36,
                justifyContent: effectiveOpen ? 'initial' : 'center',
                px: effectiveOpen ? 1.5 : 0,
                py: 0.25,
                borderRadius: 1.5,
                fontSize: '0.8125rem',
                color: 'text.secondary',
                '&:hover': { backgroundColor: 'action.hover' },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: effectiveOpen ? 1.5 : 0,
                  justifyContent: 'center',
                  color: 'text.secondary',
                  '& svg': { fontSize: '1.125rem' },
                }}
              >
                {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </ListItemIcon>
              {effectiveOpen && (
                <ListItemText
                  primary={mode === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
                  sx={{ '& .MuiListItemText-primary': { fontSize: '0.8125rem', color: 'text.secondary' } }}
                />
              )}
            </ListItemButton>
          </ListItem>
          {/* Ajuda */}
          <ListItem disablePadding sx={{ mb: 0.25 }}>
            <ListItemButton
              disabled
              sx={{
                minHeight: 36,
                justifyContent: effectiveOpen ? 'initial' : 'center',
                px: effectiveOpen ? 1.5 : 0,
                py: 0.25,
                borderRadius: 1.5,
                fontSize: '0.8125rem',
                color: 'text.secondary',
                '&.Mui-disabled': { color: 'text.secondary', opacity: 1 },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: effectiveOpen ? 1.5 : 0,
                  justifyContent: 'center',
                  color: 'text.secondary',
                  '& svg': { fontSize: '1.125rem' },
                }}
              >
                <HelpIcon />
              </ListItemIcon>
              {effectiveOpen && (
                <ListItemText
                  primary="Ajuda"
                  sx={{ '& .MuiListItemText-primary': { fontSize: '0.8125rem', color: 'text.secondary' } }}
                />
              )}
            </ListItemButton>
          </ListItem>
        </List>

        {user?.email && (
          <>
            <Divider sx={{ my: 0.75, mx: 0 }} />
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 0.5,
                px: 0.5,
                py: 0.5,
                minHeight: 40,
              }}
            >
            <Box
              component="button"
              onClick={() => handleNav('/perfil')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: effectiveOpen ? 1 : 0,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                padding: 0,
                minWidth: 0,
                flex: 1,
                overflow: 'hidden',
                justifyContent: effectiveOpen ? 'flex-start' : 'center',
                '&:hover': { opacity: 0.85 },
              }}
            >
              {!effectiveOpen && (
                <PersonIcon sx={{ color: 'text.secondary', fontSize: '1.25rem' }} />
              )}
              {effectiveOpen && (
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user.email}
                </Typography>
              )}
            </Box>
            <IconButton
              size="small"
              onClick={async () => {
                await signOut()
                navigate('/login', { replace: true })
              }}
              aria-label="Sair"
              sx={{
                color: 'text.secondary',
                flexShrink: 0,
                '&:hover': { backgroundColor: 'action.hover' },
              }}
            >
              <ExitToAppIcon sx={{ fontSize: '1.25rem' }} />
            </IconButton>
          </Box>
        </>
      )}
    </Box>
    </Box>
  )

  return (
    <>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileDrawerOpen}
          onClose={onMobileDrawerClose}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            width: drawerWidthExpanded,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidthExpanded,
              boxSizing: 'border-box',
              overflowX: 'hidden',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="persistent"
          open={true}
          sx={{
            width: open ? drawerWidthExpanded : drawerWidthCollapsed,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: open ? drawerWidthExpanded : drawerWidthCollapsed,
              boxSizing: 'border-box',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: 150,
              }),
              overflowX: 'hidden',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  )
}
