import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  Link,
} from '@mui/material'
import BuildCircleIcon from '@mui/icons-material/BuildCircle'
import LoginIcon from '@mui/icons-material/Login'
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
          px: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
        }}
      >
        <GearLogo size={36} />
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
          TPM
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          py: 4,
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}
        >
          Sistema TPM
        </Typography>
        <Typography
          variant="body1"
          sx={{ maxWidth: 480, mb: 4, color: 'text.secondary', lineHeight: 1.6 }}
        >
          Bem-vindo ao sistema de Manutenção Produtiva Total. Aqui você pode abrir
          ordens de manutenção ou acessar o painel completo após conectar-se.
        </Typography>

        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<BuildCircleIcon />}
          onClick={() => navigate('/ocorrencias')}
          sx={{ mb: 3, px: 3, py: 1.5 }}
        >
          Abrir Ordem de Manutenção
        </Button>

        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
          Já possui acesso?
        </Typography>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate('/login')}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          Conectar ao sistema
          <LoginIcon sx={{ fontSize: 20 }} />
        </Link>
      </Box>
    </Box>
  )
}
