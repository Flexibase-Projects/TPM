import type { ChangeEvent, FormEvent } from 'react'
import { useState } from 'react'
import { Box, Stack } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { useLocation, useNavigate } from 'react-router-dom'
import { ThemeModeToggle } from '../components/common/ThemeModeToggle'
import { LoginAboutPanel } from '../components/login/LoginAboutPanel'
import { LoginFormPanel } from '../components/login/LoginFormPanel'
import { LoginHeroPanel } from '../components/login/LoginHeroPanel'
import { useAuth } from '../contexts/AuthContext'
import {
  clearRememberedEmail,
  getPostLoginRedirectPath,
  loadRememberedEmail,
  rememberEmail,
} from '../utils/loginPreferences'

export const Login = () => {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [initialRememberedEmail] = useState(loadRememberedEmail)

  const [email, setEmail] = useState(initialRememberedEmail)
  const [password, setPassword] = useState('')
  const [rememberUserEmail, setRememberUserEmail] = useState(Boolean(initialRememberedEmail))
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [activeView, setActiveView] = useState<'form' | 'about'>('form')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const trimmedEmail = email.trim()
      if (!trimmedEmail || !password) {
        setError('Informe e-mail e senha para entrar.')
        return
      }

      const { error: signInError } = await signIn(trimmedEmail, password)

      if (signInError) {
        setError(signInError.message ?? 'E-mail ou senha invalidos. Tente novamente.')
        return
      }

      if (rememberUserEmail) {
        rememberEmail(trimmedEmail)
      } else {
        clearRememberedEmail()
      }

      navigate(getPostLoginRedirectPath(location.state), { replace: true })
    } catch {
      setError('Erro ao entrar. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (error) {
      setError(null)
    }
    setEmail(event.target.value)
  }

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (error) {
      setError(null)
    }
    setPassword(event.target.value)
  }

  const handleRememberEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked
    setRememberUserEmail(checked)

    if (!checked) {
      clearRememberedEmail()
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: { xs: 'block', md: 'grid' },
        gridTemplateColumns: { md: 'minmax(0, 1fr) minmax(0, 1fr)' },
        backgroundColor: 'background.default',
        overflow: 'hidden',
      }}
    >
      <LoginHeroPanel />

      <Box
        sx={{
          position: 'relative',
          minHeight: { xs: 'auto', md: '100dvh' },
          backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#0f172a' : '#ffffff'),
          px: { xs: 2.5, sm: 3.5, md: 5.5 },
          py: { xs: 2.5, md: 3 },
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? `radial-gradient(circle at top right, ${alpha('#93c5fd', 0.14)}, transparent 26%)`
                : `radial-gradient(circle at top right, ${alpha('#3b82f6', 0.08)}, transparent 24%)`,
            pointerEvents: 'none',
          },
        }}
      >
        <Stack sx={{ position: 'relative', zIndex: 1, height: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: { xs: 3, md: 0 } }}>
            <ThemeModeToggle
              sx={{
                borderColor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? alpha('#dbe7ff', 0.12)
                    : alpha('#94a3b8', 0.35),
                backgroundColor: 'transparent',
                color: 'text.secondary',
                width: 38,
                height: 38,
              }}
            />
          </Box>

          <Box
            sx={{
              flex: 1,
              overflow: 'hidden',
              display: 'flex',
              alignItems: activeView === 'about' ? 'stretch' : 'center',
              justifyContent: 'center',
            }}
          >
            {activeView === 'about' ? (
              <LoginAboutPanel onBack={() => setActiveView('form')} />
            ) : (
              <LoginFormPanel
                email={email}
                password={password}
                rememberEmail={rememberUserEmail}
                error={error}
                submitting={submitting}
                onEmailChange={handleEmailChange}
                onPasswordChange={handlePasswordChange}
                onRememberEmailChange={handleRememberEmailChange}
                onOpenAbout={() => setActiveView('about')}
                onSubmit={handleSubmit}
              />
            )}
          </Box>
        </Stack>
      </Box>
    </Box>
  )
}
