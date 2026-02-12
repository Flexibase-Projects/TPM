import { useState } from 'react'
import {
  Box,
  Typography,
  Alert,
  Paper,
  Button,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import { OcorrenciaFormDialog } from '../components/ocorrencias/OcorrenciaFormDialog'
import type { TipoOM } from '../types/ocorrencia'

export const OcorrenciasManutencao = () => {
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [selectedTipoOM, setSelectedTipoOM] = useState<TipoOM | null>(null)

  const handleCreate = (tipo: TipoOM) => {
    setSelectedTipoOM(tipo)
    setFormOpen(true)
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setSelectedTipoOM(null)
  }

  const handleFormSubmit = async () => {
    handleFormClose()
  }

  return (
    <Box sx={{ position: 'relative', minHeight: '100%', pb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 600, fontSize: '1.125rem', mb: 0.5 }}>
          Abrir Ordem de Manutenção
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
          Crie uma nova ordem de manutenção para registrar problemas ou realizar manutenções preventivas
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Seleção de Tipo de OM */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Paper
          sx={{
            p: 2.5,
            borderRadius: 2,
            backgroundColor: 'background.paper',
            maxWidth: 600,
            width: '100%',
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: '0.9375rem' }}>
            Selecione o tipo de Ordem de Manutenção
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => handleCreate('Corretiva')}
                sx={{
                  py: 1.5,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: 'none',
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                  <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600 }}>
                    CORRETIVA
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 400, opacity: 0.9 }}>
                    Para problemas que precisam ser corrigidos
                  </Typography>
                </Box>
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                fullWidth
                disabled
                sx={{
                  py: 1.5,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: 'none',
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                  <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600 }}>
                    PREVENTIVA
                  </Typography>
                  <Typography sx={{ fontSize: '0.6875rem', fontWeight: 400 }}>
                    (em desenvolvimento)
                  </Typography>
                </Box>
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Tutorial */}
      <Paper
        sx={{
          p: 3,
          borderRadius: 2,
          mb: 3,
          backgroundColor: 'background.paper',
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircleOutlineIcon sx={{ fontSize: '1.25rem' }} />
          Como abrir uma Ordem de Manutenção
        </Typography>
        <List sx={{ pl: 0 }}>
          <ListItem sx={{ pl: 0, py: 1 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Typography sx={{ fontWeight: 600, color: 'primary.main' }}>1</Typography>
            </ListItemIcon>
            <ListItemText
              primary="Selecione o tipo de OM"
              secondary="Escolha entre Corretiva (para problemas) ou Preventiva (para manutenções programadas)"
              primaryTypographyProps={{ sx: { fontSize: '0.875rem', fontWeight: 500 } }}
              secondaryTypographyProps={{ sx: { fontSize: '0.8125rem' } }}
            />
          </ListItem>
          <ListItem sx={{ pl: 0, py: 1 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Typography sx={{ fontWeight: 600, color: 'primary.main' }}>2</Typography>
            </ListItemIcon>
            <ListItemText
              primary="Preencha os dados da máquina"
              secondary="Selecione o maquinário afetado e o sistema preencherá automaticamente o operador responsável"
              primaryTypographyProps={{ sx: { fontSize: '0.875rem', fontWeight: 500 } }}
              secondaryTypographyProps={{ sx: { fontSize: '0.8125rem' } }}
            />
          </ListItem>
          <ListItem sx={{ pl: 0, py: 1 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Typography sx={{ fontWeight: 600, color: 'primary.main' }}>3</Typography>
            </ListItemIcon>
            <ListItemText
              primary="Defina a categoria e status"
              secondary="Escolha a categoria (Vermelho, Verde ou Azul) conforme a complexidade e urgência da manutenção"
              primaryTypographyProps={{ sx: { fontSize: '0.875rem', fontWeight: 500 } }}
              secondaryTypographyProps={{ sx: { fontSize: '0.8125rem' } }}
            />
          </ListItem>
          <ListItem sx={{ pl: 0, py: 1 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Typography sx={{ fontWeight: 600, color: 'primary.main' }}>4</Typography>
            </ListItemIcon>
            <ListItemText
              primary="Descreva o problema detalhadamente"
              secondary="Seja específico: inclua sintomas observados, condições em que ocorreu e qualquer informação relevante"
              primaryTypographyProps={{ sx: { fontSize: '0.875rem', fontWeight: 500 } }}
              secondaryTypographyProps={{ sx: { fontSize: '0.8125rem' } }}
            />
          </ListItem>
          <ListItem sx={{ pl: 0, py: 1 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Typography sx={{ fontWeight: 600, color: 'primary.main' }}>5</Typography>
            </ListItemIcon>
            <ListItemText
              primary="Confirme e salve"
              secondary="Revise todas as informações e clique em Salvar para criar a ordem de manutenção"
              primaryTypographyProps={{ sx: { fontSize: '0.875rem', fontWeight: 500 } }}
              secondaryTypographyProps={{ sx: { fontSize: '0.8125rem' } }}
            />
          </ListItem>
        </List>
      </Paper>

      {/* FAQ */}
      <Paper
        sx={{
          p: 3,
          borderRadius: 2,
          backgroundColor: 'background.paper',
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 1 }}>
          <HelpOutlineIcon sx={{ fontSize: '1.25rem' }} />
          Perguntas Frequentes
        </Typography>
        <Accordion sx={{ boxShadow: 'none', '&:before': { display: 'none' }, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2 }}>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
              Qual a diferença entre OM Corretiva e Preventiva?
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 2, pb: 2 }}>
            <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
              <strong>OM Corretiva:</strong> Utilizada quando há um problema real que precisa ser corrigido imediatamente. 
              É aberta quando uma máquina apresenta falha, defeito ou não está funcionando corretamente.
              <br /><br />
              <strong>OM Preventiva:</strong> Utilizada para manutenções programadas e preventivas, realizadas antes que 
              problemas ocorram. Ajuda a evitar falhas futuras e manter o equipamento em bom estado.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion sx={{ boxShadow: 'none', '&:before': { display: 'none' }, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2 }}>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
              O que significam as categorias Vermelho, Verde e Azul?
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 2, pb: 2 }}>
            <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
              <strong>Vermelho:</strong> Executado pelo time de Manutenção - Manutenção técnica e/ou direta no maquinário de alta complexidade.
              <br /><br />
              <strong>Verde:</strong> Executado pelo time de Manutenção - Manutenção de Risco à vida ou Segurança do Operador (mais urgente).
              <br /><br />
              <strong>Azul:</strong> Executada pelo Operador - Manutenção Rotineira ou de menor complexidade.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion sx={{ boxShadow: 'none', '&:before': { display: 'none' }, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2 }}>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
              Posso editar uma OM após criá-la?
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 2, pb: 2 }}>
            <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
              Sim, você pode editar uma OM a qualquer momento através da lista de ordens de manutenção. 
              No entanto, algumas informações podem ser bloqueadas dependendo do status atual da ordem.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion sx={{ boxShadow: 'none', '&:before': { display: 'none' }, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2 }}>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
              O que acontece quando uma OM é criada?
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 2, pb: 2 }}>
            <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
              Quando uma OM Corretiva é criada, o status da máquina automaticamente muda para "Em Manutenção". 
              Isso ajuda a rastrear quais equipamentos estão indisponíveis. Quando a OM é concluída, 
              o sistema calcula automaticamente o tempo de parada e atualiza o status da máquina.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Paper>

      <OcorrenciaFormDialog
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        ocorrencia={null}
        initialTipoOM={selectedTipoOM || undefined}
      />
    </Box>
  )
}
