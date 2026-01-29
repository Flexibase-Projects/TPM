import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import type { OcorrenciaManutencao, CategoriaOcorrencia } from '../../types/ocorrencia'

interface OcorrenciaCardProps {
  ocorrencia: OcorrenciaManutencao
  onEdit: (ocorrencia: OcorrenciaManutencao) => void
  onDelete: (id: string) => void
}

const getCategoriaColor = (categoria: CategoriaOcorrencia): string => {
  switch (categoria) {
    case 'Vermelho':
      return '#d32f2f'
    case 'Verde':
      return '#2e7d32'
    case 'Azul':
      return '#1976d2'
    default:
      return '#757575'
  }
}

const getCategoriaLabel = (categoria: CategoriaOcorrencia): string => {
  switch (categoria) {
    case 'Vermelho':
      return 'Time Técnico'
    case 'Verde':
      return 'Segurança'
    case 'Azul':
      return 'Operador'
    default:
      return categoria
  }
}

const getStatusColor = (status: string): 'default' | 'primary' | 'success' | 'warning' | 'error' => {
  switch (status) {
    case 'Aberta':
      return 'error'
    case 'Em Andamento':
      return 'warning'
    case 'Concluída':
      return 'success'
    case 'Cancelada':
      return 'default'
    default:
      return 'default'
  }
}

export const OcorrenciaCard = ({ ocorrencia, onEdit, onDelete }: OcorrenciaCardProps) => {
  const categoriaColor = getCategoriaColor(ocorrencia.categoria)
  const borderColor = categoriaColor

  return (
    <Card
      sx={{
        borderLeft: `4px solid ${borderColor}`,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Box>
            <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
              {ocorrencia.maquinario?.identificacao || 'Maquinário não encontrado'}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Operador: {ocorrencia.maquinario?.nome_operador || '-'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Editar">
              <IconButton
                size="small"
                onClick={() => onEdit(ocorrencia)}
                color="primary"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Excluir">
              <IconButton
                size="small"
                onClick={() => onDelete(ocorrencia.id)}
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ mb: 1.5 }}>
          <Typography variant="body2" sx={{ mb: 1, minHeight: 40 }}>
            {ocorrencia.descricao}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
          <Chip
            label={getCategoriaLabel(ocorrencia.categoria)}
            size="small"
            sx={{
              backgroundColor: categoriaColor,
              color: 'white',
              fontWeight: 600,
            }}
          />
          <Chip
            label={ocorrencia.status}
            size="small"
            color={getStatusColor(ocorrencia.status)}
          />
        </Box>

        <Box sx={{ mt: 1.5, pt: 1.5, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Data: {new Date(ocorrencia.data_ocorrencia).toLocaleDateString('pt-BR')}
          </Typography>
          {ocorrencia.responsavel && (
            <Typography variant="caption" color="text.secondary" display="block">
              Responsável: {ocorrencia.responsavel}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}
