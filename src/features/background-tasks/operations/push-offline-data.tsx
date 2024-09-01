import { SelectApplicator } from '@/db/applicator'
import { SelectDevice } from '@/db/device'
import {
  syncPointsReferenceCreated,
  syncPointsReferenceLocation,
  syncPointsReferenceName,
  syncPointsReferenceStatus,
} from '@/services/sync-services/points'
import { syncApplications } from '@/services/sync-services/application'
import { syncAdultCollections } from '@/services/sync-services/adult-collection'
import { syncTrails } from '@/services/sync-services/trail'
import { asyncStoreSetItem } from '@/hooks'

export const pushOfflineData = async (
  device: SelectDevice,
  applicator: SelectApplicator,
) => {
  await syncPointsReferenceName(applicator.id, device.factory_id)
  await syncPointsReferenceLocation(applicator.id, device.factory_id)
  await syncPointsReferenceStatus(applicator.id, device.factory_id)
  await syncPointsReferenceCreated()
  await syncApplications()
  await syncAdultCollections()
  await syncTrails()
  await asyncStoreSetItem('last_sync_time', new Date().toISOString())
}
