import { useState } from 'react'
import { Box, CssBaseline, AppBar, Toolbar, IconButton, Typography, useTheme, useMediaQuery } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { Sidebar, drawerWidthExpanded, drawerWidthCollapsed } from './Sidebar'
import { GearLogo } from './GearLogo'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleMobileDrawerClose = () => {
    setMobileDrawerOpen(false)
  }

  const mainWidth = isMobile
    ? '100%'
    : `calc(100% - ${sidebarOpen ? drawerWidthExpanded : drawerWidthCollapsed}px)`

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <CssBaseline />
      <Sidebar
        open={sidebarOpen}
        onToggle={handleSidebarToggle}
        mobileDrawerOpen={mobileDrawerOpen}
        onMobileDrawerClose={handleMobileDrawerClose}
        isMobile={isMobile}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0 }}>
        {isMobile && (
          <AppBar
            position="sticky"
            color="default"
            elevation={0}
            sx={{
              zIndex: theme.zIndex.drawer - 1,
              backgroundColor: 'background.paper',
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Toolbar sx={{ minHeight: 48 }}>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="Abrir menu"
                onClick={() => setMobileDrawerOpen(true)}
                sx={{ mr: 1, color: 'text.primary' }}
              >
                <MenuIcon />
              </IconButton>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <GearLogo size={24} color={theme.palette.primary.main} />
                <Typography variant="h6" component="span" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                  TPM
                </Typography>
              </Box>
            </Toolbar>
          </AppBar>
        )}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 2,
            backgroundColor: 'background.default',
            width: mainWidth,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  )
}
