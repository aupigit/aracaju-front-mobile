import { IBase } from './IBase'

export interface IApplicator extends IBase {
  name: string
  status: boolean
  new_marker: boolean
  edit_marker: boolean
  is_leader: boolean
  description: string
  contract: number
  user: number
}
