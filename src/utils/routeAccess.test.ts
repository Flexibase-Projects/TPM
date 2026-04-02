import { describe, expect, it } from 'vitest'
import {
  isProtectedPath,
  isPublicMaquinarioPath,
  isPublicStandalonePath,
} from './routeAccess'

describe('routeAccess', () => {
  it('detects standalone public routes', () => {
    expect(isPublicStandalonePath('/ocorrencias')).toBe(true)
    expect(isPublicStandalonePath('/buscar-om')).toBe(true)
    expect(isPublicStandalonePath('/login')).toBe(false)
  })

  it('detects public maquinario QR routes', () => {
    expect(isPublicMaquinarioPath('/maquinario/123')).toBe(true)
    expect(isPublicMaquinarioPath('/maquinarios')).toBe(false)
  })

  it('detects protected routes and nested paths', () => {
    expect(isProtectedPath('/maquinarios')).toBe(true)
    expect(isProtectedPath('/maquinarios/123')).toBe(true)
    expect(isProtectedPath('/login')).toBe(false)
  })
})
