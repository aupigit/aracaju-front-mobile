import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  View,
  Text,
  Alert,
  DrawerLayoutAndroid,
  TouchableOpacity,
} from 'react-native'
import ReactNativeMaps from 'react-native-maps'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery } from 'react-query'
import { and, eq } from 'drizzle-orm'
import { useLiveQuery } from 'drizzle-orm/expo-sqlite'
import { FontAwesome6 } from '@expo/vector-icons'

import { calculateDistance } from '@/utils/calculateDistance'
import isPointInRegion from '@/utils/isPointInRegion'
import { findManyPointsReferences } from '@/services/onlineServices/points'
import { ApplicationAdjustPointCoordinatesModal } from '@/components/Modal/ApplicationAdjustPointCoordinatesModal'
import { useUser, useApplicator } from '@/features/session'
import {
  pullPointData,
  pullPointLastUpdatedAt,
} from '@/services/pullServices/pointReference'
import { findConfigApp } from '@/services/onlineServices/configApp'
import { pullConfigAppData } from '@/services/pullServices/configApp'
import { syncApplication } from '@/services/syncServices/application'
import { syncDoAdultCollection } from '@/services/syncServices/doAdultCollection'
import { syncTrails } from '@/services/syncServices/trail'
import { syncPoints } from '@/services/syncServices/points'
import { formatDate, formatDateToDDMMYYYY } from '@/utils/date'
import { useDevice } from '@/features/device'
import { findLatestApplicationDatesByPointIds } from '@/services/offlineServices/application'
import { ApplicationAddPointReferenceModal } from '@/components/Modal/ApplicationAddPointReferenceModal'
import { upsertPointTypeData } from '@/services/pullServices/point-type'
import { findManyPointType } from '@/services/onlineServices/point-type'
import { SyncModal } from '@/components/Modal/SyncModal'
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
import { useAsyncStoreValues, useChangeAsyncStore } from '@/hooks'
import { PointReference, SelectPointReference } from '@/db/point-reference'
import { useDB } from '@/features/database'
import { useConfigApp } from '@/hooks/use-config-app'
import { numToPointType, PointType } from '@/features/data-collection/constants'

const toNil = () => null

