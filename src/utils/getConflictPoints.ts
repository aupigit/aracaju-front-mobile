import calculateDistance from './calculateDistance'

function getConflictPoints(userLocation, points) {
  const conflictPoints = []

  points.forEach((point) => {
    const distance = calculateDistance(
      {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
      },
      { latitude: point.latitude, longitude: point.longitude },
    )

    if (distance <= 15) {
      // 15 é o raio
      conflictPoints.push(point)
    }
  })

  return conflictPoints
}

export default getConflictPoints
