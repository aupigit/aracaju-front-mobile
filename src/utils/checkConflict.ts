import calculateDistance from './calculateDistance'

function checkConflict(userLocation, conflictPoints) {
  let conflictCount = 0

  conflictPoints.forEach((point) => {
    const distance = calculateDistance(
      {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
      },
      { latitude: point.latitude, longitude: point.longitude },
    )

    if (distance <= 15) {
      // 15 é o raio
      conflictCount++
    }
  })

  return conflictCount >= 2 // Retorna verdadeiro se o usuário estiver dentro do raio de dois pontos
}

export default checkConflict
