import React from 'react'
import { Button, ActivityIndicator } from 'react-native'
import * as TaskManager from 'expo-task-manager'
import * as Location from 'expo-location'

import { db } from '@/lib/database'
import { NewTracking, Tracking } from '@/db/tracking'
import { useQuery } from 'react-query'

const LOCATION_TASK_NAME = 'background-location-task'

TaskManager.defineTask<{ locations: Location.LocationObject[] }>(
  LOCATION_TASK_NAME,
  ({ data, error }) => {
    if (error) {
      console.log('Error occurred', error.message)
      return
    }

    const locations = data?.locations || []
    if (locations.length) {
      const insertValues = locations.map<NewTracking>((location) => ({
        // FIXME: fetch device
        device: 1,
        // FIXME: fetch applicator
        applicator: 1,
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
    }
  },
)

export const PermissionsButton = () => {
  const isTracking = useQuery(['LOCATION_TRACKING_TASK'], () =>
    Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME),
  )

  const requestPermissions = async () => {
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.High,
      distanceInterval: 15,
      foregroundService: {
        notificationTitle: 'Percurso sendo registrado',
        notificationBody: 'Seu percurso está sendo registrado',
      },
    })

    // eslint-disable-next-line no-void
    void isTracking.refetch()
  }

  const disableLocationTrack = async () => {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME).catch(() => {})

    // eslint-disable-next-line no-void
    void isTracking.refetch()
  }

  return isTracking.isLoading ? (
    <ActivityIndicator />
  ) : isTracking.data ? (
    <Button title="Disable tracking" onPress={disableLocationTrack} />
  ) : (
    <Button title="Enable tracking" onPress={requestPermissions} />
  )
}
