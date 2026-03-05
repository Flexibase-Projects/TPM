import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { CssBaseline, Box, CircularProgress } from '@mui/material'
import { ThemeContextProvider } from './contexts/ThemeContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { PermissionsProvider } from './contexts/PermissionsContext'
import { Layout } from './components/layout/Layout'
import { LayoutPublic } from './components/layout/LayoutPublic'
import { ProtectedRoute } from './components/routes/ProtectedRoute'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Maquinarios } from './pages/Maquinarios'
import { OcorrenciasManutencao } from './pages/OcorrenciasManutencao'
import { VisualizarOM } from './pages/VisualizarOM'
import { Paradas } from './pages/Paradas'
import { MinhasOMs } from './pages/MinhasOMs'
import { BuscarOM } from './pages/BuscarOM'
import { Permissoes } from './pages/admin/Permissoes'
import { Perfil } from './pages/Perfil'

function LoginRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'background.default' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return <Login />
}

/** Rotas da aplicação: público (Abrir OM / Buscar OM) ou área logada com Layout único. Evita desmontar Layout ao navegar para /ocorrencias ou /buscar-om. */
function AppRoutes() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const pathname = location.pathname

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'background.default' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!user) {
    if (pathname === '/ocorrencias') {
      return (
        <LayoutPublic>
          <OcorrenciasManutencao />
        </LayoutPublic>
      )
    }
    if (pathname === '/buscar-om') {
      return (
        <LayoutPublic>
          <BuscarOM />
        </LayoutPublic>
      )
    }
    return <Navigate to="/ocorrencias" replace />
  }

  return (
    <PermissionsProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<ProtectedRoute requireDashboardOrAdmin><Dashboard /></ProtectedRoute>} />
          <Route path="/minhas-oms" element={<ProtectedRoute><MinhasOMs /></ProtectedRoute>} />
          <Route path="/ocorrencias" element={<ProtectedRoute requireEquipeOrAbove><OcorrenciasManutencao /></ProtectedRoute>} />
          <Route path="/buscar-om" element={<ProtectedRoute requireEquipeOrAbove><BuscarOM /></ProtectedRoute>} />
          <Route path="/visualizar-om" element={<ProtectedRoute requireEquipeOrAbove><VisualizarOM /></ProtectedRoute>} />
          <Route path="/maquinarios" element={<ProtectedRoute requireEquipeOrAbove><Maquinarios /></ProtectedRoute>} />
          <Route path="/paradas" element={<ProtectedRoute requireEquipeOrAbove><Paradas /></ProtectedRoute>} />
          <Route path="/admin/permissoes" element={<ProtectedRoute requireDashboardOrAdmin><Permissoes /></ProtectedRoute>} />
          <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
        </Routes>
      </Layout>
    </PermissionsProvider>
  )
}

function App() {
  return (
    <ThemeContextProvider>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginRoute />} />
            <Route path="/*" element={<AppRoutes />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeContextProvider>
  )
}

export default App
