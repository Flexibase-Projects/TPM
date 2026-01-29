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
  // #region agent log
  if (typeof window !== 'undefined') {
    fetch('http://127.0.0.1:7247/ingest/d688d544-a3d8-45d0-aec4-1bbd8aaad8c9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:21',message:'App component rendered',data:{pathname:window.location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  }
  // #endregion
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
