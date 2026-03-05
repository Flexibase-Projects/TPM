import { useState, useEffect, useRef } from 'react'
import { Box, CssBaseline, AppBar, Toolbar, IconButton, Typography, useTheme, useMediaQuery } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { Sidebar } from './Sidebar'
import { GearLogo } from './GearLogo'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const mountIdRef = useRef(Math.random().toString(36).slice(2, 9))
  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7525/ingest/b5c85d67-913e-453c-9948-d50deb840a1b', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '856500' }, body: JSON.stringify({ sessionId: '856500', location: 'Layout.tsx:mount', message: 'Layout mounted', data: { mountId: mountIdRef.current }, timestamp: Date.now(), hypothesisId: 'H2' }) }).catch(() => {})
  }, [])
  useEffect(() => {
    fetch('http://127.0.0.1:7525/ingest/b5c85d67-913e-453c-9948-d50deb840a1b', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '856500' }, body: JSON.stringify({ sessionId: '856500', location: 'Layout.tsx:state', message: 'Layout state', data: { sidebarOpen, mobileDrawerOpen }, timestamp: Date.now(), hypothesisId: 'H1' }) }).catch(() => {})
  }, [sidebarOpen, mobileDrawerOpen])
  // #endregion

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleMobileDrawerClose = () => {
    setMobileDrawerOpen(false)
  }

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
            p: { xs: 1.5, sm: 2 },
            backgroundColor: 'background.default',
            width: '100%',
            minWidth: 0,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  )
}
