import { format } from 'date-fns'

export function formatDate(date) {
  // Subtrai 3 horas por conta do backend online
  date = new Date(date.getTime())

  const timezoneOffset = date.getTimezoneOffset()
  const hoursOffset = String(
    Math.floor(Math.abs(timezoneOffset / 60)),
  ).padStart(2, '0')
  const minutesOffset = String(Math.abs(timezoneOffset % 60)).padStart(2, '0')
  const sign = timezoneOffset > 0 ? '-' : '+'

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}.${String(date.getMilliseconds()).padStart(3, '0')}00${sign}${hoursOffset}:${minutesOffset}`
}

export function formatDateToDDMMYYYY(date: Date) {
  return format(date, 'dd/MM/yyyy HH:mm:ss')
}
