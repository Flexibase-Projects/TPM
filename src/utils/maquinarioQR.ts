/**
 * Gera a URL absoluta da página de detalhes do maquinário por QR code.
 * O QR é sempre o mesmo para um maquinário: o link persiste porque depende apenas do id
 * (ex.: /maquinario/{id}). Não é necessário salvar imagem no banco; ao exibir ou baixar
 * o QR nesta página, ele sempre aponta para este maquinário.
 */
export function getMaquinarioQRUrl(maquinarioId: string): string {
  if (typeof window === 'undefined') {
    return ''
  }
  const base = window.location.origin
  return `${base}/maquinario/${maquinarioId}`
}
