import * as TaskManager from 'expo-task-manager'
import * as Location from 'expo-location'
import { useMutation, useQuery, useQueryClient } from 'react-query'

import { NewTracking, Tracking } from '@/db/tracking'
import { db } from '@/lib/database'
import {
  findOneApplicatorQuery,
  findOneDeviceQuery,
} from '@/features/database/queries'

const TASK_NAME = 'LOCATION_UPDATE_TASK'

TaskManager.defineTask<{ locations: Location.LocationObject[] }>(
  TASK_NAME,
  async ({ data, error }) => {
    if (error) {
      console.log('[location-update] error occurred', error.message)

      return
    }

    const [device] = await findOneDeviceQuery().execute()
    const [applicator] = await findOneApplicatorQuery().execute()
    if (!device || !applicator) {
      console.info('[location-update] no device or applicator found, skipping')

      return
    }

    const locations = data?.locations || []
    if (!locations.length) {
      console.info('[location-update] no locations found, skipping')

      return
    }

    const insertValues = locations.map<NewTracking>((location) => ({
      device: device.id,
      applicator: applicator.id,
      transmission: 'offline',
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      altitude: location.coords.altitude,
      accuracy: location.coords.accuracy,
      created_ondevice_at: new Date().toISOString(),
      local_timestamp: location.timestamp,
    }))

    db.insert(Tracking)
      .values(insertValues)
      .execute()
      .catch((error) => {
        console.log('Error inserting locations', error)
      })
  },
)

export const locationUpdateBackgroundTask = {
  useDisableTracking: () => {
    const client = useQueryClient()

    return useMutation(async () => {
      await Location.stopLocationUpdatesAsync(TASK_NAME).catch(() => {})
      await client.invalidateQueries([TASK_NAME])
    })
  },
  useEnableTracking: () => {
    const client = useQueryClient()

    return useMutation(async () => {
      await Location.startLocationUpdatesAsync(TASK_NAME, {
        accuracy: Location.Accuracy.High,
        distanceInterval: 15,
        foregroundService: {
          notificationTitle: 'Percurso sendo registrado',
          notificationBody: 'Seu percurso está sendo registrado',
        },
      })
      await client.invalidateQueries([TASK_NAME])
    })
  },
  useIsTracking: () => {
    return useQuery([TASK_NAME], () =>
      Location.hasStartedLocationUpdatesAsync(TASK_NAME),
    )
  },
}
