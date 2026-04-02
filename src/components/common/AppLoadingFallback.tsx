import { Box, CircularProgress } from '@mui/material'

interface AppLoadingFallbackProps {
  minHeight?: string
}

export const AppLoadingFallback = ({
  minHeight = '100vh',
}: AppLoadingFallbackProps) => (
  <Box
    sx={{
      minHeight,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'background.default',
    }}
  >
    <CircularProgress />
  </Box>
)
