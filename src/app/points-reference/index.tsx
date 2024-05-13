import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  Alert,
  DrawerLayoutAndroid,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  requestForegroundPermissionsAsync,
  LocationObject,
  watchPositionAsync,
  LocationAccuracy,
} from 'expo-location'
import calculateDistance from '@/utils/calculateDistance'
import isPointInRegion from '@/utils/isPointInRegion'
import ApplicationPointUsageModal from '@/components/Modal/ApplicationPointUsageModal'
import ApplicationPointsInformationModal from '@/components/Modal/ApplicationPointsInformationModal'
import ApplicationConflictPointsModal from '@/components/Modal/ApplicationConflictPointsModal'
import ApplicationApplicateModal from '@/components/Modal/ApplicationAplicateModal'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { findManyPointsReferences } from '@/services/onlineServices/points'
import { useQuery } from 'react-query'
import AdultCollectionModal from '@/components/Modal/AdultCollectionModal'
import ApplicationEditPointModal from '@/components/Modal/ApplicationEditPointModal'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import ApplicationAdjustPointCoordinatesModal from '@/components/Modal/ApplicationAdjustPointCoordinatesModal'
import { useUser } from '@/contexts/UserContext'
import {
  pullPointData,
  pullPointLastUpdatedAt,
} from '@/services/pullServices/pointReference'
import { findApplicator } from '@/services/onlineServices/applicator'
import { pullApplicatorData } from '@/services/pullServices/applicator'
import { findUser } from '@/services/onlineServices/user'
import { pullUserData } from '@/services/pullServices/user'
import { findConfigApp } from '@/services/onlineServices/configApp'
import { pullConfigAppData } from '@/services/pullServices/configApp'
import { syncApplication } from '@/services/syncServices/application'
import { syncDoAdultCollection } from '@/services/syncServices/doAdultCollection'
import { useApplicator } from '@/contexts/ApplicatorContext'
import { syncTrails } from '@/services/syncServices/trail'
import {
  adjustPointReferenceLocationOffline,
  findManyPointsReferencesOffline,
} from '@/services/offlineServices/points'
import { syncPoints } from '@/services/syncServices/points'
import { formatDate, formatDateToDDMMYYYY } from '@/utils/Date'
import { useDevice } from '@/contexts/DeviceContext'
import { findLatestApplicationDatesByPointIds } from '@/services/offlineServices/application'
import { doTrailsOffline } from '@/services/offlineServices/trails'
import { findConfigAppByNameOffline } from '@/services/offlineServices/configApp'
import ApplicationAddPointReferenceModal from '@/components/Modal/ApplicationAddPointReferenceModal'
import { pullPointtypeFlatData } from '@/services/pullServices/pointtype'
import { findManyPointtype } from '@/services/onlineServices/pointtype'
import SyncModal from '@/components/Modal/SyncModal'
import BtnCollect from '@/components/PointsReference/CollectButton'
import BtnPointInformations from '@/components/PointsReference/PointInformationsButton'
import BtnApplication from '@/components/PointsReference/ApplicationButton'
import MapViewComponent from '@/components/MapView/MapView'
import Sidebar from '@/components/Sidebar/Sidebar'
import ButtonActions from '@/components/ButtonActions/ButtonActions'
import { PointReference } from '@/db/pointreference'
import { db } from '@/lib/database'
import { eq } from 'drizzle-orm'

const editPointCoordinateSchema = z.object({
  longitude: z.number(),
  latitude: z.number(),
  description: z.string({
    required_error: 'Justificativa é obrigatória',
  }),
})

export type EditPointCoordinateFormData = z.infer<
  typeof editPointCoordinateSchema
>

