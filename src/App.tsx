import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CssBaseline } from '@mui/material'
import { ThemeContextProvider } from './contexts/ThemeContext'
import { Layout } from './components/layout/Layout'
import { Dashboard } from './pages/Dashboard'
import { Maquinarios } from './pages/Maquinarios'
import { OcorrenciasManutencao } from './pages/OcorrenciasManutencao'
import { VisualizarOM } from './pages/VisualizarOM'
import { Paradas } from './pages/Paradas'
import { MinhasOMs } from './pages/MinhasOMs'

function App() {
  return (
    <ThemeContextProvider>
      <CssBaseline />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/ocorrencias" element={<OcorrenciasManutencao />} />
            <Route path="/visualizar-om" element={<VisualizarOM />} />
            <Route path="/minhas-oms" element={<MinhasOMs />} />
            <Route path="/maquinarios" element={<Maquinarios />} />
            <Route path="/paradas" element={<Paradas />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeContextProvider>
  )
}

export default App
