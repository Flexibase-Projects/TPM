import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Divider,
  Stack,
  Typography,
} from '@mui/material'
import { loginAboutIntro, loginBrand, systemFaq, systemHighlights } from './content'

interface LoginAboutPanelProps {
  onBack: () => void
}

export const LoginAboutPanel = ({ onBack }: LoginAboutPanelProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxWidth: 560,
        width: '100%',
        mx: 'auto',
        overflow: 'hidden',
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="overline" sx={{ color: 'primary.main', letterSpacing: '0.18em' }}>
            {loginBrand.productName}
          </Typography>
          <Typography variant="h3" component="h2" sx={{ mt: 0.5 }}>
            O que e este sistema?
          </Typography>
        </Box>
        <Button
          onClick={onBack}
          startIcon={<ArrowBackRoundedIcon />}
          variant="text"
          sx={{ flexShrink: 0 }}
        >
          Voltar
        </Button>
      </Stack>

      <Box sx={{ overflowY: 'auto', pr: { md: 1 } }}>
        <Stack spacing={2.5}>
          <Typography variant="body1" color="text.secondary">
            {loginAboutIntro}
          </Typography>

          <Stack spacing={2}>
            {systemHighlights.map((highlight, index) => (
              <Box key={highlight.title}>
                <Typography variant="h6" sx={{ mb: 0.75 }}>
                  {highlight.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {highlight.description}
                </Typography>
                {index < systemHighlights.length - 1 && <Divider sx={{ mt: 2 }} />}
              </Box>
            ))}
          </Stack>

          <Box>
            <Typography variant="h5" sx={{ mb: 1.5 }}>
              Perguntas frequentes
            </Typography>
            <Stack spacing={1.25}>
              {systemFaq.map((faq) => (
                <Accordion
                  key={faq.question}
                  disableGutters
                  elevation={0}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: '16px !important',
                    overflow: 'hidden',
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                    <Typography sx={{ fontWeight: 600 }}>{faq.question}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary">
                      {faq.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Box>
  )
}
