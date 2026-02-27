import { Link as RouterLink, useLocation } from 'react-router-dom'
import { Box, AppBar, Toolbar, Typography, Button } from '@mui/material'
import { GearLogo } from './GearLogo'

interface LayoutPublicProps {
  children: React.ReactNode
}

export const LayoutPublic = ({ children }: LayoutPublicProps) => {
  const location = useLocation()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <AppBar position="static" color="default" elevation={0} sx={{ backgroundColor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar sx={{ gap: 2 }}>
          <RouterLink to="/ocorrencias" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
            <GearLogo size={32} />
            <Typography variant="h6" sx={{ ml: 1, fontWeight: 700, color: 'primary.main' }}>
              TPM
            </Typography>
          </RouterLink>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            component={RouterLink}
            to="/ocorrencias"
            color={location.pathname === '/ocorrencias' ? 'primary' : 'inherit'}
            variant={location.pathname === '/ocorrencias' ? 'outlined' : 'text'}
            size="small"
          >
            Abrir OM
          </Button>
          <Button
            component={RouterLink}
            to="/buscar-om"
            color={location.pathname === '/buscar-om' ? 'primary' : 'inherit'}
            variant={location.pathname === '/buscar-om' ? 'outlined' : 'text'}
            size="small"
          >
            Buscar OM
          </Button>
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
