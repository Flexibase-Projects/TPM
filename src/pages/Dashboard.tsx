import { useState, useEffect } from 'react'
import {
  Typography,
  Box,
  Grid,
  Paper,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from '@mui/material'
import {
  PrecisionManufacturing,
  Build,
  Warning,
  CheckCircle,
  Schedule,
  TrendingUp,
  Engineering,
  AccessTime,
  People,
  Checklist,
  CleaningServices,
  AssignmentTurnedIn,
  Assignment,
} from '@mui/icons-material'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts'
import { getDashboardMetrics, type DashboardMetrics } from '../services/dashboardService'

export const Dashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const theme = useTheme()

  useEffect(() => {
    loadMetrics()
  }, [])

  const loadMetrics = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getDashboardMetrics()
      setMetrics(data)
    } catch (err: unknown) {
      console.error('Erro ao carregar métricas:', err)
      const raw =
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message ??
            (err as { error_description?: string })?.error_description ??
            String(err)
      const isNetworkError =
        raw.includes('Failed to fetch') || raw.includes('NetworkError')
      const message = isNetworkError
        ? 'Sem conexão com o servidor. Verifique a internet, o VITE_SUPABASE_URL no .env e se o projeto Supabase está ativo.'
        : raw
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  if (!metrics) {
    return null
  }

  const formatarHoras = (horas: number) => {
    const horasInt = Math.floor(horas)
    const minutos = Math.round((horas - horasInt) * 60)
    if (minutos === 0) return `${horasInt}h`
    return `${horasInt}h ${minutos}min`
  }

  const formatarDias = (horas: number) => {
    const dias = Math.floor(horas / 24)
    const horasRestantes = Math.floor(horas % 24)
    if (dias === 0) return formatarHoras(horas)
    if (horasRestantes === 0) return `${dias} dia${dias > 1 ? 's' : ''}`
    return `${dias} dia${dias > 1 ? 's' : ''} e ${horasRestantes}h`
  }

  const taxaPreventiva =
    metrics.totalOcorrencias > 0
      ? (metrics.ocorrenciasPreventivas / metrics.totalOcorrencias) * 100
      : 0

  return (
    <Box
      sx={{
        maxWidth: '1400px',
        mx: 'auto',
        p: { xs: 2, sm: 3 },
        backgroundColor: 'background.default',
        minHeight: '100%',
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
        Dashboard TPM
      </Typography>

      {/* 1. TOPO - KPIs Principais */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Taxa de Disponibilidade - Mais importante */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.palette.mode === 'dark' 
                  ? '0 4px 12px rgba(0, 0, 0, 0.4)' 
                  : '0 4px 12px rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Taxa de Disponibilidade
                </Typography>
                <TrendingUp
                  sx={{
                    fontSize: 28,
                    color:
                      metrics.taxaDisponibilidade >= 90
                        ? theme.palette.success.main
                        : metrics.taxaDisponibilidade >= 70
                          ? theme.palette.warning.main
                          : theme.palette.error.main,
                  }}
                />
              </Box>
              <Typography variant="h3" component="div" sx={{ fontWeight: 700, mb: 1.5 }}>
                {metrics.taxaDisponibilidade.toFixed(1)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={metrics.taxaDisponibilidade}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                }}
                color={
                  metrics.taxaDisponibilidade >= 90
                    ? 'success'
                    : metrics.taxaDisponibilidade >= 70
                      ? 'warning'
                      : 'error'
                }
              />
            </CardContent>
          </Card>
        </Grid>

        {/* OMs Abertas */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.palette.mode === 'dark' 
                  ? '0 4px 12px rgba(0, 0, 0, 0.4)' 
                  : '0 4px 12px rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  OMs Abertas
                </Typography>
                <Warning sx={{ fontSize: 28, color: theme.palette.warning.main }} />
              </Box>
              <Typography variant="h3" component="div" sx={{ fontWeight: 700, mb: 1 }}>
                {metrics.ocorrenciasAbertas}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                de {metrics.totalOcorrencias} total
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Horas Paradas */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.palette.mode === 'dark' 
                  ? '0 4px 12px rgba(0, 0, 0, 0.4)' 
                  : '0 4px 12px rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Horas Paradas
                </Typography>
                <Schedule sx={{ fontSize: 28, color: theme.palette.error.main }} />
              </Box>
              <Typography variant="h3" component="div" sx={{ fontWeight: 700, mb: 1 }}>
                {formatarHoras(metrics.horasParadasTotal)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {metrics.totalParadas} paradas registradas
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total de Maquinários */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.palette.mode === 'dark' 
                  ? '0 4px 12px rgba(0, 0, 0, 0.4)' 
                  : '0 4px 12px rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Total Maquinários
                </Typography>
                <PrecisionManufacturing sx={{ fontSize: 28, color: theme.palette.primary.main }} />
              </Box>
              <Typography variant="h3" component="div" sx={{ fontWeight: 700, mb: 1 }}>
                {metrics.totalMaquinarios}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {metrics.maquinariosCriticos} críticos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 2. SEGUNDA LINHA - Status e Distribuição */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Status dos Maquinários - Gráfico Pizza Melhorado */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
              Status dos Maquinários
            </Typography>
            {metrics.totalMaquinarios > 0 ? (
              <Box>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme.palette.mode === 'dark' ? '#1e293b' : '#ffffff',
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 8,
                        boxShadow: theme.palette.mode === 'dark' 
                          ? '0 4px 12px rgba(0, 0, 0, 0.4)' 
                          : '0 4px 12px rgba(0, 0, 0, 0.1)',
                      }}
                      formatter={(value: number | undefined) => [value ?? 0, 'Maquinários']}
                    />
                    <Pie
                      data={[
                        {
                          name: 'Disponíveis',
                          value: metrics.maquinariosDisponiveis,
                          color: theme.palette.success.main,
                        },
                        {
                          name: 'Em Manutenção',
                          value: metrics.maquinariosEmManutencao,
                          color: theme.palette.warning.main,
                        },
                        {
                          name: 'Desativados',
                          value: metrics.maquinariosDesativados,
                          color: theme.palette.error.main,
                        },
                        {
                          name: 'Inativos',
                          value: metrics.maquinariosInativos,
                          color: theme.palette.text.secondary,
                        },
                      ].filter((item) => item.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={70}
                      innerRadius={35}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'Disponíveis', value: metrics.maquinariosDisponiveis, color: theme.palette.success.main },
                        { name: 'Em Manutenção', value: metrics.maquinariosEmManutencao, color: theme.palette.warning.main },
                        { name: 'Desativados', value: metrics.maquinariosDesativados, color: theme.palette.error.main },
                        { name: 'Inativos', value: metrics.maquinariosInativos, color: theme.palette.text.secondary },
                      ]
                        .filter((item) => item.value > 0)
                        .map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke={theme.palette.background.paper} strokeWidth={2} />
                        ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5, mt: 2 }}>
                  {[
                    { label: 'Disponíveis', value: metrics.maquinariosDisponiveis, color: theme.palette.success.main, icon: CheckCircle },
                    { label: 'Em Manutenção', value: metrics.maquinariosEmManutencao, color: theme.palette.warning.main, icon: Build },
                    { label: 'Desativados', value: metrics.maquinariosDesativados, color: theme.palette.error.main, icon: Warning },
                    { label: 'Inativos', value: metrics.maquinariosInativos, color: theme.palette.text.secondary, icon: Engineering },
                  ]
                    .filter((item) => item.value > 0)
                    .map((item) => {
                      const Icon = item.icon
                      const percent = metrics.totalMaquinarios > 0 ? ((item.value / metrics.totalMaquinarios) * 100).toFixed(0) : 0
                      return (
                        <Box
                          key={item.label}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            p: 1,
                            borderRadius: 1,
                            backgroundColor: theme.palette.mode === 'dark' 
                              ? 'rgba(255, 255, 255, 0.03)' 
                              : 'rgba(0, 0, 0, 0.02)',
                          }}
                        >
                          <Icon sx={{ fontSize: 16, color: item.color }} />
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }}>
                              {item.label}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {item.value} ({percent}%)
                            </Typography>
                          </Box>
                        </Box>
                      )
                    })}
                </Box>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                Nenhum maquinário registrado
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Ocorrências por Mês - Gráfico de Área */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
              Ocorrências por Mês
            </Typography>
            {metrics.ocorrenciasPorMes && metrics.ocorrenciasPorMes.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart
                  data={metrics.ocorrenciasPorMes}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorCorretivas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.error.main} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={theme.palette.error.main} stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorPreventivas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                  <XAxis
                    dataKey="mes"
                    tick={{ fill: theme.palette.text.secondary, fontSize: 11 }}
                    stroke={theme.palette.divider}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: theme.palette.text.secondary, fontSize: 11 }}
                    stroke={theme.palette.divider}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme.palette.mode === 'dark' ? '#1e293b' : '#ffffff',
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8,
                      boxShadow: theme.palette.mode === 'dark' 
                        ? '0 4px 12px rgba(0, 0, 0, 0.4)' 
                        : '0 4px 12px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: 10 }}
                    iconType="circle"
                    iconSize={8}
                  />
                  <Area
                    type="monotone"
                    dataKey="corretivas"
                    stroke={theme.palette.error.main}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCorretivas)"
                    name="Corretivas"
                  />
                  <Area
                    type="monotone"
                    dataKey="preventivas"
                    stroke={theme.palette.success.main}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorPreventivas)"
                    name="Preventivas"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                Nenhuma ocorrência registrada
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* 3. TERCEIRA LINHA - Métricas e Tendências */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Tempo Médio de Resolução */}
        {metrics.tempoMedioResolucao > 0 && (
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccessTime sx={{ fontSize: 24, color: theme.palette.primary.main, mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Tempo Médio de Resolução
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.primary.main, mb: 1 }}>
                {formatarDias(metrics.tempoMedioResolucao)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Baseado em {metrics.ocorrenciasConcluidas} OMs concluídas
              </Typography>
            </Paper>
          </Grid>
        )}

        {/* Taxa Preventiva vs Corretiva */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
              Taxa Preventiva
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 2 }}>
              <Typography variant="h2" sx={{ fontWeight: 700, color: taxaPreventiva >= 70 ? theme.palette.success.main : theme.palette.warning.main }}>
                {taxaPreventiva.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                de {metrics.totalOcorrencias} total
              </Typography>
            </Box>
            <Box sx={{ mb: 1 }}>
              <LinearProgress
                variant="determinate"
                value={taxaPreventiva}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                }}
                color={taxaPreventiva >= 70 ? 'success' : 'warning'}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Preventivas
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {metrics.ocorrenciasPreventivas}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" color="text.secondary">
                  Corretivas
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {metrics.ocorrenciasCorretivas}
                </Typography>
              </Box>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Meta: &gt; 70% preventivas
            </Typography>
          </Paper>
        </Grid>

        {/* Distribuição por Status */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
              Ocorrências por Status
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {Object.entries(metrics.ocorrenciasPorStatus)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 4)
                .map(([status, quantidade]) => {
                  const percent = metrics.totalOcorrencias > 0 ? (quantidade / metrics.totalOcorrencias) * 100 : 0
                  const statusColors: Record<string, string> = {
                    concluído: theme.palette.success.main,
                    'em execução': theme.palette.info.main,
                    novo: theme.palette.grey[400],
                    'na fila': theme.palette.warning.main,
                    'em espera': theme.palette.warning.main,
                    cancelado: theme.palette.error.main,
                  }
                  const color = statusColors[status] || theme.palette.text.secondary

                  return (
                    <Box key={status}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ textTransform: 'capitalize', fontWeight: 500 }}>
                          {status}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {quantidade} ({percent.toFixed(0)}%)
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={percent}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: color,
                          },
                        }}
                      />
                    </Box>
                  )
                })}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* 4. INDICADORES DE MANUTENÇÃO PREVENTIVA */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
            Indicadores de Manutenção Preventiva
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Visão geral dos checklists, rotinas de limpeza e OMs preventivas
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 4px 12px rgba(0, 0, 0, 0.4)'
                  : '0 4px 12px rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Checklists de Manutenção
                </Typography>
                <Checklist sx={{ fontSize: 28, color: theme.palette.info.main }} />
              </Box>
              <Typography variant="h3" component="div" sx={{ fontWeight: 700, mb: 1 }}>
                {metrics.totalChecklistsManutencao}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {metrics.maquinariosComChecklistManutencao} maquinário{metrics.maquinariosComChecklistManutencao !== 1 ? 's' : ''}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 4px 12px rgba(0, 0, 0, 0.4)'
                  : '0 4px 12px rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Rotinas de Limpeza
                </Typography>
                <CleaningServices sx={{ fontSize: 28, color: theme.palette.success.main }} />
              </Box>
              <Typography variant="h3" component="div" sx={{ fontWeight: 700, mb: 1 }}>
                {metrics.totalRotinasLimpeza}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {metrics.maquinariosComChecklistLimpeza} maquinário{metrics.maquinariosComChecklistLimpeza !== 1 ? 's' : ''}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 4px 12px rgba(0, 0, 0, 0.4)'
                  : '0 4px 12px rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  OMs Preventivas Abertas
                </Typography>
                <Assignment sx={{ fontSize: 28, color: theme.palette.warning.main }} />
              </Box>
              <Typography variant="h3" component="div" sx={{ fontWeight: 700, mb: 1 }}>
                {metrics.omsPreventivasAbertas}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                de {metrics.ocorrenciasPreventivas} total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 4px 12px rgba(0, 0, 0, 0.4)'
                  : '0 4px 12px rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  OMs Preventivas Concluídas
                </Typography>
                <AssignmentTurnedIn sx={{ fontSize: 28, color: theme.palette.success.main }} />
              </Box>
              <Typography variant="h3" component="div" sx={{ fontWeight: 700, mb: 1 }}>
                {metrics.omsPreventivasConcluidas}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                concluídas com sucesso
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 5. QUINTA LINHA - Score de Problemas dos Maquinários */}
      {metrics.scoreProblemasMaquinarios && metrics.scoreProblemasMaquinarios.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 2.5, fontWeight: 600 }}>
                Score de Problemas dos Maquinários
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Análise combinada de paradas e ocorrências para identificar maquinários que requerem atenção ou substituição
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Maquinário</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>
                        Score
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        Paradas
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        Horas Paradas
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        Ocorrências
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        OMs Abertas
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>
                        Categoria
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {metrics.scoreProblemasMaquinarios.slice(0, 10).map((item, index) => {
                      const maxScore = Math.max(...metrics.scoreProblemasMaquinarios.map((m) => m.score))
                      const scorePercent = maxScore > 0 ? (item.score / maxScore) * 100 : 0
                      const scoreColor =
                        scorePercent >= 70
                          ? theme.palette.error.main
                          : scorePercent >= 40
                            ? theme.palette.warning.main
                            : theme.palette.success.main

                      return (
                        <TableRow key={index} hover>
                          <TableCell sx={{ fontWeight: 500 }}>{item.maquinario}</TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                              <Box
                                sx={{
                                  width: 60,
                                  height: 60,
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: `3px solid ${scoreColor}`,
                                  backgroundColor: theme.palette.mode === 'dark' 
                                    ? 'rgba(0, 0, 0, 0.2)' 
                                    : 'rgba(0, 0, 0, 0.02)',
                                }}
                              >
                                <Typography variant="body2" sx={{ fontWeight: 700, color: scoreColor }}>
                                  {item.score.toFixed(1)}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="right">{item.totalParadas}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 500 }}>
                            {formatarHoras(item.horasParadas)}
                          </TableCell>
                          <TableCell align="right">{item.totalOcorrencias}</TableCell>
                          <TableCell align="right">
                            {item.ocorrenciasAbertas > 0 ? (
                              <Chip
                                label={item.ocorrenciasAbertas}
                                size="small"
                                variant="outlined"
                                color="warning"
                                sx={{ fontWeight: 500 }}
                              />
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                {item.ocorrenciasAbertas}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={item.categoria}
                              size="small"
                              variant="outlined"
                              color={item.categoria === 'Crítica' ? 'error' : 'default'}
                              sx={{ fontWeight: 500 }}
                            />
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* 5. DESEMPENHO DOS FUNCIONÁRIOS */}
      {metrics.desempenhoFuncionarios && metrics.desempenhoFuncionarios.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                <People sx={{ fontSize: 24, color: theme.palette.primary.main }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Desempenho da Equipe
                </Typography>
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
                    Mais OMs Atendidas
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Funcionário</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            Total OMs
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            Concluídas
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {metrics.desempenhoFuncionarios.slice(0, 5).map((item, index) => (
                          <TableRow key={index} hover>
                            <TableCell sx={{ fontWeight: 500 }}>{item.funcionario}</TableCell>
                            <TableCell align="right">{item.totalOcorrencias}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 500 }}>
                              {item.ocorrenciasConcluidas}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
                    Tempo Médio de Resolução
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Funcionário</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            Tempo Médio
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            OMs Concluídas
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {metrics.desempenhoFuncionarios
                          .filter((f) => f.tempoMedioResolucao > 0)
                          .sort((a, b) => a.tempoMedioResolucao - b.tempoMedioResolucao)
                          .slice(0, 5)
                          .map((item, index) => (
                            <TableRow key={index} hover>
                              <TableCell sx={{ fontWeight: 500 }}>{item.funcionario}</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 500 }}>
                                {formatarDias(item.tempoMedioResolucao)}
                              </TableCell>
                              <TableCell align="right">{item.ocorrenciasConcluidas}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* 6. SEXTA LINHA - Análises Detalhadas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Ocorrências por Categoria - Gráfico de Barras Horizontais */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2.5, fontWeight: 600 }}>
              Ocorrências por Categoria
            </Typography>
            {Object.keys(metrics.ocorrenciasPorCategoria).length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  layout="vertical"
                  data={Object.entries(metrics.ocorrenciasPorCategoria).map(([categoria, quantidade]) => ({
                    categoria,
                    quantidade,
                    color:
                      categoria === 'Vermelho'
                        ? theme.palette.error.main
                        : categoria === 'Verde'
                          ? theme.palette.success.main
                          : theme.palette.info.main,
                  }))}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} horizontal={false} />
                  <XAxis type="number" tick={{ fill: theme.palette.text.secondary, fontSize: 11 }} stroke={theme.palette.divider} />
                  <YAxis
                    dataKey="categoria"
                    type="category"
                    tick={{ fill: theme.palette.text.secondary, fontSize: 11 }}
                    stroke={theme.palette.divider}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme.palette.mode === 'dark' ? '#1e293b' : '#ffffff',
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="quantidade" radius={[0, 4, 4, 0]}>
                    {Object.entries(metrics.ocorrenciasPorCategoria).map(([categoria], index) => {
                      const color =
                        categoria === 'Vermelho'
                          ? theme.palette.error.main
                          : categoria === 'Verde'
                            ? theme.palette.success.main
                            : theme.palette.info.main
                      return <Cell key={`cell-${index}`} fill={color} />
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                Nenhuma ocorrência registrada
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Top Motivos de Parada - Gráfico de Barras Horizontais */}
        {metrics.paradasPorMotivo.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 2.5, fontWeight: 600 }}>
                Principais Motivos de Parada
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  layout="vertical"
                  data={metrics.paradasPorMotivo.slice(0, 5).map((item) => ({
                    ...item,
                    motivo: item.motivo.length > 20 ? item.motivo.substring(0, 20) + '...' : item.motivo,
                  }))}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} horizontal={false} />
                  <XAxis type="number" tick={{ fill: theme.palette.text.secondary, fontSize: 11 }} stroke={theme.palette.divider} />
                  <YAxis
                    dataKey="motivo"
                    type="category"
                    tick={{ fill: theme.palette.text.secondary, fontSize: 11 }}
                    stroke={theme.palette.divider}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme.palette.mode === 'dark' ? '#1e293b' : '#ffffff',
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8,
                    }}
                    formatter={(value: number | undefined) => [formatarHoras(value ?? 0), 'Horas']}
                  />
                  <Bar dataKey="horas" fill={theme.palette.primary.main} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Principais Motivos de Parada */}
      {metrics.paradasPorMotivo.length > 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 2.5, fontWeight: 600 }}>
                Principais Motivos de Parada
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Motivo</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        Quantidade
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        Total de Horas
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        % do Total
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {metrics.paradasPorMotivo.map((item, index) => {
                      const percentual =
                        metrics.horasParadasTotal > 0
                          ? (item.horas / metrics.horasParadasTotal) * 100
                          : 0
                      return (
                        <TableRow key={index} hover>
                          <TableCell>{item.motivo}</TableCell>
                          <TableCell align="right">{item.quantidade}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 500 }}>
                            {formatarHoras(item.horas)}
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: 'flex-end' }}>
                              <LinearProgress
                                variant="determinate"
                                value={percentual}
                                sx={{
                                  flex: 1,
                                  maxWidth: 100,
                                  height: 6,
                                  borderRadius: 3,
                                  backgroundColor: theme.palette.mode === 'dark' 
                                    ? 'rgba(255, 255, 255, 0.1)' 
                                    : 'rgba(0, 0, 0, 0.08)',
                                }}
                                color="primary"
                              />
                              <Typography variant="body2" sx={{ minWidth: 45, fontWeight: 500 }}>
                                {percentual.toFixed(1)}%
      </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  )
}
