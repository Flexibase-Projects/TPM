import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import dayjs from 'dayjs'
import type { Maquinario } from '../types/maquinario'

const formatarMoeda = (valor: number): string =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

/**
 * Gera e faz download do PDF do relatório completo de maquinários.
 * Inclui: tabela de todos os maquinários (Identificação, Área, Valor),
 * totais por área e total geral da indústria.
 */
export function gerarRelatorioMaquinariosPdf(maquinarios: Maquinario[]): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const margin = 14
  let y = margin

  // Cabeçalho
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Relatório completo de maquinários', margin, y)
  y += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(
    `Gerado em ${dayjs().format('DD/MM/YYYY [às] HH:mm')}`,
    margin,
    y
  )
  y += 12

  // Ordenar maquinários por área
  const maquinariosOrdenados =
    maquinarios.length > 0
      ? [...maquinarios].sort((a, b) =>
          (a.area?.nome ?? '').localeCompare(b.area?.nome ?? '')
        )
      : []

  // Tabela principal: Identificação, Área, Valor (classificada por área)
  const tableHead = [['Identificação', 'Área', 'Valor (R$)']]
  const tableBody: string[][] =
    maquinariosOrdenados.length > 0
      ? maquinariosOrdenados.map((m) => {
          const identificacao =
            m.nome?.trim() ? `${m.nome.trim()} - ${m.identificacao}` : m.identificacao
          const area = m.area?.nome ?? '-'
          const valor =
            m.valor_maquinario != null && Number(m.valor_maquinario) > 0
              ? formatarMoeda(Number(m.valor_maquinario))
              : '-'
          return [identificacao, area, valor]
        })
      : [['Nenhum maquinário cadastrado', '-', '-']]

  autoTable(doc, {
    startY: y,
    head: tableHead,
    body: tableBody,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [66, 66, 66], textColor: 255, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 50 },
      2: { cellWidth: 38, halign: 'right' },
    },
    margin: { left: margin, right: margin },
  })

  const lastTable = (doc as { lastAutoTable?: { finalY: number } }).lastAutoTable
  y = (lastTable?.finalY ?? y) + 10

  // Nova página apenas para totais (Total por área + Total da indústria na mesma página)
  doc.addPage()
  y = margin

  const porArea = new Map<string, number>()
  for (const m of maquinarios) {
    const nomeArea = m.area?.nome ?? 'Sem área'
    const val = Number(m.valor_maquinario) || 0
    porArea.set(nomeArea, (porArea.get(nomeArea) ?? 0) + val)
  }

  const areaEntries = Array.from(porArea.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  )

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Total por área', margin, y)
  y += 7

  if (areaEntries.length > 0) {
    const bodyArea = areaEntries.map(([area, total]) => [
      area,
      formatarMoeda(total),
    ])
    autoTable(doc, {
      startY: y,
      head: [['Área', 'Total (R$)']],
      body: bodyArea,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [90, 90, 90], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { halign: 'right', cellWidth: 45 },
      },
      margin: { left: margin, right: margin },
    })
    const lastAreaTable = (doc as { lastAutoTable?: { finalY: number } }).lastAutoTable
    y = (lastAreaTable?.finalY ?? y) + 10
  } else {
    y += 5
  }

  const totalGeral = maquinarios.reduce(
    (acc, m) => acc + (Number(m.valor_maquinario) || 0),
    0
  )

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Total da indústria', margin, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)
  doc.text(formatarMoeda(totalGeral), margin, y)

  const fileName = `relatorio-maquinarios-${dayjs().format('YYYY-MM-DD-HHmm')}.pdf`
  doc.save(fileName)
}
