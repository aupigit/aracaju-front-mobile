import { IBase } from './IBase'

export interface IConfigApp extends IBase {
  name: string
  data_type: string
  data_config: string
  description: string
}
