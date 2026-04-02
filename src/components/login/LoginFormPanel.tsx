import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import type { ChangeEvent, FormEvent } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { publicEntryPoints } from '../../utils/publicNavigation'

interface LoginFormPanelProps {
  email: string
  password: string
  rememberEmail: boolean
  error: string | null
  submitting: boolean
  onEmailChange: (event: ChangeEvent<HTMLInputElement>) => void
  onPasswordChange: (event: ChangeEvent<HTMLInputElement>) => void
  onRememberEmailChange: (event: ChangeEvent<HTMLInputElement>) => void
  onOpenAbout: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export const LoginFormPanel = ({
  email,
  password,
  rememberEmail,
  error,
  submitting,
  onEmailChange,
  onPasswordChange,
  onRememberEmailChange,
  onOpenAbout,
  onSubmit,
}: LoginFormPanelProps) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const openOmEntryPoint = publicEntryPoints.find((entryPoint) => entryPoint.to === '/ocorrencias')

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        width: '100%',
        maxWidth: 400,
        mx: 'auto',
      }}
    >
      <Stack spacing={3.25} alignItems="center">
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h3" component="h2" sx={{ mb: 0.75, fontSize: '2rem', fontWeight: 700 }}>
            Bem-vindo(a)
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Acesse sua conta para continuar
          </Typography>
        </Box>

        <Box component="form" onSubmit={onSubmit} noValidate sx={{ width: '100%' }}>
          <Stack spacing={2.1}>
            <TextField
              fullWidth
              label="E-mail"
              type="email"
              name="email"
              value={email}
              onChange={onEmailChange}
              required
              autoComplete="username"
              spellCheck={false}
              placeholder="voce@flexibase.com.br"
              autoFocus
              sx={{
                '& .MuiInputLabel-root': {
                  color: isDark ? alpha('#dbe7ff', 0.68) : alpha('#0f172a', 0.58),
                  fontSize: '0.84rem',
                },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.75,
                  minHeight: 52,
                  color: isDark ? '#f8fafc' : '#0f172a',
                  backgroundColor: isDark ? alpha('#111c35', 0.6) : '#ffffff',
                  '& fieldset': {
                    borderColor: isDark ? alpha('#cbd5e1', 0.18) : alpha('#94a3b8', 0.42),
                  },
                  '&:hover fieldset': {
                    borderColor: isDark ? alpha('#bfdbfe', 0.36) : alpha('#64748b', 0.56),
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: isDark ? '#7fb3ff' : '#3b82f6',
                  },
                },
              }}
            />
            <TextField
              fullWidth
              label="Senha"
              type="password"
              name="password"
              value={password}
              onChange={onPasswordChange}
              required
              autoComplete="current-password"
              sx={{
                '& .MuiInputLabel-root': {
                  color: isDark ? alpha('#dbe7ff', 0.68) : alpha('#0f172a', 0.58),
                  fontSize: '0.84rem',
                },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.75,
                  minHeight: 52,
                  color: isDark ? '#f8fafc' : '#0f172a',
                  backgroundColor: isDark ? alpha('#111c35', 0.6) : '#ffffff',
                  '& fieldset': {
                    borderColor: isDark ? alpha('#cbd5e1', 0.18) : alpha('#94a3b8', 0.42),
                  },
                  '&:hover fieldset': {
                    borderColor: isDark ? alpha('#bfdbfe', 0.36) : alpha('#64748b', 0.56),
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: isDark ? '#7fb3ff' : '#3b82f6',
                  },
                },
              }}
            />

            {error && (
              <Alert
                severity="error"
                sx={{
                  borderRadius: 1.75,
                  backgroundColor: isDark ? alpha('#7f1d1d', 0.28) : alpha('#fee2e2', 0.72),
                }}
              >
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={submitting}
              startIcon={!submitting ? <LockOutlinedIcon /> : undefined}
              sx={{
                minHeight: 44,
                borderRadius: 1.75,
                backgroundColor: isDark ? '#67a4ff' : '#3467e8',
                color: isDark ? '#07111f' : '#ffffff',
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: isDark ? '#84b5ff' : '#2557d9',
                  boxShadow: 'none',
                },
                '&.Mui-disabled': {
                  backgroundColor: isDark ? alpha('#67a4ff', 0.42) : alpha('#3467e8', 0.42),
                  color: isDark ? alpha('#07111f', 0.72) : alpha('#ffffff', 0.72),
                },
              }}
            >
              {submitting ? 'Acessando...' : 'Acessar sistema'}
            </Button>

            {openOmEntryPoint ? (
              <Button
                component={RouterLink}
                to={openOmEntryPoint.to}
                variant="outlined"
                size="large"
                fullWidth
                endIcon={<OpenInNewRoundedIcon fontSize="small" />}
                sx={{
                  minHeight: 42,
                  borderRadius: 1.5,
                  textTransform: 'none',
                  borderColor: isDark ? alpha('#93c5fd', 0.28) : alpha('#3467e8', 0.28),
                  color: isDark ? '#dbe7ff' : '#1d4ed8',
                  backgroundColor: isDark ? alpha('#0f172a', 0.22) : '#ffffff',
                  touchAction: 'manipulation',
                  '&:hover': {
                    borderColor: isDark ? alpha('#93c5fd', 0.46) : alpha('#3467e8', 0.44),
                    backgroundColor: isDark ? alpha('#13203a', 0.72) : alpha('#eff6ff', 0.92),
                  },
                }}
              >
                Abrir Ordem de Manutencao
              </Button>
            ) : null}

            <FormControlLabel
              sx={{
                alignSelf: 'center',
                m: 0,
                '& .MuiFormControlLabel-label': {
                  fontSize: '0.96rem',
                  color: 'text.secondary',
                },
              }}
              control={
                <Checkbox
                  checked={rememberEmail}
                  onChange={onRememberEmailChange}
                  name="rememberEmail"
                  sx={{
                    color: isDark ? alpha('#93c5fd', 0.8) : '#3467e8',
                    '&.Mui-checked': {
                      color: isDark ? '#67a4ff' : '#3467e8',
                    },
                  }}
                />
              }
              label="Manter conectado por 30d"
            />

            <Link
              component="button"
              type="button"
              underline="none"
              color="text.secondary"
              onClick={onOpenAbout}
              sx={{
                alignSelf: 'center',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                fontWeight: 500,
              }}
            >
              <InfoOutlinedIcon sx={{ fontSize: 18 }} />
              O que e este sistema?
            </Link>
          </Stack>
        </Box>
      </Stack>
    </Box>
  )
}
