import { createContext, useContext, ReactNode, useState, useMemo } from 'react'
import { noop } from 'lodash'

import { SelectPointReference } from '@/db/point-reference'

type UserSelectedPointContext = {
  selectedPoint: SelectPointReference | null
  setSelectedPoint(point: SelectPointReference | null): void
}

const Context = createContext<UserSelectedPointContext>({
  selectedPoint: null,
  setSelectedPoint: noop,
})

export const UserSelectedPointProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  const [selectedPoint, setSelectedPoint] =
    useState<SelectPointReference | null>(null)

  const value = useMemo(
    () => ({
      selectedPoint,
      setSelectedPoint,
    }),
    [selectedPoint],
  )

  return <Context.Provider value={value}>{children}</Context.Provider>
}

export const useUserSelectedPoint = () => useContext(Context)
