import { IApplicator } from './IApplicator'
import { IBase } from './IBase'
import { ISODateString } from '@/interfaces/iso-date-string'

export interface Marker {
  type: string
  coordinates: number[]
}

export interface IPointType extends IBase {
  name: string
  description: string
  image: URL | string
}

export interface IPointTypeFlat extends IBase {
  name: string
  point_code: string
}

export interface IDevices extends IBase {
  factory_id: string
  name: string
  authorized: boolean
  last_sync: ISODateString
  color_line: string
  description: string
  applicator: IApplicator
}

export interface ICustomer extends IBase {
  name: string
  cnpj: string
  address: string
  city: string
  state: string
  phone: string
  email: string
  logo: string
  observation: string
  organization_type: number
}

export interface ICity extends IBase {
  name: string
  description: string
  poligon: {
    type: string
    coordinates: [[[latitude: number, longitude: number]]]
  }
  from_txt: string
  image: string
}

export interface IRegion extends IBase {
  name: string
  acronym: string
  poligon: {
    type: string
    coordinates: [[[latitude: number, longitude: number]]]
  }
  from_txt: string
  client: ICustomer
}

export interface ISubRegion extends IBase {
  name: string
  regions: IRegion
  client: ICustomer
  acronym: string
  poligon: {
    type: string
    coordinates: [[[latitude: number, longitude: number]]]
  }
  points: [
    {
      name: string
      marker: Marker
    },
  ]
  from_txt: string
  image: string
}

export interface IApplication extends IBase {
  marker: Marker
  from_txt: string
  latitude: number
  longitude: number
  altitude: number
  accuracy: number
  volume_bti: number
  container: boolean
  card: boolean
  plate: boolean
  observation: string
  status: string
  image: string
  created_ondevice_at: Date | string
  transmission: Date | string
  point_reference: number
  device: IDevices
  applicator: IApplicator
  success: boolean
}

export interface IPoint {
  // FIXME: we need to be more explicit about server ID vs client ID
  pk?: number
  id?: number
  created_at?: Date
  updated_at?: Date
  applications: string[]
  days_since_last_application: string | null
  name: string
  marker: Marker
  from_txt: string
  latitude: number
  longitude: number
  altitude: number
  accuracy: number
  volume_bti: number
  observation: string
  distance: number
  created_ondevice_at?: string
  transmission?: string
  image: URL | string
  kml_file?: string
  situation: string
  is_active: boolean
  is_new: boolean
  contract: number
  device: IDevices
  applicator: IApplicator
  client: ICustomer
  city: ICity
  subregions: ISubRegion
  success: boolean
  point_type: string
  point_type_detail: string
}
