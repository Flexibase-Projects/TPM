// Constantes do sistema TPM

export const APP_NAME = 'TPM - Controle de Maquinário'

/** Quantidade de itens por página nas listagens (Maquinários, Paradas, OMs, etc.) */
export const ROWS_PER_PAGE = 10

/** Dias antes do vencimento para considerar manutenção/limpeza "próxima do fim" (avisos em Minhas OM's) */
export const DIAS_AVISO_VENCIMENTO = 7

// Prefixo para todas as tabelas do banco de dados
export const TABLE_PREFIX = 'TPM_'

/**
 * Converte horas decimais para formato HH:MM
 * @param horasDecimais - Horas em formato decimal (ex: 7.5 = 7 horas e 30 minutos)
 * @returns String no formato "HH:MM"
 */
export const formatarHorasParaHHMM = (horasDecimais: number): string => {
  const horas = Math.floor(horasDecimais)
  const minutos = Math.round((horasDecimais - horas) * 60)
  
  // Se minutos chegam a 60, adicionar 1 hora e zerar minutos
  const horasFinais = horas + Math.floor(minutos / 60)
  const minutosFinais = minutos % 60
  
  return `${horasFinais.toString().padStart(2, '0')}:${minutosFinais.toString().padStart(2, '0')}`
}

/**
 * Converte formato HH:MM para horas decimais
 * @param horaHHMM - String no formato "HH:MM"
 * @returns Horas em formato decimal
 */
export const converterHHMMParaHoras = (horaHHMM: string): number => {
  const [horas, minutos] = horaHHMM.split(':').map(Number)
  return horas + minutos / 60
}