export enum PointType {
  APPLICATION = 1,
  ADULT_COLLECTION = 2,
}

export const numToPointType = (num: number | null) => {
  switch (num) {
    case PointType.APPLICATION:
      return PointType.APPLICATION
    case PointType.ADULT_COLLECTION:
      return PointType.ADULT_COLLECTION
    default:
      return null
  }
}
