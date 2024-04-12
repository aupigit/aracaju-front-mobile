import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  Alert,
  StyleSheet,
  Pressable,
} from 'react-native'
import NetInfo from '@react-native-community/netinfo'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import MapView, {
  Circle,
  Marker,
  PROVIDER_GOOGLE,
  Polyline,
} from 'react-native-maps'
import {
  requestForegroundPermissionsAsync,
  getCurrentPositionAsync,
  LocationObject,
  watchPositionAsync,
  LocationAccuracy,
  LocationSubscription,
} from 'expo-location'
import calculateDistance from '@/utils/calculateDistance'
import isPointInRegion from '@/utils/isPointInRegion'
import checkConflict from '@/utils/checkConflict'
import getConflictPoints from '@/utils/getConflictPoints'
import getConflictPointColor from '@/utils/getConflictPointColor'
import ApplicationPointUsageModal from '@/components/Modal/ApplicationPointUsageModal'
import ApplicationPointsInformationModal from '@/components/Modal/ApplicationPointsInformationModal'
import ApplicationConflictPointsModal from '@/components/Modal/ApplicationConflictPointsModal'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import { difFakePoint, fakePoints } from './fakePoints'
import ApplicationApplicateModal from '@/components/Modal/ApplicationAplicateModal'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const Posts = () => {
  const [posts, setPosts] = useState([])
  const [isSynced, setIsSynced] = useState(true)
  const [location, setLocation] = useState<LocationObject | null>(null)
  const [routes, setRoutes] = useState([])
  const [region, setRegion] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [showButton, setShowButton] = useState(false)
  const [modalConflict, setModalConflict] = useState(false)
  const [modalInfoPoints, setModalInfoPoints] = useState(false)
  const [modalApplicate, setModalApplicate] = useState(false)
  const [selectedPoint, setSelectedPoint] = useState(null)
  const [conflictPoints, setConflictPoints] = useState([])

  const insets = useSafeAreaInsets()

  const mapRef = useRef(null)

  // ADICIONAR ITENS NO MOCKAPI
  // const addPost = async () => {
  //   const newPost = {
  //     name: 'foo',
  //     email: 'bar',
  //     ponto_long: -180 + Math.random() * 360,
  //     ponto_lati: -90 + Math.random() * 180,
  //   }

  //   const netInfo = await NetInfo.fetch()

  //   if (netInfo.isConnected && netInfo.isInternetReachable) {
  //     const response = await fetch(
  //       'https://66156f0fb8b8e32ffc7af00b.mockapi.io/api/v1/users',
  //       {
  //         method: 'POST',
  //         body: JSON.stringify(newPost),
  //         headers: {
  //           'Content-type': 'application/json; charset=UTF-8',
  //         },
  //       },
  //     )

  //     const json = await response.json()

  //     // Add the new post to the list of posts
  //     setPosts([...posts, json])
  //   } else {
  //     // Save the post to AsyncStorage if the user is offline
  //     const offlinePosts = (await AsyncStorage.getItem('offlinePosts')) || '[]'
  //     await AsyncStorage.setItem(
  //       'offlinePosts',
  //       JSON.stringify([...JSON.parse(offlinePosts), newPost]),
  //     )
  //   }
  // }

  // BUSCAR ITENS DO MOCKAPI
  // const fetchPosts = async () => {
  //   const response = await axios.get(
  //     'https://66156f0fb8b8e32ffc7af00b.mockapi.io/api/v1/users',
  //   )
  //   setPosts(response.data)
  // }

  const routePoints = []

  // SINCRONIZAR ALTERAÇÕES OFFLINE COM A ONLINE
  // const handleSync = async () => {
  //   const netInfo = await NetInfo.fetch()
  //   if (netInfo.isConnected && netInfo.isInternetReachable) {
  //     // Get the offline posts from AsyncStorage
  //     const offlinePosts = JSON.parse(
  //       (await AsyncStorage.getItem('offlinePosts')) || '[]',
  //     )

  //     // Send each offline post to the API
  //     for (const post of offlinePosts) {
  //       await fetch(
  //         'https://66156f0fb8b8e32ffc7af00b.mockapi.io/api/v1/users',
  //         {
  //           method: 'POST',
  //           body: JSON.stringify(post),
  //           headers: {
  //             'Content-type': 'application/json; charset=UTF-8',
  //           },
  //         },
  //       )
  //     }

  //     // Clear the offline posts from AsyncStorage
  //     await AsyncStorage.setItem('offlinePosts', JSON.stringify([]))

  //     // Fetch the latest posts from the API
  //     await fetchPosts()
  //     setIsSynced(true)
  //     Alert.alert('Sincronização', 'Dados sincronizados com sucesso!')
  //   } else {
  //     setIsSynced(false)
  //     addPost()
  //     Alert.alert(
  //       'Sincronização',
  //       'Você está offline. Os dados não puderam ser sincronizados.',
  //     )
  //   }
  // }

  // PEDIR PERMISSÃO PARA ACESSAR A LOCALIZAÇÃO
  async function requestLocationPermissions() {
    const { granted } = await requestForegroundPermissionsAsync()

    if (!granted) {
      Alert.alert(
        'Permissão de localização',
        'É necessário permitir o acesso à localização para utilizar este aplicativo.',
      )
    }
  }

  useEffect(() => {
    requestLocationPermissions()
    // handleSync()
    let unsubscribe: LocationSubscription | null = null

    const startWatching = async () => {
      unsubscribe = await watchPositionAsync(
        {
          accuracy: LocationAccuracy.Highest,
          distanceInterval: 1,
          timeInterval: 1000,
        },
        async (newLocation) => {
          setLocation(newLocation)

          routePoints.push(newLocation)

          await AsyncStorage.setItem('location', JSON.stringify(newLocation))

          setRoutes((currentLocations) => [...currentLocations, newLocation])
        },
      )
    }

    startWatching()

    // return () => {
    //   // Stop watching location when the component is unmounted
    //   if (unsubscribe) {
    //     unsubscribe.remove()
    //   }
    // }
  }, [])

  useEffect(() => {
    if (location) {
      for (const point of fakePoints) {
        if (calculateDistance(location.coords, point) <= 15) {
          setShowButton(true)
          return
        }
      }
      setShowButton(false)
    }
  }, [location, fakePoints])

  if (!location) {
    return
  }

  // console.log(
  //   'LOCALIZAÇÃO ATUAL ->',
  //   location.coords.latitude,
  //   location.coords.longitude,
  // )

  // console.log('ROTA ->', JSON.stringify(routes, null, 2))
  // console.log('ROUTE POINTS ->', JSON.stringify(routePoints, null, 2))
  // console.log('QUANTIDADE DE PONTOS DA ROTA ->', routes.length)

  const handleMarkerPress = (point) => {
    setModalInfoPoints(true)
    setSelectedPoint(point)
  }

  const handleDifferntMarkerPress = (point) => {
    setModalVisible(true)
    setSelectedPoint(point)
  }

  const userLocation = [location.coords.latitude, location.coords.longitude]

  return (
    <ScrollView style={{ paddingTop: insets.top }}>
      <View className="h-screen flex-1 items-center justify-center">
        {location && (
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            onRegionChangeComplete={setRegion}
            onRegionChange={(region) => {
              setRegion(region)
            }}
            style={styles.map}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.0005,
              longitudeDelta: 0.0005,
            }}
            showsUserLocation={true} // mostra a localização do usuário
            showsCompass={true} // mostra a bússola
            showsScale={true} // mostra a escala
            showsMyLocationButton={true} // mostra o botão de localização do usuário
            zoomControlEnabled={true} // habilita o controle de zoom
            scrollEnabled={true} // habilita o scroll
            userLocationPriority="high" // prioridade da localização do usuário
            userLocationUpdateInterval={1000} // intervalo de atualização da localização do usuário
            loadingEnabled={true}
            loadingBackgroundColor={'#fff'}
            toolbarEnabled={false}
            mapPadding={{ top: 10, right: 20, bottom: 60, left: 20 }}
          >
            <Polyline
              strokeColor="#0000ff"
              strokeWidth={6}
              coordinates={routes.map((loc) => loc.coords)}
            />

            {fakePoints
              .filter((point) => isPointInRegion(point, region))
              .map((point, index) => {
                const conflictIndex = conflictPoints.findIndex(
                  (conflictPoint) =>
                    conflictPoint.latitude === point.latitude &&
                    conflictPoint.longitude === point.longitude,
                )

                let pinColor = 'red'
                let strokeColor = 'red'
                let fillColor = 'rgba(255,0,0,0.1)'

                if (conflictIndex === 0) {
                  pinColor = 'yellow'
                  strokeColor = 'yellow'
                  fillColor = 'rgba(255,255,0,0.1)'
                } else if (conflictIndex === 1) {
                  pinColor = 'purple'
                  strokeColor = 'purple'
                  fillColor = 'rgba(128,0,128,0.1)'
                }

                return (
                  <React.Fragment key={index}>
                    <Marker
                      coordinate={{
                        latitude: point.latitude,
                        longitude: point.longitude,
                      }}
                      pinColor={pinColor}
                      onPress={() => handleMarkerPress(point)}
                    />
                    <Circle
                      center={{
                        latitude: point.latitude,
                        longitude: point.longitude,
                      }}
                      radius={15}
                      strokeColor={strokeColor}
                      fillColor={fillColor}
                    />
                  </React.Fragment>
                )
              })}
            <Marker
              coordinate={{
                latitude: difFakePoint.latitude,
                longitude: difFakePoint.longitude,
              }}
              pinColor="green" // muda a cor do marcador para verde
              onPress={() => handleDifferntMarkerPress(difFakePoint)}
            />
            <Circle
              center={{
                latitude: difFakePoint.latitude,
                longitude: difFakePoint.longitude,
              }}
              radius={15}
              strokeColor="green"
              fillColor="rgba(0,255,0,0.1)"
            />
          </MapView>
        )}

        <ApplicationPointUsageModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          selectedPoint={selectedPoint}
          setModalApplicate={setModalApplicate}
          setSelectedPoint={setSelectedPoint}
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
        />
      </View>
      <View className="absolute bottom-0 left-0 items-center justify-center">
        {showButton && (
          <Pressable
            className="w-screen rounded-md border border-zinc-700/20 bg-[#7c58d6] p-5"
            onPress={() => {
              // Verifique se há conflito (usuário dentro do raio de dois pontos)
              const conflictPoints = getConflictPoints(location, fakePoints)
              if (conflictPoints.length >= 2) {
                setConflictPoints(conflictPoints)
                setModalConflict(true)
              } else {
                setModalApplicate(true)
              }
            }}
          >
            <Text className="text-center text-lg font-bold text-white">
              APLICAÇÃO
            </Text>
          </Pressable>
        )}

        {isSynced ? null : <Text>Dados desincronizados</Text>}

        {/* <Text>Posts</Text>
 

        {posts.map((post) => (
          <View
            key={post.id}
            className=" w-full flex-row items-center justify-between"
          >
            <Text>{post.id}</Text>
            <Text>{post.name}</Text>
          </View>
        ))} */}

        {/* <Button title="SAVE FILE" onPress={saveToFile}></Button> */}

        {/* <ScrollView className="max-h-[200px] overflow-scroll">
          <Text>{routes.length}</Text>

          {routes.length > 0 ? (
            routes.map((point, index) => (
              <Text key={index}>
                {point.coords.latitude} / {point.coords.longitude}
              </Text>
            ))
          ) : (
            <Text>Rotas: 0</Text>
          )}
        </ScrollView> */}
      </View>
    </ScrollView>
  )
}

export default Posts

const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'blue',
  },
})
