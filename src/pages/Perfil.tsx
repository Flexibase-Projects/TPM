import { Box, Typography } from '@mui/material'

export const Perfil = () => {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1, fontSize: '1.5rem', fontWeight: 600 }}>
        Perfil
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
        Página de perfil do usuário (em construção).
      </Typography>
    </Box>
  )
}
