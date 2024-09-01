import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { View, Text, DrawerLayoutAndroid, TouchableOpacity } from 'react-native'
import ReactNativeMaps from 'react-native-maps'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { and, desc, eq, inArray } from 'drizzle-orm'
import { useLiveQuery } from 'drizzle-orm/expo-sqlite'
import { FontAwesome6 } from '@expo/vector-icons'

import { calculateDistance } from '@/utils/calculateDistance'
import isPointInRegion from '@/utils/isPointInRegion'
import { ApplicationAdjustPointCoordinatesModal } from '@/components/Modal/ApplicationAdjustPointCoordinatesModal'
import { useUser } from '@/features/session'
import { formatDateToDDMMYYYY } from '@/utils/date'
import { ApplicationAddPointReferenceModal } from '@/components/Modal/ApplicationAddPointReferenceModal'
import { CollectButton } from '@/components/PointsReference/CollectButton'
import { PointInformationButton } from '@/components/PointsReference/PointInformationButton'
import { ApplicationButton } from '@/components/PointsReference/ApplicationButton'
import {
  TopOverlay,
  PointsReferenceMapView,
  Sidebar,
} from '@/features/data-collection/components'
import { ButtonWarningModal } from '@/components/Modal/ButtonWarningModal'
import {
  useUserCurrentLocation,
  useUserSelectedCoordinates,
} from '@/features/data-collection/context'
import { useAsyncStoreValues } from '@/hooks'
import { PointReference } from '@/db/point-reference'
import { useDB } from '@/features/database'
import { useConfigApp } from '@/hooks/use-config-app'
import { numToPointType, PointType } from '@/features/data-collection/constants'
import { Application } from '@/db/application'
import { useSyncOperations } from '@/features/data-collection/context/sync-operations'
import { locationUpdateBackgroundTask } from '@/features/background-tasks/tasks'
import { useToaster } from '@/features/toaster'

