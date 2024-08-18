import { IBase } from './IBase'

export interface ITrails extends IBase {
  created_ondevice_at: string
  transmition: string
  latitude: number
  longitude: number
  altitude: number
  accuracy: number
  contract: number
  device: number
  applicator: number
  timestamp: string
  success: boolean
}
