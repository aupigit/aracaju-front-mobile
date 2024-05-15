import { string } from 'zod'
import { IApplicator } from './IApplicator'
import { IBase } from './IBase'

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

export interface IPointStatus extends IBase {
  name: string
  description: string
  image: URL | string
}

export interface IDevices extends IBase {
  factory_id: string
  name: string
  authorized: boolean
  last_sync: Date
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

export interface IPointFlat extends IBase {
  name: string
  marker: Marker
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
  acuracia: number
  volumebti: number
  container: boolean
  card: boolean
  plate: boolean
  observation: string
  status: string
  image: string
  created_ondevice_at: Date | string
  transmition: Date | string
  pointreference: number
  device: IDevices
  applicator: IApplicator
  success: boolean
}

export interface IContract extends IBase {
  name: string
  periodicity: string
  start_date: string
  end_date: string
  point_limit: number
  point_overload: number
  volume_bti: string
  volume_bti_overload: string
  on_time_start: number
  on_time_end: number
  observation: string
  customer: number
  contract_status: number
}

export interface IPoint extends IBase {
  applications: string[]
  days_since_last_application: string | null
  name: string
  marker: Marker
  from_txt: string
  latitude: number
  longitude: number
  altitude: number
  accuracy: number
  volumebti: number
  observation: string
  distance: number
  created_ondevice_at?: string
  transmition?: string
  image: URL | string
  kml_file?: string
  situation: string
  is_active: boolean
  is_new: boolean
  contract: number
  device: IDevices
  applicator: IApplicator
  pointtype: string
  client: ICustomer
  city: ICity
  subregions: ISubRegion
  success: boolean
  pk?: number
}
