function calculateDistance(point1, point2) {
  const lat1 = point1.longitude
  const lon1 = point1.latitude
  const lat2 = point2.longitude
  const lon2 = point2.latitude

  const R = 6371e3 // metros
  const φ1 = (lat1 * Math.PI) / 180 // φ, λ em radianos
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  const d = R * c // em metros
  return d
}

export default calculateDistance
