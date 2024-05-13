import { Marker } from './IPoint'

export interface IAdultCollection {
  image: string
  marker: Marker
  from_txt: string
  latitude: number
  longitude: number
  altitude: number
  accuracy: number
  wind: string
  climate: string
  temperature: string
  humidity: number
  insects_number: number
  observation: string
  created_ondevice_at: string
  contract: number
  pointreference: number
  device: number
  applicator: number
  success: boolean
}
