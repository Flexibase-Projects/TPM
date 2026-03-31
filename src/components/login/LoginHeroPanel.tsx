import { Box, Chip, Stack, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { heroChips, loginHero } from './content'

export const LoginHeroPanel = () => {
  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        minHeight: { xs: 260, md: '100dvh' },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <Box
        component="img"
        src={loginHero.imageSrc}
        alt={loginHero.imageAlt}
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: { xs: loginHero.imagePosition.mobile, md: loginHero.imagePosition.desktop },
          filter: 'grayscale(100%) contrast(1.02) brightness(0.52) saturate(0.75) blur(1.2px)',
          transform: 'scale(1.02)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? `linear-gradient(180deg, ${alpha('#06101f', 0.88)} 0%, ${alpha('#0b1528', 0.92)} 100%)`
              : `linear-gradient(180deg, ${alpha('#2563eb', 0.54)} 0%, ${alpha('#3b82f6', 0.84)} 100%)`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'radial-gradient(circle at 50% 0%, rgba(148, 197, 255, 0.08), transparent 36%), radial-gradient(circle at 12% 100%, rgba(59, 130, 246, 0.16), transparent 28%)'
              : 'radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.24), transparent 34%), radial-gradient(circle at 16% 100%, rgba(255, 255, 255, 0.18), transparent 28%)',
        }}
      />
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 620,
          px: { xs: 3, sm: 4, md: 6 },
          color: 'common.white',
          textAlign: 'center',
        }}
      >
        <Stack spacing={3} sx={{ alignItems: 'center' }}>
          <Box>
            <Typography
              component="h1"
              variant="h2"
              sx={{
                fontSize: { xs: '2.2rem', md: '3rem' },
                lineHeight: 1.05,
                fontWeight: 700,
                mb: 1.5,
              }}
            >
              {loginHero.title}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: alpha('#ffffff', 0.82),
                fontSize: { xs: '1rem', md: '1.05rem' },
                lineHeight: 1.75,
                maxWidth: 520,
                mx: 'auto',
              }}
            >
              {loginHero.description}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" justifyContent="center">
            {heroChips.map((chip) => (
              <Chip
                key={chip}
                label={chip}
                sx={{
                  color: 'common.white',
                  height: 34,
                  borderRadius: '999px',
                  borderWidth: '1.5px',
                  backgroundColor: alpha('#ffffff', 0.08),
                  borderColor: alpha('#ffffff', 0.26),
                  backdropFilter: 'blur(8px)',
                  boxShadow: `inset 0 1px 0 ${alpha('#ffffff', 0.08)}`,
                  '& .MuiChip-label': {
                    px: 1.5,
                    fontSize: '0.88rem',
                    fontWeight: 600,
                  },
                }}
                variant="outlined"
              />
            ))}
          </Stack>
        </Stack>
      </Box>
    </Box>
  )
}
