import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { LatLng } from 'react-native-maps'
import { noop } from 'lodash'
import { useQuery } from 'react-query'
import * as Location from 'expo-location'
import { SimpleLoadingScreen } from '@/components/simple-loading-screen'

export type CurrentUserLocation = LatLng & {
  altitude: number | null
  accuracy: number | null
}

const Context = createContext<{
  userCurrentLocation: CurrentUserLocation | null
  updateUserCurrentLocation: (location: CurrentUserLocation) => void
}>({
  userCurrentLocation: null,
  updateUserCurrentLocation: noop,
})

export const UserCurrentLocationProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  const [location, setLocation] = useState<CurrentUserLocation | null>(null)

  const initialLocation = useQuery<CurrentUserLocation>(
    ['USER_INITIAL_LOCATION'],
    async () => {
      const location = await Location.getCurrentPositionAsync()

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        altitude: location.coords.altitude,
        accuracy: location.coords.accuracy,
      }
    },
  )

  useEffect(() => {
    if (initialLocation.data) {
      setLocation(initialLocation.data)
    }
  }, [initialLocation.data])

  const value = useMemo(
    () => ({
      userCurrentLocation: location,
      updateUserCurrentLocation: setLocation,
    }),
    [location],
  )

  // FIXME: deal with error obtaining location...
  if (value.userCurrentLocation === null) {
    return <SimpleLoadingScreen message="Obtendo localização atual" />
  }

  return <Context.Provider value={value}>{children}</Context.Provider>
}

export const useUserCurrentLocation = () => {
  const location = useContext(Context).userCurrentLocation
  if (!location) {
    throw new Error(
      'useUserCurrentLocation must be used inside a UserCurrentLocationProvider',
    )
  }

  return location
}

export const useUpdateUserCurrentLocation = () => {
  return useContext(Context).updateUserCurrentLocation
}