const PointsReference = () => {
  const [location, setLocation] = useState<LocationObject | null>(null)
  const [routes, setRoutes] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [showButton, setShowButton] = useState(false)
  const [showCollectButton, setShowCollectButton] = useState(false)
  const [showPointDetails, setShowPointDetails] = useState(false)
  const [modalConflict, setModalConflict] = useState(false)
  const [modalInfoPoints, setModalInfoPoints] = useState(false)
  const [modalApplicate, setModalApplicate] = useState(false)
  const [modalAdultCollection, setModalAdultCollection] = useState(false)
  const [modalAddPointReference, setModalAddPointReference] = useState(false)
  const [selectedPoint, setSelectedPoint] = useState(null)
  const [conflictPoints, setConflictPoints] = useState([])
  const [modalEditPoint, setModalEditPoint] = useState(false)
  const [pointIsEditable, setPointIsEditable] = useState(false)
  const [coordinateModal, setCoordinateModal] = useState(false)
  const [previewCoordinate, setPreviewCoordinate] = useState(null)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [modalSync, setModalSync] = useState(false)
  const [progress, setProgress] = useState(0)

  // Context services
  const { applicator } = useApplicator()
  const { device } = useDevice()
  const { user } = useUser()

  const insets = useSafeAreaInsets()
  const mapRef = useRef(null)

  // Ações do Drawer
  const drawerRef = useRef<DrawerLayoutAndroid>(null)
  const openDrawer = () => {
    drawerRef.current?.openDrawer()
  }
  const closeDrawer = () => {
    drawerRef.current?.closeDrawer()
  }

  // Formulário de ajuste de coordenadas
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EditPointCoordinateFormData>({
    resolver: zodResolver(editPointCoordinateSchema),
  })

  // Localização do usuário
  const userLocation = [
    location?.coords.latitude,
    location?.coords.longitude,
    Number(location?.coords.accuracy.toString().slice(0, 2)),
    Number(location?.coords.altitude.toString().slice(0, 2)),
  ]

  // GET - Pontos/Offline
  const {
    data: pointsDataOffline,
    refetch,
    isSuccess,
  } = useQuery(
    'application/pointsreference/is_offline',
    async () => {
      return await findManyPointsReferencesOffline(user?.is_staff).then(
        (response) => response,
      )
    },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      staleTime: Infinity,
      cacheTime: Infinity,
    },
  )

  // GET - Última updated_at de Pontos/Offline
  const {
    data: lastUpdatedAtData,
    isSuccess: lastUpdatedAtSuccess,
    refetch: lastUpdatedAtRefetch,
  } = useQuery('application/pointreference/last_updated_at', async () => {
    return await pullPointLastUpdatedAt().then((response) => response)
  })

  let updatedAtParameter: string | null = null
  if (lastUpdatedAtData) {
    const updatedAtDate = new Date(lastUpdatedAtData)
    updatedAtParameter = formatDate(updatedAtDate)
  }

  // GET - PointsReference/Online
  const {
    data: pointsData,
    isLoading: pointsLoading,
    refetch: pointsDataRefetch,
  } = useQuery(
    'application/pointreference',
    async () => {
      return await findManyPointsReferences(updatedAtParameter).then(
        (response) => response,
      )
    },
    {
      enabled: lastUpdatedAtSuccess,
    },
  )

  // GET - Applicator/Online
  const { data: applicatorData, isLoading: applicatorLoading } = useQuery(
    'application/applicator',
    async () => {
      return await findApplicator().then((response) => response)
    },
  )

  // GET - User/Online
  const { data: userData, isLoading: userLoading } = useQuery(
    'operation/user',
    async () => {
      return await findUser().then((response) => response)
    },
  )

  // GET - ConfigaApp/Online
  const { data: configAppData, isLoading: configAppLoading } = useQuery(
    'operation/configapp',
    async () => {
      return await findConfigApp().then((response) => response)
    },
  )

  // GET - ConfigaApp Raio do ponto/Offline
  const { data: configPointRadius, isLoading: configPointRadiusLoading } =
    useQuery(
      'config/configapp/?name="raio_do_ponto"',
      async () => {
        return await findConfigAppByNameOffline('raio_do_ponto').then(
          (response) => response,
        )
      },
      {
        enabled: pointsDataOffline !== undefined,
      },
    )

  // GET - ConfigaApp Tempo de sincronização/Offline
  const { data: configPushTime, isLoading: configPushTimeLoading } = useQuery(
    'config/configapp/?name="tempo_entrega_sincronizacao"',
    async () => {
      return await findConfigAppByNameOffline(
        'tempo_entrega_sincronizacao',
      ).then((response) => response)
    },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      enabled: pointsDataOffline !== undefined,
    },
  )

  // GET - PointType/Online
  const { data: pointtypeData, isLoading: pointtypeDataLoading } = useQuery(
    'applications/pointtype/',
    async () => {
      return await findManyPointtype().then((response) => response)
    },
  )

  // GET - Data da última aplicação em determinados pontos/Offline
  const {
    data: latestApplicationDates,
    isLoading: latestApplicationDateLoading,
    refetch: refetchLatestApplicationDates,
  } = useQuery(
    'application/application/latest',
    async () => {
      if (
        pointsDataOffline !== undefined &&
        userLocation.length > 0 &&
        userLocation.every(
          (coordinate) => typeof coordinate === 'number' && !isNaN(coordinate),
        )
      ) {
        return await findLatestApplicationDatesByPointIds(
          pointsDataOffline
            .filter((point) =>
              isPointInRegion(point, {
                latitude: userLocation[0],
                longitude: userLocation[1],
              }),
            )
            .map((point) => point.id),
        )
      }
    },
    {
      enabled:
        isSuccess &&
        userLocation.every(
          (coordinate) => typeof coordinate === 'number' && !isNaN(coordinate),
        ) &&
        pointsDataOffline !== undefined,
    },
  )

  const [syncTimeRemaining, setSyncTimeRemaining] = useState<number>(0)

  useEffect(() => {
    if (configPushTime?.data_config) {
      setSyncTimeRemaining(Number(configPushTime.data_config))
    }
  }, [configPushTime])

  useEffect(() => {
    AsyncStorage.getItem('lastSyncTime').then((value) => {
      if (value) {
        setLastSyncTime(new Date(value))
      }
    })
  }, [])

  const handleSyncInformations = async () => {
    console.log('Sincronização iniciando')
    setModalSync(true)
    setProgress(0) // Inicializa o progresso

    const totalPromises = 9 // Corrigido para 8
    let completedPromises = 0

    const updateProgress = () => {
      completedPromises++
      setProgress(+(completedPromises / totalPromises).toFixed(2))
    }

    const once = (fn) => {
      let resolved = false
      return (...args) => {
        if (!resolved) {
          resolved = true
          return fn(...args)
        }
      }
    }

    const tick = (promise) => {
      return promise.then(() => {
        updateProgress()
      })
    }

    Promise.all([once(syncPoints)(applicator.id, device.factory_id)].map(tick)) // Faz o push de pontos primeiro
      .then(() => {
        Promise.all(
          [
            // Aguarda o push de pontos para ai sim fazer o push dos outros dados
            once(syncApplication)(applicator.id, device.id),
            once(syncDoAdultCollection)(device.id),
            once(syncTrails)(Number(applicator.id), Number(device.id)),
          ].map(tick),
        ).then(() => {
          if (pointsData && applicatorData && userData && configAppData) {
            const now = new Date()
            setLastSyncTime(now)
            AsyncStorage.setItem('lastSyncTime', now.toISOString())
            Promise.all(
              [
                // Espera o push de dados para ai sim realizar o pull de dados
                once(pullPointData)(pointsData),
                once(pullApplicatorData)(applicatorData),
                once(pullUserData)(userData),
                once(pullConfigAppData)(configAppData),
                once(pullPointtypeFlatData)(pointtypeData),
              ].map(tick),
            )
              .then(() => {
                refetch()
                pointsDataRefetch()
                handleApplication()
                lastUpdatedAtRefetch()
                setSyncTimeRemaining(Number(configPushTime?.data_config))
                setTimeout(() => {
                  setModalSync(false)
                }, 3000)
                console.log('Sincronização completa')
              })
              .catch((error) => {
                console.error('Erro na sincronização:', error)
              })
          }
        })
      })
      .catch((error) => {
        console.error('Erro na sincronização:', error)
      })
    refetch()
    pointsDataRefetch()
    handleApplication()
    lastUpdatedAtRefetch()
    refetchLatestApplicationDates()
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setSyncTimeRemaining((prevTime) => {
        if (prevTime === 0) {
          handleSyncInformations()
          return Number(configPushTime?.data_config)
        } else {
          return prevTime - 1
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const onSubmit = handleSubmit(async (data) => {
    try {
      await adjustPointReferenceLocationOffline(
        data.longitude,
        data.latitude,
        Number(selectedPoint.id),
      )
      setPointIsEditable(false)
      setCoordinateModal(false)
      refetch()
      reset()
      setPreviewCoordinate(null)
    } catch (error) {
      console.error(error)
      throw error
    }
  })

  async function requestLocationPermissions() {
    const { granted } = await requestForegroundPermissionsAsync()

    if (!granted) {
      Alert.alert(
        'Permissão de localização',
        'É necessário permitir o acesso à localização para utilizar este aplicativo.',
      )
    }
  }

  // Localização do usuário
  useEffect(() => {
    requestLocationPermissions()
    const startWatching = async () => {
      await watchPositionAsync(
        {
          accuracy: LocationAccuracy.Highest,
          distanceInterval: 2,
          timeInterval: 30000,
        },
        async (newLocation) => {
          setLocation(newLocation)
          await AsyncStorage.setItem('location', JSON.stringify(newLocation))
          refetch()
          setRoutes((currentLocations) => [...currentLocations, newLocation])
        },
      )
    }

    startWatching()
  }, [])

  // POST - Trails/Offline
  useEffect(() => {
    const postTrails = async () => {
      const lastLocation = routes[routes.length - 1]
      if (!lastLocation) {
        return
      }

      await doTrailsOffline(
        lastLocation.coords.latitude,
        lastLocation.coords.longitude,
        lastLocation.coords.altitude,
        lastLocation.coords.accuracy,
        Number(applicator.id),
        lastLocation.timestamp,
        Number(device.id),
      )
    }

    if (routes.length > 0) {
      postTrails()
    }
  }, [routes])

  // Ações do usuário
  useEffect(() => {
    if (location) {
      if (pointsDataOffline) {
        for (const point of pointsDataOffline) {
          if (
            calculateDistance(location?.coords, point) <=
            Number(configPointRadius?.data_config)
          ) {
            setShowPointDetails(true)
            if (Number(point.pointtype) === 3) {
              setShowCollectButton(true)
            }
            if (Number(point.pointtype) === 2) {
              setShowButton(true)
            }

            return
          }
        }
      }
      setShowButton(false)
      setShowCollectButton(false)
      setShowPointDetails(false)
    }
  }, [pointsDataOffline, location])

  // Re-renderização de pontos no mapa
  const [markerVisible, setMarkerVisible] = useState(true)

  useEffect(() => {
    if (!markerVisible) {
      const timeoutId = setTimeout(() => {
        setMarkerVisible(true)
      }, 1000)

      return () => clearTimeout(timeoutId)
    }
  }, [markerVisible])

  function handleApplication() {
    setMarkerVisible(false)
  }

  // Menu lateral
  const navigationView = () => (
    <Sidebar
      insets={insets}
      setModalAdultCollection={setModalAdultCollection}
      closeDrawer={closeDrawer}
    />
  )

  // Loading de informações
  if (
    pointsLoading ||
    applicatorLoading ||
    userLoading ||
    configAppLoading ||
    configPointRadiusLoading ||
    configPushTimeLoading ||
    pointtypeDataLoading ||
    latestApplicationDateLoading
  ) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Carregando...</Text>
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
      <ScrollView style={{ paddingTop: insets.top }}>
        <ButtonActions
          handleSyncInformations={handleSyncInformations}
          modalAddPointReference={modalAddPointReference}
          openDrawer={openDrawer}
          setModalAddPointReference={setModalAddPointReference}
          syncTimeRemaining={syncTimeRemaining}
        />

        <View className="h-screen flex-1 items-center justify-center">
          <MapViewComponent
            latestApplicationDates={latestApplicationDates}
            location={location}
            mapRef={mapRef}
            pointIsEditable={pointIsEditable}
            markerVisible={markerVisible}
            pointsDataOffline={pointsDataOffline}
            previewCoordinate={previewCoordinate}
            routes={routes}
            setCoordinateModal={setCoordinateModal}
            setPreviewCoordinate={setPreviewCoordinate}
            setValue={setValue}
            userLocation={userLocation}
          />

          <ApplicationPointUsageModal
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
            selectedPoint={selectedPoint}
            setModalApplicate={setModalApplicate}
            setSelectedPoint={setSelectedPoint}
            refetch={refetch}
            setPointIsEditable={setPointIsEditable}
            userLocation={userLocation}
            modalApplicate={modalApplicate}
          />

          <ApplicationPointsInformationModal
            modalInfoPoints={modalInfoPoints}
            setModalInfoPoints={setModalInfoPoints}
            selectedPoint={selectedPoint}
            setSelectedPoint={setSelectedPoint}
          />

          <ApplicationConflictPointsModal
            conflictPoints={conflictPoints}
            modalConflict={modalConflict}
            modalVisible={modalVisible}
            setModalConflict={setModalConflict}
            setModalVisible={setModalVisible}
            setSelectedPoint={setSelectedPoint}
          />

          <ApplicationApplicateModal
            modalVisible={modalApplicate}
            setModalVisible={setModalApplicate}
            selectedPoint={selectedPoint}
            setSelectedPoint={setSelectedPoint}
            userLocation={userLocation}
            refetchLatestApplicationDates={refetchLatestApplicationDates}
            refetch={refetch}
            handleApplication={handleApplication}
          />
          <AdultCollectionModal
            modalVisible={modalAdultCollection}
            setModalVisible={setModalAdultCollection}
            selectedPoint={selectedPoint}
            setSelectedPoint={setSelectedPoint}
            userLocation={userLocation}
          />

          <ApplicationEditPointModal
            modalVisible={modalEditPoint}
            setModalVisible={setModalEditPoint}
            selectedPoint={selectedPoint}
            setSelectedPoint={setSelectedPoint}
            userLocation={userLocation}
            setPointIsEditable={setPointIsEditable}
            refetch={refetch}
          />

          <ApplicationAdjustPointCoordinatesModal
            modalVisible={coordinateModal}
            setModalVisible={setCoordinateModal}
            setSelectedPoint={setSelectedPoint}
            onSubmit={onSubmit}
            control={control}
            setPreviewCoordinate={setPreviewCoordinate}
            errors={errors}
            setPointIsEditable={setPointIsEditable}
          />

          <ApplicationAddPointReferenceModal
            modalVisible={modalAddPointReference}
            setModalVisible={setModalAddPointReference}
            refetch={refetch}
            userLocation={userLocation}
            applicatorId={Number(applicator.id)}
            deviceId={Number(device.id)}
          />
          <SyncModal
            modalVisible={modalSync}
            setModalVisible={setModalSync}
            progress={progress}
          />
        </View>

        <View className="absolute bottom-0 left-0 items-center justify-center">
          <BtnCollect
            configPointRadius={configPointRadius}
            location={location}
            pointsDataOffline={pointsDataOffline}
            setModalAdultCollection={setModalAdultCollection}
            setSelectedPoint={setSelectedPoint}
            user={user}
            showCollectButton={showCollectButton}
          />

          <BtnApplication
            configPointRadius={configPointRadius}
            pointsDataOffline={pointsDataOffline}
            setModalApplicate={setModalApplicate}
            setSelectedPoint={setSelectedPoint}
            location={location}
            showButton={showButton}
          />

          <BtnPointInformations
            configPointRadius={configPointRadius}
            location={location}
            pointsDataOffline={pointsDataOffline}
            setSelectedPoint={setSelectedPoint}
            setModalEditPoint={setModalEditPoint}
            showPointDetails={showPointDetails}
          />

          {lastSyncTime && (
            <View className="w-screen items-center justify-center bg-white">
              <Text>
                Ultíma vez sincronizado: {formatDateToDDMMYYYY(lastSyncTime)}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </DrawerLayoutAndroid>
  )
}

export default PointsReference
