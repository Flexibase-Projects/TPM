import { useState } from 'react'
import { Box, CssBaseline } from '@mui/material'
import { Sidebar, drawerWidthExpanded, drawerWidthCollapsed } from './Sidebar'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <CssBaseline />
      <Sidebar open={sidebarOpen} onToggle={handleSidebarToggle} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          backgroundColor: 'background.default',
          width: { 
            md: `calc(100% - ${sidebarOpen ? drawerWidthExpanded : drawerWidthCollapsed}px)` 
          },
          transition: (theme) =>
            theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
