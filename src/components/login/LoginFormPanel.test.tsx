import { render, screen } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { LoginFormPanel } from './LoginFormPanel'

const renderLoginFormPanel = () =>
  render(
    <ThemeProvider theme={createTheme()}>
      <MemoryRouter>
        <LoginFormPanel
          email=""
          password=""
          rememberEmail={false}
          error={null}
          submitting={false}
          onEmailChange={vi.fn()}
          onPasswordChange={vi.fn()}
          onRememberEmailChange={vi.fn()}
          onOpenAbout={vi.fn()}
          onSubmit={vi.fn()}
        />
      </MemoryRouter>
    </ThemeProvider>
  )

describe('LoginFormPanel', () => {
  it('exibe o acesso publico para abrir ordem de manutencao', () => {
    renderLoginFormPanel()

    const openOmLink = screen.getByRole('link', { name: /abrir ordem de manutencao/i })

    expect(openOmLink).toBeInTheDocument()
    expect(openOmLink).toHaveAttribute('href', '/ocorrencias')
  })
})
