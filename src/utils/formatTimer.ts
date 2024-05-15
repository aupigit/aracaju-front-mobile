export const formatTimer = (seconds: number) => {
  if (isNaN(seconds)) return 'Sincronizar Agora'

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes} minutos e ${remainingSeconds} segundos`
}