export const PointsReferencePage = () => {
  const db = useDB()
  const [pointTypeAction, setPointTypeAction] = useState<PointType | null>(null)
  const [showPointDetails, setShowPointDetails] = useState(false)
  const [modalAddPointReference, setModalAddPointReference] = useState(false)
  const [modalButtonWarning, setModalButtonWarning] = useState(false)

  const [lastSync] = useAsyncStoreValues(['last_sync_time']).data || []
  const changeAsyncStore = useChangeAsyncStore()
  const [modalSync, setModalSync] = useState(false)
  const [progress, setProgress] = useState(0)

  const userLocation = useUserCurrentLocation()
  const device = useDevice()
  const applicator = useApplicator()!
  const user = useUser()!
  const { selectedCoordinates } = useUserSelectedCoordinates()

  const insets = useSafeAreaInsets()
  const mapRef = useRef<ReactNativeMaps>(null)

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
              eq(PointReference.point_type, 1),
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

  // GET - Data da última aplicação em determinados pontos/Offline
  const {
    data: latestApplicationDates,
    isLoading: latestApplicationDateLoading,
  } = useQuery(
    'application/application/latest',
    () => {
      return findLatestApplicationDatesByPointIds(
        pointReferences.data
          // FIXME: point coords shouldn't be null!
          .filter((point) => isPointInRegion(point, userLocation))
          // FIXME: id shouldn't be null!
          .map((point) => point.id!),
      )
    },
    { enabled: !!pointReferences.data },
  )

  const incrementProgress = useCallback(() => {
    setProgress((prevProgress) => prevProgress + 0.1)
  }, [setProgress])

  const handleSyncInformation = async () => {
    setModalSync(true)
    setProgress(0)

    console.log('[sync] sending data')
    try {
      await syncPoints(applicator.id, device.factory_id)
      setProgress(0.1)
      await Promise.all([
        syncApplication().then(incrementProgress),
        syncDoAdultCollection().then(incrementProgress),
        syncTrails().then(incrementProgress),
      ])

      await changeAsyncStore.multiSet([
        ['last_sync_time', new Date().toISOString()],
      ])

      console.log('[sync] fetch started')

      // FIXME: should we do this in parallel?
      // Points
      const points = await pullPointLastUpdatedAt()
        .then((date) => (date ? formatDate(new Date(date)) : null))
        .catch(toNil)
        .then((date) => findManyPointsReferences(date))
        .catch(toNil)
        .finally(incrementProgress)

      // Config app
      const configApps = await findConfigApp()
        .catch(toNil)
        .finally(incrementProgress)

      // Point type
      const pointTypes = await findManyPointType()
        .catch(toNil)
        .finally(incrementProgress)

      await Promise.all([
        pullPointData(points ?? []).then(incrementProgress),
        pullConfigAppData(configApps ?? []).then(incrementProgress),
        upsertPointTypeData(pointTypes ?? []).then(incrementProgress),
      ])

      setModalSync(false)
      console.log('[sync] finished')
      setProgress(1)
    } catch (error) {
      setModalSync(false)
      console.log('[sync]', error)
      Alert.alert('Erro na sincronização:', (error as Error).message)
    }
  }

  // Ações do usuário
  useEffect(() => {
    const validPoints: SelectPointReference[] = []
    const pointsInRegion = pointReferences.data.filter((point) =>
      isPointInRegion(point, userLocation),
    )

    for (const point of pointsInRegion) {
      if (calculateDistance(userLocation, point) <= configsOfPointRadius) {
        validPoints.push(point)
      }
    }

    if (validPoints.length > 0) {
      const distances = validPoints.map((point) =>
        calculateDistance(userLocation, point),
      )

      const closestPointIndex = distances.indexOf(Math.min(...distances))
      const closestPoint = validPoints[closestPointIndex]

      setShowPointDetails(true)
      setPointTypeAction(numToPointType(closestPoint.point_type))
    } else {
      setPointTypeAction(null)
      setShowPointDetails(false)
    }
  }, [pointReferences.data, userLocation, configsOfPointRadius])

  // Menu lateral
  const navigationView = () => (
    <Sidebar insets={insets} closeDrawer={closeDrawer} />
  )

  // Loading de informações
  if (latestApplicationDateLoading || !applicator || !device || !user) {
    return (
      <View className=" flex-1 flex-col items-center justify-center gap-3">
        <Text className="w-[60%] text-center text-lg font-bold">
          Carregando o mapa e os pontos. Aguarde um momento
        </Text>
      </View>
    )
  }

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
          latestApplicationDates={latestApplicationDates || []}
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
        {modalSync && (
          <SyncModal
            onClose={() => setModalSync(false)}
            progress={progress}
            pointsLength={0}
          />
        )}
        {modalButtonWarning && (
          <ButtonWarningModal onClose={() => setModalButtonWarning(false)} />
        )}
      </View>
      <TopOverlay>
        <View className="flex-row p-2">
          <View className="flex-1 flex-col gap-2">
            <TouchableOpacity
              className="h-12 flex-row items-center justify-center gap-2 rounded-sm bg-blue-500 p-2"
              onPress={handleSyncInformation}
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
              className="h-12 w-12 flex-row items-center justify-center rounded-sm border-zinc-700/20 bg-zinc-100/70 p-3"
              onPress={openDrawer}
            >
              <FontAwesome6 name="bars" size={18} color="gray" />
            </TouchableOpacity>
            <TouchableOpacity
              className="h-12 w-12 flex-row items-center justify-center rounded-sm border-zinc-700/20 bg-zinc-100/70 p-3"
              onPress={focusOnUser}
            >
              <FontAwesome6 name="location-crosshairs" size={18} color="gray" />
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
            latestApplicationDates={latestApplicationDates || []}
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
