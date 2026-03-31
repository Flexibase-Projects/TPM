const REMEMBERED_EMAIL_KEY = 'tpm-login-email'
const REMEMBERED_EMAIL_TTL_MS = 30 * 24 * 60 * 60 * 1000

interface RememberedEmailPayload {
  email: string
  expiresAt: string
}

interface RouteStateLike {
  from?: {
    pathname?: string
    search?: string
    hash?: string
  }
}

const isBrowser = () => typeof window !== 'undefined'

export const loadRememberedEmail = () => {
  if (!isBrowser()) {
    return ''
  }

  try {
    const rawValue = window.localStorage.getItem(REMEMBERED_EMAIL_KEY)
    if (!rawValue) {
      return ''
    }

    const payload = JSON.parse(rawValue) as Partial<RememberedEmailPayload>
    if (!payload.email || !payload.expiresAt) {
      window.localStorage.removeItem(REMEMBERED_EMAIL_KEY)
      return ''
    }

    const expiresAt = new Date(payload.expiresAt).getTime()
    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
      window.localStorage.removeItem(REMEMBERED_EMAIL_KEY)
      return ''
    }

    return payload.email
  } catch {
    window.localStorage.removeItem(REMEMBERED_EMAIL_KEY)
    return ''
  }
}

export const rememberEmail = (email: string) => {
  if (!isBrowser()) {
    return
  }

  const payload: RememberedEmailPayload = {
    email,
    expiresAt: new Date(Date.now() + REMEMBERED_EMAIL_TTL_MS).toISOString(),
  }

  window.localStorage.setItem(REMEMBERED_EMAIL_KEY, JSON.stringify(payload))
}

export const clearRememberedEmail = () => {
  if (!isBrowser()) {
    return
  }

  window.localStorage.removeItem(REMEMBERED_EMAIL_KEY)
}

export const getPostLoginRedirectPath = (state: unknown, fallbackPath = '/') => {
  const routeState = state as RouteStateLike | null
  const from = routeState?.from
  const pathname = from?.pathname

  if (!pathname || !pathname.startsWith('/') || pathname === '/login') {
    return fallbackPath
  }

  const search = from.search ?? ''
  const hash = from.hash ?? ''

  return `${pathname}${search}${hash}`
}
