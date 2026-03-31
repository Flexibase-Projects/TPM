import { useNavigate } from 'react-router-dom'
import { Box, Typography, Button, Stack } from '@mui/material'
import BuildCircleIcon from '@mui/icons-material/BuildCircle'
import LoginIcon from '@mui/icons-material/Login'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import { ThemeModeToggle } from '../components/common/ThemeModeToggle'
import { GearLogo } from '../components/layout/GearLogo'

export const InicioTPM = () => {
  const navigate = useNavigate()

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.default',
      }}
    >
      <Box
        sx={{
          py: 2,
          px: { xs: 2, sm: 3 },
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GearLogo size={36} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
            TPM
          </Typography>
        </Box>
        <ThemeModeToggle />
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          py: 4,
        }}
      >
        <Stack spacing={3} sx={{ width: '100%', maxWidth: 620, textAlign: 'center' }}>
          <Box>
            <Typography variant="overline" sx={{ color: 'primary.main', letterSpacing: '0.18em' }}>
              Flexibase
            </Typography>
            <Typography
              variant="h3"
              component="h1"
              sx={{ fontWeight: 700, color: 'text.primary', mt: 0.5, mb: 1.5 }}
            >
              Sistema TPM para operacao e manutencao
            </Typography>
            <Typography
              variant="body1"
              sx={{ maxWidth: 520, mx: 'auto', color: 'text.secondary', lineHeight: 1.7 }}
            >
              Abra ordens de manutencao, consulte OMs publicas e acesse os modulos protegidos do TPM com o mesmo fluxo visual do login.
            </Typography>
          </Box>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            justifyContent="center"
            alignItems="stretch"
          >
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<LoginIcon />}
              onClick={() => navigate('/login')}
              sx={{ px: 3, py: 1.5 }}
            >
              Entrar no sistema
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              startIcon={<BuildCircleIcon />}
              onClick={() => navigate('/ocorrencias')}
              sx={{ px: 3, py: 1.5 }}
            >
              Abrir Ordem de Manutencao
            </Button>
            <Button
              variant="text"
              color="inherit"
              size="large"
              startIcon={<SearchRoundedIcon />}
              onClick={() => navigate('/buscar-om')}
              sx={{ px: 2.5, py: 1.5 }}
            >
              Buscar OM
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  )
}
