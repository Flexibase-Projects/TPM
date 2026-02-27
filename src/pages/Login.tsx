import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material'
import { useAuth } from '../contexts/AuthContext'

export const Login = () => {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const { error: err } = await signIn(email.trim(), password)
      if (err) {
        setError(err.message ?? 'E-mail ou senha inválidos. Tente novamente.')
        return
      }
      navigate('/', { replace: true })
    } catch {
      setError('Erro ao entrar. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        p: 2,
      }}
    >
      <Paper
        elevation={2}
        sx={{
          p: 4,
          maxWidth: 400,
          width: '100%',
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 600, textAlign: 'center', mb: 3 }}>
          TPM – Entrar
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            sx={{ mb: 2 }}
          />
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{ mt: 1 }}
          >
            {submitting ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </Paper>
    </Box>
  )
}
