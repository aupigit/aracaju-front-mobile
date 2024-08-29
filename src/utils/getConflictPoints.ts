import { calculateDistance } from './calculateDistance'
import { LatLng } from 'react-native-maps'

export function getConflictPoints<
  T extends {
    latitude: number
    longitude: number
  },
>(location: LatLng, points: T[]) {
  return points.filter((point) => calculateDistance(location, point) <= 15)
}
