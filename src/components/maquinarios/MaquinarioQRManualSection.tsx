import { useRef, useCallback } from 'react'
import { Box, Paper, Typography, Button } from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import { QR } from 'react-qr-rounded'
import { getMaquinarioQRUrl } from '../../utils/maquinarioQR'

/** Tamanho do QR em px — compacto para impressão pequena. */
const QR_SIZE = 56

interface MaquinarioQRManualSectionProps {
  maquinarioId: string
  /** Tamanho do QR em pixels (compacto para impressão). */
  qrSize?: number
}

/**
 * Gera PNG do SVG do QR para download (tamanho fixo para impressão).
 */
function svgToPngDataUrl(svg: SVGElement, sizePx: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    canvas.width = sizePx
    canvas.height = sizePx
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      reject(new Error('Canvas 2d não disponível'))
      return
    }
    const svgString = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, sizePx, sizePx)
      ctx.drawImage(img, 0, 0, sizePx, sizePx)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Falha ao carregar SVG'))
    }
    img.src = url
  })
}

/**
 * Bloco reutilizável: QR Code do maquinário (módulos arredondados, tamanho compacto para impressão).
 */
export const MaquinarioQRManualSection = ({
  maquinarioId,
  qrSize = QR_SIZE,
}: MaquinarioQRManualSectionProps) => {
  const qrUrl = getMaquinarioQRUrl(maquinarioId)
  const qrContainerRef = useRef<HTMLDivElement>(null)

  const handleDownloadQR = useCallback(async () => {
    const svg = qrContainerRef.current?.querySelector('svg')
    if (!svg) return
    try {
      const dataUrl = await svgToPngDataUrl(svg, qrSize)
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `qr-maquinario-${maquinarioId}.png`
      a.click()
    } catch {
      // fallback silencioso
    }
  }, [maquinarioId, qrSize])

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: 560,
        mx: 'auto',
      }}
    >
      <Box sx={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
        <Box ref={qrContainerRef} sx={{ lineHeight: 0 }}>
          <QR
            width={qrSize}
            height={qrSize}
            rounding={100}
            color="#1a1a1a"
            backgroundColor="#ffffff"
            errorCorrectionLevel="M"
            role="img"
            aria-label="QR Code do maquinário"
          >
            {qrUrl}
          </QR>
        </Box>
        <Button
          size="small"
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadQR}
        >
          Baixar QR Code
        </Button>
      </Box>
      <Box
        sx={{
          flex: 1,
          minHeight: 140,
          width: '100%',
          minWidth: 0,
          border: '1px dashed',
          borderColor: 'divider',
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'action.hover',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Manual do Maquinário (PDF)
        </Typography>
      </Box>
    </Paper>
  )
}
