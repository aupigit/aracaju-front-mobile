// Virtualização de pontos a 1KM de distância
function isPointInRegion(point, region) {
  if (!region) {
    return true
  }

  const { latitude, longitude } = region

  const deg2rad = (deg) => deg * (Math.PI / 180)

  const R = 6371
  const dLat = deg2rad(point.latitude - latitude)
  const dLon = deg2rad(point.longitude - longitude)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(latitude)) *
      Math.cos(deg2rad(point.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return distance <= 2
}

export default isPointInRegion
