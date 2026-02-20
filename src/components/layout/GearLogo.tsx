import { Box } from '@mui/material'

/** URL da logo de duas engrenagens (em public). */
export const LOGO_GEARS_IMAGE = '/logo-gears.png'

interface GearLogoProps {
  size?: number
  color?: string
  /** Quando definido, usa a imagem em vez do SVG (ex.: duas engrenagens). */
  imageSrc?: string
  /** Aplicar filtro azul na imagem (default true quando imageSrc está definido). */
  blueFilter?: boolean
  sx?: object
}

/**
 * Filtro CSS para deixar a imagem da logo em azul (tonalidade primary).
 * Funciona bem em ícones com fundo escuro.
 */
const blueImageFilter =
  'invert(28%) sepia(95%) saturate(2500%) hue-rotate(206deg) brightness(98%) contrast(95%)'

/**
 * Logo: imagem de duas engrenagens (azul) ou SVG de engrenagem única.
 */
export const GearLogo = ({
  size = 40,
  color = 'currentColor',
  imageSrc = LOGO_GEARS_IMAGE,
  blueFilter = true,
  sx,
}: GearLogoProps) => {
  if (imageSrc) {
    return (
      <Box
        component="img"
        src={imageSrc}
        alt=""
        width={size}
        height={size}
        loading="eager"
        decoding="async"
        sx={{
          display: 'block',
          objectFit: 'contain',
          ...(blueFilter && {
            filter: blueImageFilter,
          }),
          ...sx,
        }}
        aria-hidden
      />
    )
  }

  // Fallback: SVG de engrenagem única (não usado quando imageSrc está definido)
  const cx = 12
  const cy = 12
  const outerR = 9.5
  const innerR = 5.6
  const holeR = 3
  const teeth = 8
  const step = (2 * Math.PI) / teeth
  const start = -Math.PI / 2
  const toothHalf = (15 * Math.PI) / 180
  const valleyHalf = step / 4

  const segments: string[] = []
  for (let i = 0; i < teeth; i++) {
    const aValleyStart = start + i * step - valleyHalf
    const aToothStart = start + i * step - toothHalf
    const aToothEnd = start + i * step + toothHalf
    const aValleyEnd = start + i * step + valleyHalf

    const xValleyStart = cx + innerR * Math.cos(aValleyStart)
    const yValleyStart = cy + innerR * Math.sin(aValleyStart)
    const xToothStart = cx + outerR * Math.cos(aToothStart)
    const yToothStart = cy + outerR * Math.sin(aToothStart)
    const xToothEnd = cx + outerR * Math.cos(aToothEnd)
    const yToothEnd = cy + outerR * Math.sin(aToothEnd)
    const xValleyEnd = cx + innerR * Math.cos(aValleyEnd)
    const yValleyEnd = cy + innerR * Math.sin(aValleyEnd)

    segments.push(
      `M ${xValleyStart.toFixed(3)},${yValleyStart.toFixed(3)}`,
      `L ${xToothStart.toFixed(3)},${yToothStart.toFixed(3)}`,
      `A ${outerR},${outerR} 0 0 1 ${xToothEnd.toFixed(3)},${yToothEnd.toFixed(3)}`,
      `L ${xValleyEnd.toFixed(3)},${yValleyEnd.toFixed(3)}`,
      `A ${innerR},${innerR} 0 0 1 ${(cx + innerR * Math.cos(start + (i + 1) * step - valleyHalf)).toFixed(3)},${(cy + innerR * Math.sin(start + (i + 1) * step - valleyHalf)).toFixed(3)}`
    )
  }

  const gearPath = segments.join(' ')
  const hole = `M ${cx + holeR},${cy} A ${holeR},${holeR} 0 1 1 ${(cx - holeR).toFixed(3)},${cy} A ${holeR},${holeR} 0 1 1 ${cx + holeR},${cy}`

  return (
    <Box
      component="svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={color}
      fillRule="evenodd"
      sx={{
        display: 'block',
        ...sx,
      }}
      aria-hidden
    >
      <path d={`${gearPath} ${hole}`} />
    </Box>
  )
}
