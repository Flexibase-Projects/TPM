const PROTECTED_PATHS = [
  '/minhas-oms',
  '/visualizar-om',
  '/maquinarios',
  '/paradas',
  '/admin/permissoes',
  '/perfil',
] as const

export const isPublicStandalonePath = (pathname: string): boolean =>
  pathname === '/ocorrencias' || pathname === '/buscar-om'

export const isPublicMaquinarioPath = (pathname: string): boolean =>
  pathname.startsWith('/maquinario/')

export const isProtectedPath = (pathname: string): boolean =>
  PROTECTED_PATHS.some(
    (protectedPath) => pathname === protectedPath || pathname.startsWith(`${protectedPath}/`)
  )
