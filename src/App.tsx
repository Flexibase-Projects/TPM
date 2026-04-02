import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { CssBaseline } from '@mui/material'
import { ThemeContextProvider } from './contexts/ThemeContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { PermissionsProvider } from './contexts/PermissionsContext'
import { Layout } from './components/layout/Layout'
import { LayoutPublic } from './components/layout/LayoutPublic'
import { ProtectedRoute } from './components/routes/ProtectedRoute'
import { AppLoadingFallback } from './components/common/AppLoadingFallback'
import { getPostLoginRedirectPath } from './utils/loginPreferences'
import {
  isProtectedPath,
  isPublicMaquinarioPath,
  isPublicStandalonePath,
} from './utils/routeAccess'

const Login = lazy(async () => ({ default: (await import('./pages/Login')).Login }))
const Dashboard = lazy(async () => ({ default: (await import('./pages/Dashboard')).Dashboard }))
const Maquinarios = lazy(async () => ({ default: (await import('./pages/Maquinarios')).Maquinarios }))
const OcorrenciasManutencao = lazy(
  async () => ({ default: (await import('./pages/OcorrenciasManutencao')).OcorrenciasManutencao })
)
const VisualizarOM = lazy(
  async () => ({ default: (await import('./pages/VisualizarOM')).VisualizarOM })
)
const Paradas = lazy(async () => ({ default: (await import('./pages/Paradas')).Paradas }))
const MinhasOMs = lazy(async () => ({ default: (await import('./pages/MinhasOMs')).MinhasOMs }))
const BuscarOM = lazy(async () => ({ default: (await import('./pages/BuscarOM')).BuscarOM }))
const Permissoes = lazy(
  async () => ({ default: (await import('./pages/admin/Permissoes')).Permissoes })
)
const Perfil = lazy(async () => ({ default: (await import('./pages/Perfil')).Perfil }))
const MaquinarioQRPage = lazy(
  async () => ({ default: (await import('./pages/MaquinarioQRPage')).MaquinarioQRPage })
)

function LoginRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <AppLoadingFallback />
  }

  if (user) {
    return <Navigate to={getPostLoginRedirectPath(location.state)} replace />
  }

  return <Login />
}

/** Rotas da aplicação: público (Abrir OM / Buscar OM) ou área logada com Layout único. Evita desmontar Layout ao navegar para /ocorrencias ou /buscar-om. */
function AppRoutes() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const pathname = location.pathname

  if (loading) {
    return <AppLoadingFallback />
  }

  if (!user) {
    if (pathname === '/') {
      return <Navigate to="/login" replace />
    }
    if (pathname === '/ocorrencias' && isPublicStandalonePath(pathname)) {
      return (
        <LayoutPublic>
          <OcorrenciasManutencao />
        </LayoutPublic>
      )
    }
    if (pathname === '/buscar-om' && isPublicStandalonePath(pathname)) {
      return (
        <LayoutPublic>
          <BuscarOM />
        </LayoutPublic>
      )
    }
    if (isPublicMaquinarioPath(pathname)) {
      return <MaquinarioQRPage />
    }
    if (isProtectedPath(pathname)) {
      return <Navigate to="/login" state={{ from: location }} replace />
    }
    return <Navigate to="/login" replace />
  }

  return (
    <PermissionsProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<ProtectedRoute requireDashboardOrAdmin><Dashboard /></ProtectedRoute>} />
          <Route path="/minhas-oms" element={<ProtectedRoute><MinhasOMs /></ProtectedRoute>} />
          <Route path="/ocorrencias" element={<ProtectedRoute><OcorrenciasManutencao /></ProtectedRoute>} />
          <Route path="/buscar-om" element={<ProtectedRoute requireEquipeOrAbove><BuscarOM /></ProtectedRoute>} />
          <Route path="/visualizar-om" element={<ProtectedRoute requireEquipeOrAbove><VisualizarOM /></ProtectedRoute>} />
          <Route path="/maquinarios" element={<ProtectedRoute requireEquipeOrAbove><Maquinarios /></ProtectedRoute>} />
          <Route path="/paradas" element={<ProtectedRoute requireEquipeOrAbove><Paradas /></ProtectedRoute>} />
          <Route path="/admin/permissoes" element={<ProtectedRoute requireDashboardOrAdmin><Permissoes /></ProtectedRoute>} />
          <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
          <Route path="/maquinario/:id" element={<ProtectedRoute><MaquinarioQRPage /></ProtectedRoute>} />
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
          <Suspense fallback={<AppLoadingFallback />}>
            <Routes>
              <Route path="/login" element={<LoginRoute />} />
              <Route path="/*" element={<AppRoutes />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeContextProvider>
  )
}

export default App
