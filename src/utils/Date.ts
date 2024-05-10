import { format, formatISO } from 'date-fns'

export function formatDate(date: Date) {
  return formatISO(date, { representation: 'complete' })
}

export function formatDateToDDMMYYYY(date: Date) {
  return format(date, 'dd/MM/yyyy HH:mm:ss')
}
