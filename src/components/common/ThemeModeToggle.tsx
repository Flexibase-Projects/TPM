import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded'
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded'
import { IconButton, Tooltip } from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'
import { useThemeMode } from '../../contexts/ThemeContext'

interface ThemeModeToggleProps {
  sx?: SxProps<Theme>
}

export const ThemeModeToggle = ({ sx }: ThemeModeToggleProps) => {
  const { mode, toggleTheme } = useThemeMode()
  const actionLabel = mode === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'

  const baseSx: SxProps<Theme> = {
    border: 1,
    borderColor: 'divider',
    backgroundColor: 'background.paper',
    color: 'text.primary',
    boxShadow: (theme) =>
      theme.palette.mode === 'dark'
        ? '0 8px 24px rgba(15, 23, 42, 0.45)'
        : '0 8px 24px rgba(15, 23, 42, 0.12)',
    '&:hover': {
      backgroundColor: 'action.hover',
    },
  }
  const mergedSx: SxProps<Theme> = Array.isArray(sx) ? [baseSx, ...sx] : sx ? [baseSx, sx] : baseSx

  return (
    <Tooltip title={actionLabel}>
      <IconButton
        onClick={toggleTheme}
        aria-label={actionLabel}
        sx={mergedSx}
      >
        {mode === 'dark' ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
      </IconButton>
    </Tooltip>
  )
}
