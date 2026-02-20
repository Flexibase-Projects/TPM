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
import PersonIcon from '@mui/icons-material/Person'
import DashboardIcon from '@mui/icons-material/Dashboard'
import { GearLogo } from './GearLogo'

export const drawerWidthExpanded = 240
export const drawerWidthCollapsed = 64

interface SidebarProps {
  open: boolean
  onToggle: () => void
}

export const Sidebar = ({ open, onToggle }: SidebarProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const location = useLocation()
  const { mode, toggleTheme } = useThemeMode()

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
          px: open ? 2 : 1,
          py: 2,
          minHeight: { xs: 56, sm: 64 },
          gap: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: open ? 'space-between' : 'center',
            width: '100%',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.25,
              minWidth: 0,
            }}
          >
            <IconButton
              onClick={() => navigate('/')}
              aria-label="Início"
              sx={{
                color: 'primary.main',
                p: open ? 1.5 : 1,
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <GearLogo size={open ? 40 : 28} color="currentColor" />
            </IconButton>
            {open && (
              <Typography
                component="span"
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  letterSpacing: '0.02em',
                  fontSize: '0.95rem',
                }}
              >
                TPM
              </Typography>
            )}
          </Box>
          {open && (
            <IconButton 
              onClick={onToggle}
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
      {!open && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
          <IconButton 
            onClick={onToggle}
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
      {!open && <Divider />}
      <List
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: open ? 'stretch' : 'center',
          px: open ? 2 : 0,
        }}
      >
        {/* Dashboard */}
        <ListItem disablePadding sx={{ display: 'block', mb: 1, px: open ? 0 : 1 }}>
          <ListItemButton
            onClick={() => navigate('/')}
            selected={location.pathname === '/'}
            sx={{
              minHeight: 40,
              justifyContent: open ? 'initial' : 'center',
              px: open ? 2 : 0,
              py: open ? 0 : 0.5,
              backgroundColor: location.pathname === '/' 
                ? (open ? '#e3f2fd' : 'transparent')
                : 'transparent',
              color: location.pathname === '/' 
                ? 'primary.main'
                : 'text.secondary',
              '&:hover': {
                '& > div': {
                  backgroundColor: !open ? '#e3f2fd' : undefined,
                },
                backgroundColor: open 
                  ? (location.pathname === '/' ? '#e3f2fd' : 'action.hover')
                  : 'transparent',
              },
              borderRadius: 2,
              fontSize: '0.875rem',
              position: 'relative',
              ...(open && {
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  right: 8,
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
                justifyContent: open ? 'flex-start' : 'center',
                width: open ? 'auto' : 40,
                height: 40,
                borderRadius: 2,
                backgroundColor: !open && location.pathname === '/' ? '#e3f2fd' : 'transparent',
                boxSizing: 'content-box',
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 2 : 0,
                  justifyContent: 'center',
                  color: location.pathname === '/' ? 'primary.main' : 'text.secondary',
                  '& svg': {
                    fontSize: '1.25rem',
                  },
                }}
              >
                <DashboardIcon />
              </ListItemIcon>
            </Box>
            {open && (
              <ListItemText 
                primary="Dashboard" 
                sx={{ 
                  '& .MuiListItemText-primary': { 
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: location.pathname === '/' ? 'primary.main' : 'text.secondary',
                  } 
                }} 
              />
            )}
          </ListItemButton>
        </ListItem>

        {/* Seção de Perfil - MINHAS OM's */}
        <ListItem disablePadding sx={{ display: 'block', mb: 1, px: open ? 0 : 1 }}>
          <ListItemButton
            onClick={() => navigate('/minhas-oms')}
            selected={location.pathname === '/minhas-oms'}
            sx={{
              minHeight: 40,
              justifyContent: open ? 'initial' : 'center',
              px: open ? 2 : 0,
              py: open ? 0 : 0.5,
              backgroundColor: location.pathname === '/minhas-oms' 
                ? (open ? '#e3f2fd' : 'transparent')
                : 'transparent',
              color: location.pathname === '/minhas-oms' 
                ? 'primary.main'
                : 'text.secondary',
              '&:hover': {
                '& > div': {
                  backgroundColor: !open ? '#e3f2fd' : undefined,
                },
                backgroundColor: open 
                  ? (location.pathname === '/minhas-oms' ? '#e3f2fd' : 'action.hover')
                  : 'transparent',
              },
              borderRadius: 2,
              fontSize: '0.875rem',
              position: 'relative',
              ...(open && {
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  right: 8,
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
                justifyContent: open ? 'flex-start' : 'center',
                width: open ? 'auto' : 40,
                height: 40,
                borderRadius: 2,
                backgroundColor: !open && location.pathname === '/minhas-oms' ? '#e3f2fd' : 'transparent',
                boxSizing: 'content-box',
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 2 : 0,
                  justifyContent: 'center',
                  color: location.pathname === '/minhas-oms' ? 'primary.main' : 'text.secondary',
                  '& svg': {
                    fontSize: '1.25rem',
                  },
                }}
              >
                <PersonIcon />
              </ListItemIcon>
            </Box>
            {open && (
              <ListItemText 
                primary="MINHAS OM's" 
                sx={{ 
                  '& .MuiListItemText-primary': { 
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: location.pathname === '/minhas-oms' ? 'primary.main' : 'text.secondary',
                  } 
                }} 
              />
            )}
          </ListItemButton>
        </ListItem>

        {/* Categoria MANUTENÇÃO */}
        {open && (
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
        
        <ListItem disablePadding sx={{ display: 'block', mb: 0.5, px: open ? 0 : 1 }}>
          <ListItemButton
            onClick={() => navigate('/ocorrencias')}
            selected={location.pathname === '/ocorrencias'}
            sx={{
              minHeight: 40,
              justifyContent: open ? 'initial' : 'center',
              px: open ? 2 : 0,
              py: open ? 0 : 0.5,
              backgroundColor: location.pathname === '/ocorrencias' 
                ? (open ? '#e3f2fd' : 'transparent')
                : 'transparent',
              color: location.pathname === '/ocorrencias' 
                ? 'primary.main'
                : 'text.secondary',
              '&:hover': {
                '& > div': {
                  backgroundColor: !open ? '#e3f2fd' : undefined,
                },
                backgroundColor: open 
                  ? (location.pathname === '/ocorrencias' ? '#e3f2fd' : 'action.hover')
                  : 'transparent',
              },
              borderRadius: 2,
              fontWeight: 500,
              fontSize: '0.875rem',
              position: 'relative',
              ...(open && {
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  right: 8,
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
                justifyContent: open ? 'flex-start' : 'center',
                width: open ? 'auto' : 40,
                height: 40,
                borderRadius: 2,
                backgroundColor: !open && location.pathname === '/ocorrencias' ? '#e3f2fd' : 'transparent',
                boxSizing: 'content-box',
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 2 : 0,
                  justifyContent: 'center',
                  color: location.pathname === '/ocorrencias' ? 'primary.main' : 'text.secondary',
                  '& svg': {
                    fontSize: '1.25rem',
                  },
                }}
              >
                <BuildIcon />
              </ListItemIcon>
            </Box>
            {open && (
              <>
                <ListItemText 
                  primary="Abrir OM" 
                  sx={{ 
                    '& .MuiListItemText-primary': { 
                      fontSize: '0.875rem', 
                      fontWeight: 500,
                      color: location.pathname === '/ocorrencias' ? 'primary.main' : 'text.secondary',
                    } 
                  }} 
                />
              </>
            )}
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding sx={{ display: 'block', mb: 1, px: open ? 0 : 1 }}>
          <ListItemButton
            onClick={() => navigate('/visualizar-om')}
            selected={location.pathname === '/visualizar-om'}
            sx={{
              minHeight: 40,
              justifyContent: open ? 'initial' : 'center',
              px: open ? 2 : 0,
              py: open ? 0 : 0.5,
              backgroundColor: location.pathname === '/visualizar-om' 
                ? (open ? '#e3f2fd' : 'transparent')
                : 'transparent',
              color: location.pathname === '/visualizar-om' 
                ? 'primary.main'
                : 'text.secondary',
              '&:hover': {
                '& > div': {
                  backgroundColor: !open ? '#e3f2fd' : undefined,
                },
                backgroundColor: open 
                  ? (location.pathname === '/visualizar-om' ? '#e3f2fd' : 'action.hover')
                  : 'transparent',
              },
              borderRadius: 2,
              fontSize: '0.875rem',
              position: 'relative',
              ...(open && {
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  right: 8,
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
                justifyContent: open ? 'flex-start' : 'center',
                width: open ? 'auto' : 40,
                height: 40,
                borderRadius: 2,
                backgroundColor: !open && location.pathname === '/visualizar-om' ? '#e3f2fd' : 'transparent',
                boxSizing: 'content-box',
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 2 : 0,
                  justifyContent: 'center',
                  color: location.pathname === '/visualizar-om' ? 'primary.main' : 'text.secondary',
                  '& svg': {
                    fontSize: '1.25rem',
                  },
                }}
              >
                <ListAltIcon />
              </ListItemIcon>
            </Box>
            {open && (
              <ListItemText 
                primary="Visualizar OM" 
                sx={{ 
                  '& .MuiListItemText-primary': { 
                    fontSize: '0.875rem',
                    color: location.pathname === '/visualizar-om' ? 'primary.main' : 'text.secondary',
                  } 
                }} 
              />
            )}
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding sx={{ display: 'block', mb: 1, px: open ? 0 : 1 }}>
          <ListItemButton
            onClick={() => navigate('/maquinarios')}
            selected={location.pathname === '/maquinarios'}
            sx={{
              minHeight: 40,
              justifyContent: open ? 'initial' : 'center',
              px: open ? 2 : 0,
              py: open ? 0 : 0.5,
              backgroundColor: location.pathname === '/maquinarios' 
                ? (open ? '#e3f2fd' : 'transparent')
                : 'transparent',
              color: location.pathname === '/maquinarios' 
                ? 'primary.main'
                : 'text.secondary',
              '&:hover': {
                '& > div': {
                  backgroundColor: !open ? '#e3f2fd' : undefined,
                },
                backgroundColor: open 
                  ? (location.pathname === '/maquinarios' ? '#e3f2fd' : 'action.hover')
                  : 'transparent',
              },
              borderRadius: 2,
              fontSize: '0.875rem',
              position: 'relative',
              ...(open && {
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  right: 8,
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
                justifyContent: open ? 'flex-start' : 'center',
                width: open ? 'auto' : 40,
                height: 40,
                borderRadius: 2,
                backgroundColor: !open && location.pathname === '/maquinarios' ? '#e3f2fd' : 'transparent',
                boxSizing: 'content-box',
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 2 : 0,
                  justifyContent: 'center',
                  color: location.pathname === '/maquinarios' ? 'primary.main' : 'text.secondary',
                  '& svg': {
                    fontSize: '1.25rem',
                  },
                }}
              >
                <ConstructionIcon />
              </ListItemIcon>
            </Box>
            {open && (
              <ListItemText 
                primary="Maquinários" 
                sx={{ 
                  '& .MuiListItemText-primary': { 
                    fontSize: '0.875rem',
                    color: location.pathname === '/maquinarios' ? 'primary.main' : 'text.secondary',
                  } 
                }} 
              />
            )}
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding sx={{ display: 'block', mb: 1, px: open ? 0 : 1 }}>
          <ListItemButton
            onClick={() => navigate('/paradas')}
            selected={location.pathname === '/paradas'}
            sx={{
              minHeight: 40,
              justifyContent: open ? 'initial' : 'center',
              px: open ? 2 : 0,
              py: open ? 0 : 0.5,
              backgroundColor: location.pathname === '/paradas' 
                ? (open ? '#e3f2fd' : 'transparent')
                : 'transparent',
              color: location.pathname === '/paradas' 
                ? 'primary.main'
                : 'text.secondary',
              '&:hover': {
                '& > div': {
                  backgroundColor: !open ? '#e3f2fd' : undefined,
                },
                backgroundColor: open 
                  ? (location.pathname === '/paradas' ? '#e3f2fd' : 'action.hover')
                  : 'transparent',
              },
              borderRadius: 2,
              fontSize: '0.875rem',
              position: 'relative',
              ...(open && {
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  right: 8,
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
                justifyContent: open ? 'flex-start' : 'center',
                width: open ? 'auto' : 40,
                height: 40,
                borderRadius: 2,
                backgroundColor: !open && location.pathname === '/paradas' ? '#e3f2fd' : 'transparent',
                boxSizing: 'content-box',
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 2 : 0,
                  justifyContent: 'center',
                  color: location.pathname === '/paradas' ? 'primary.main' : 'text.secondary',
                  '& svg': {
                    fontSize: '1.25rem',
                  },
                }}
              >
                <PauseCircleIcon />
              </ListItemIcon>
            </Box>
            {open && (
              <ListItemText 
                primary="Paradas" 
                sx={{ 
                  '& .MuiListItemText-primary': { 
                    fontSize: '0.875rem',
                    color: location.pathname === '/paradas' ? 'primary.main' : 'text.secondary',
                  } 
                }} 
              />
            )}
          </ListItemButton>
        </ListItem>

      </List>
      
      {/* Seção inferior fixa */}
      <Box
        sx={{
          mt: 'auto',
          pb: 2,
          px: open ? 2 : 1,
        }}
      >
        {/* Modo Escuro/Claro */}
        <ListItem disablePadding sx={{ display: 'block', mb: 1 }}>
          <ListItemButton
            onClick={toggleTheme}
            sx={{
              minHeight: 40,
              justifyContent: open ? 'initial' : 'center',
              px: open ? 2 : 0,
              py: open ? 0 : 0.5,
              borderRadius: 2,
              fontSize: '0.875rem',
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: open ? 'flex-start' : 'center',
                width: open ? 'auto' : 40,
                height: 40,
                borderRadius: 2,
                boxSizing: 'content-box',
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 2 : 0,
                  justifyContent: 'center',
                  color: 'text.secondary',
                  '& svg': {
                    fontSize: '1.25rem',
                  },
                }}
              >
                {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </ListItemIcon>
            </Box>
            {open && (
              <ListItemText
                primary={mode === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
                sx={{
                  '& .MuiListItemText-primary': {
                    fontSize: '0.875rem',
                    color: 'text.secondary',
                  }
                }}
              />
            )}
          </ListItemButton>
        </ListItem>

        <Divider sx={{ my: 1, mx: open ? 2 : 1 }} />

        {/* Ajuda */}
        <ListItem disablePadding sx={{ display: 'block', mb: 1 }}>
          <ListItemButton
            sx={{
              minHeight: 40,
              justifyContent: open ? 'initial' : 'center',
              px: open ? 2 : 0,
              py: open ? 0 : 0.5,
              borderRadius: 2,
              fontSize: '0.875rem',
              color: 'text.secondary',
              '&.Mui-disabled': {
                color: 'text.secondary',
                opacity: 1,
              },
            }}
            disabled
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: open ? 'flex-start' : 'center',
                width: open ? 'auto' : 40,
                height: 40,
                borderRadius: 2,
                boxSizing: 'content-box',
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 2 : 0,
                  justifyContent: 'center',
                  color: 'text.secondary',
                  '& svg': {
                    fontSize: '1.25rem',
                  },
                  '.MuiListItemButton-root.Mui-disabled &': {
                    color: 'text.secondary',
                    opacity: 1,
                  },
                }}
              >
                <HelpIcon />
              </ListItemIcon>
            </Box>
            {open && (
              <ListItemText 
                primary="Ajuda" 
                sx={{ 
                  '& .MuiListItemText-primary': { 
                    fontSize: '0.875rem',
                    color: 'text.secondary',
                  } 
                }} 
              />
            )}
          </ListItemButton>
        </ListItem>

        {/* Sair */}
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            sx={{
              minHeight: 40,
              justifyContent: open ? 'initial' : 'center',
              px: open ? 2 : 0,
              py: open ? 0 : 0.5,
              borderRadius: 2,
              fontSize: '0.875rem',
              color: 'text.secondary',
              '&.Mui-disabled': {
                color: 'text.secondary',
                opacity: 1,
              },
            }}
            disabled
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: open ? 'flex-start' : 'center',
                width: open ? 'auto' : 40,
                height: 40,
                borderRadius: 2,
                boxSizing: 'content-box',
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 2 : 0,
                  justifyContent: 'center',
                  color: 'text.secondary',
                  '& svg': {
                    fontSize: '1.25rem',
                  },
                  '.MuiListItemButton-root.Mui-disabled &': {
                    color: 'text.secondary',
                    opacity: 1,
                  },
                }}
              >
                <ExitToAppIcon />
              </ListItemIcon>
            </Box>
            {open && (
              <ListItemText 
                primary="Sair" 
                sx={{ 
                  '& .MuiListItemText-primary': { 
                    fontSize: '0.875rem',
                    color: 'text.secondary',
                  } 
                }} 
              />
            )}
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  )

  return (
    <>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={true}
          onClose={onToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            width: open ? drawerWidthExpanded : drawerWidthCollapsed,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: open ? drawerWidthExpanded : drawerWidthCollapsed,
              boxSizing: 'border-box',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
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
                duration: theme.transitions.duration.enteringScreen,
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
