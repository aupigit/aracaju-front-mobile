import { IPoint } from '@/interfaces/IPoint'
import { createContext, useContext, ReactNode, useState } from 'react'

interface PointsReferenceContextProps {
  children: ReactNode
}

interface PointsReferenceContextData {
  setPointIsEditable: (pointIsEditable: boolean) => void
  pointIsEditable: boolean
  setSelectedPoint(point: IPoint): void
  selectedPoint: IPoint
}

const PointsReferenceContext = createContext<
  PointsReferenceContextData | undefined
>(undefined)

export const PointsReferenceProvider: React.FC<PointsReferenceContextProps> = ({
  children,
}) => {
  const [pointIsEditable, setPointIsEditable] = useState(false)
  const [selectedPoint, setSelectedPoint] = useState(null)

  return (
    <PointsReferenceContext.Provider
      value={{
        setPointIsEditable,
        pointIsEditable,
        selectedPoint,
        setSelectedPoint,
      }}
    >
      {children}
    </PointsReferenceContext.Provider>
  )
}

export const usePointsReference = (): PointsReferenceContextData => {
  const context = useContext(PointsReferenceContext)
  if (!context) {
    throw new Error(
      'usePointsReference deve ser usado dentro de um UserProvider',
    )
  }
  return context
}
