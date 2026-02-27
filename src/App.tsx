import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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

function PublicOcorrenciasRoute() {
  return (
    <LayoutPublic>
      <OcorrenciasManutencao />
    </LayoutPublic>
  )
}

function PublicBuscarOMRoute() {
  return (
    <LayoutPublic>
      <BuscarOM />
    </LayoutPublic>
  )
}

function ProtectedAppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'background.default' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!user) {
    return <Navigate to="/ocorrencias" replace />
  }

  return (
    <PermissionsProvider>
      <Layout>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute requireDashboardOrAdmin>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/minhas-oms"
            element={
              <ProtectedRoute>
                <MinhasOMs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/visualizar-om"
            element={
              <ProtectedRoute requireEquipeOrAbove>
                <VisualizarOM />
              </ProtectedRoute>
            }
          />
          <Route
            path="/maquinarios"
            element={
              <ProtectedRoute requireEquipeOrAbove>
                <Maquinarios />
              </ProtectedRoute>
            }
          />
          <Route
            path="/paradas"
            element={
              <ProtectedRoute requireEquipeOrAbove>
                <Paradas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/permissoes"
            element={
              <ProtectedRoute requireDashboardOrAdmin>
                <Permissoes />
              </ProtectedRoute>
            }
          />
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
            <Route path="/ocorrencias" element={<PublicOcorrenciasRoute />} />
            <Route path="/buscar-om" element={<PublicBuscarOMRoute />} />
            <Route path="/*" element={<ProtectedAppRoutes />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeContextProvider>
  )
}

export default App