export const PointsReferencePage = () => {
  const insets = useSafeAreaInsets()
  const toaster = useToaster()
  const mapRef = useRef<ReactNativeMaps>(null)

  const db = useDB()
  const userLocation = useUserCurrentLocation()
  const user = useUser()!
  const { startCompleteSync } = useSyncOperations()
  const [modalAddPointReference, setModalAddPointReference] = useState(false)
  const [modalButtonWarning, setModalButtonWarning] = useState(false)
  const [lastSync] = useAsyncStoreValues(['last_sync_time']).data || []
  const { selectedCoordinates } = useUserSelectedCoordinates()
  const { data: isTracking } = locationUpdateBackgroundTask.useIsTracking()
  const { mutate: disableLocationTrack } =
    locationUpdateBackgroundTask.useDisableTracking()
  const { mutate: enableLocationTrack } =
    locationUpdateBackgroundTask.useEnableTracking()

  useEffect(() => {
    enableLocationTrack()
  }, [enableLocationTrack])

  // Ações do Drawer
  const drawerRef = useRef<DrawerLayoutAndroid>(null)
  const openDrawer = useCallback(() => {
    drawerRef.current?.openDrawer()
  }, [])
  const closeDrawer = useCallback(() => {
    drawerRef.current?.closeDrawer()
  }, [])

  const focusOnUser = useCallback(() => {
    mapRef.current?.animateToRegion({
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      latitudeDelta: 0.001,
      longitudeDelta: 0.001,
    })
  }, [userLocation])

  const pointReferences = useLiveQuery(
    db
      .select()
      .from(PointReference)
      .where(
        user.is_staff
          ? eq(PointReference.is_active, true)
          : and(
              eq(PointReference.is_active, true),
              eq(PointReference.point_type, PointType.APPLICATION),
            ),
      ),
  )

  const { raioDoPonto: configPointRadius } = useConfigApp(['raio_do_ponto'])

  const configsOfPointRadius = useMemo(() => {
    if (configPointRadius?.data_config) {
      const number = Number(configPointRadius.data_config)

      return isNaN(number) ? 15 : number
    }

    return 15
  }, [configPointRadius])

  const pointsIdInUserRegion = useMemo(
    () =>
      pointReferences.data
        .filter((point) => isPointInRegion(point, userLocation))
        // FIXME: id shouldn't be null!
        .map((point) => point.id!),
    [pointReferences.data, userLocation],
  )
  const latestApplicationDates = useLiveQuery(
    db
      .select({
        id: Application.id,
        createdAt: Application.created_at,
      })
      .from(Application)
      .where(inArray(Application.point_reference, pointsIdInUserRegion))
      .orderBy(desc(Application.created_at)),
  )

  const { pointTypeAction, showPointDetails } = useMemo(() => {
    const validPoints = pointReferences.data
      .filter((point) => isPointInRegion(point, userLocation))
      .filter(
        (point) =>
          calculateDistance(userLocation, point) <= configsOfPointRadius,
      )

    if (validPoints.length) {
      const distances = validPoints.map((point) =>
        calculateDistance(userLocation, point),
      )

      const closestPointIndex = distances.indexOf(Math.min(...distances))
      const closestPoint = validPoints[closestPointIndex]

      return {
        pointTypeAction: numToPointType(closestPoint.point_type),
        showPointDetails: true,
      }
    }

    return {
      pointTypeAction: null,
      showPointDetails: false,
    }
  }, [pointReferences.data, userLocation, configsOfPointRadius])

  const navigationView = () => (
    <Sidebar insets={insets} closeDrawer={closeDrawer} />
  )

  return (
    <DrawerLayoutAndroid
      ref={drawerRef}
      drawerWidth={300}
      drawerPosition="right"
      renderNavigationView={navigationView}
    >
      <View className="flex-1 items-center justify-center">
        <PointsReferenceMapView
          mapRef={mapRef}
          latestApplicationDates={latestApplicationDates.data}
          pointsDataOffline={pointReferences.data}
        />
        {user.is_staff && selectedCoordinates && (
          <ApplicationAdjustPointCoordinatesModal />
        )}
        {user.is_staff && modalAddPointReference && (
          <ApplicationAddPointReferenceModal
            onClose={() => setModalAddPointReference(false)}
          />
        )}
        {modalButtonWarning && (
          <ButtonWarningModal onClose={() => setModalButtonWarning(false)} />
        )}
      </View>
      <TopOverlay>
        <View className="flex-row px-4 pt-2">
          <View className="flex-1 flex-col gap-3">
            <TouchableOpacity
              className="h-12 flex-row items-center justify-center gap-2 rounded-sm bg-blue-500 p-2"
              onPress={startCompleteSync}
            >
              <FontAwesome6 name="arrows-rotate" size={16} color="white" />
              <Text className="font-bold uppercase text-white">
                Sincronizar
              </Text>
            </TouchableOpacity>
            {user.is_staff && (
              <TouchableOpacity
                className="h-12 flex-row items-center justify-center gap-2 rounded-sm bg-green-500 p-2"
                onPress={() => setModalAddPointReference(true)}
              >
                <FontAwesome6 name="location-dot" size={16} color="white" />
                <Text className="font-bold uppercase text-white">
                  Adicionar ponto
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <View className="flex-1 flex-col items-end gap-3">
            <TouchableOpacity
              className="h-12 w-12 flex-row items-center justify-center rounded-sm border-zinc-700/20 bg-zinc-100/70"
              onPress={openDrawer}
            >
              <FontAwesome6 name="bars" size={22} color="gray" />
            </TouchableOpacity>
            <TouchableOpacity
              className="h-12 w-12 flex-row items-center justify-center rounded-sm border-zinc-700/20 bg-zinc-100/70"
              onPress={focusOnUser}
            >
              <FontAwesome6 name="location-crosshairs" size={22} color="gray" />
            </TouchableOpacity>

            <TouchableOpacity
              className="h-12 w-12 flex-row items-center justify-center rounded-sm border-zinc-700/20 bg-zinc-100/70"
              onPress={() => {
                if (isTracking) {
                  disableLocationTrack()
                } else {
                  enableLocationTrack()
                }
                toaster.makeToast({
                  type: 'success',
                  message: isTracking
                    ? 'Rastreamento de percurso desativado'
                    : 'Rastreamento de percurso ativado',
                })
              }}
              onLongPress={() => {
                toaster.makeToast({
                  type: 'error',
                  message: isTracking
                    ? 'Desabilitar rastreamento de percurso'
                    : 'Ativar rastreamento de percurso',
                })
              }}
            >
              <FontAwesome6
                name="magnifying-glass-location"
                size={24}
                color={isTracking ? 'rgb(22 163 74)' : 'gray'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TopOverlay>
      <View className="absolute bottom-0 left-0 items-center justify-center">
        {pointTypeAction === PointType.ADULT_COLLECTION && user.is_staff && (
          <CollectButton
            configPointRadius={configsOfPointRadius}
            pointsDataOffline={pointReferences.data}
            setModalButtonWarning={setModalButtonWarning}
          />
        )}
        {pointTypeAction === PointType.APPLICATION && (
          <ApplicationButton
            configPointRadius={configsOfPointRadius}
            pointsDataOffline={pointReferences.data}
            setModalButtonWarning={setModalButtonWarning}
            latestApplicationDates={latestApplicationDates.data}
          />
        )}
        {showPointDetails && user.is_staff && (
          <PointInformationButton
            configPointRadius={configsOfPointRadius}
            pointsDataOffline={pointReferences.data}
          />
        )}
        {lastSync && (
          <View className="w-screen items-center justify-center bg-white">
            <Text>
              Ultíma vez sincronizado: {formatDateToDDMMYYYY(lastSync)}
            </Text>
          </View>
        )}
      </View>
    </DrawerLayoutAndroid>
  )
}
