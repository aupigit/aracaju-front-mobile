import { format } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'

export function formatDate(date) {
  date = new Date(date.getTime())

  const timezoneOffset = date.getTimezoneOffset()
  const hoursOffset = String(
    Math.floor(Math.abs(timezoneOffset / 60)),
  ).padStart(2, '0')
  const minutesOffset = String(Math.abs(timezoneOffset % 60)).padStart(2, '0')
  const sign = timezoneOffset > 0 ? '-' : '+'

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}.${String(date.getMilliseconds())}99${sign}${hoursOffset}:${minutesOffset}`

  // TODO - Verificar se o timezoneOffset está correto
}

export function formatDateToDDMMYYYY(date: Date) {
  return format(date, 'dd/MM/yyyy HH:mm:ss')
}

export function formatDateToTimezone(date: Date) {
  const formattedDate = formatInTimeZone(
    date,
    'Etc/GMT',
    'yyyy-MM-dd HH:mm:ss.SSSXXX',
  )

  return formattedDate
}
