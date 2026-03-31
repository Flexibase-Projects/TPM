import type { ReactNode } from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { Box, AppBar, Toolbar, Typography, Button } from '@mui/material'
import { ThemeModeToggle } from '../common/ThemeModeToggle'
import { publicEntryPoints } from '../../utils/publicNavigation'
import { GearLogo } from './GearLogo'

interface LayoutPublicProps {
  children: ReactNode
}

export const LayoutPublic = ({ children }: LayoutPublicProps) => {
  const location = useLocation()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <AppBar position="static" color="default" elevation={0} sx={{ backgroundColor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar sx={{ gap: 1.5, flexWrap: { xs: 'wrap', sm: 'nowrap' }, py: { xs: 1, sm: 0 } }}>
          <RouterLink to="/login" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
            <GearLogo size={32} />
            <Typography variant="h6" sx={{ ml: 1, fontWeight: 700, color: 'primary.main' }}>
              TPM
            </Typography>
          </RouterLink>
          <Box sx={{ flexGrow: 1 }} />
          {publicEntryPoints.map((entryPoint) => (
            <Button
              key={entryPoint.to}
              component={RouterLink}
              to={entryPoint.to}
              color={location.pathname === entryPoint.to ? 'primary' : 'inherit'}
              variant={location.pathname === entryPoint.to ? 'outlined' : 'text'}
              size="small"
            >
              {entryPoint.label}
            </Button>
          ))}
          <ThemeModeToggle
            sx={{
              ml: { xs: 'auto', sm: 0 },
              width: 40,
              height: 40,
            }}
          />
          <Button
            component={RouterLink}
            to="/login"
            variant="contained"
            color="primary"
            size="small"
          >
            Entrar
          </Button>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flexGrow: 1, p: 2 }}>
        {children}
      </Box>
    </Box>
  )
}
