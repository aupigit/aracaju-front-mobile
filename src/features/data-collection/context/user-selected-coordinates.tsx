import { createContext, ReactNode, useContext, useMemo, useState } from 'react'
import { noop } from 'lodash'
import { LatLng } from 'react-native-maps'

const Context = createContext<{
  selectedCoordinates: LatLng | null
  setSelectedCoordinates: (selectedCoordinates: LatLng | null) => void
}>({
  selectedCoordinates: null,
  setSelectedCoordinates: noop,
})

export const UserSelectedCoordinatesProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  const [selectedCoordinates, setSelectedCoordinates] = useState<LatLng | null>(
    null,
  )

  const value = useMemo(
    () => ({
      selectedCoordinates,
      setSelectedCoordinates,
    }),
    [selectedCoordinates],
  )

  return <Context.Provider value={value}>{children}</Context.Provider>
}

export const useUserSelectedCoordinates = () => useContext(Context)
