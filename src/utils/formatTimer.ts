export const formatTimer = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes} minutos e ${remainingSeconds} segundos`
}
