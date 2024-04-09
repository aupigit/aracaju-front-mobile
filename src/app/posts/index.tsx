import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  Button,
  Alert,
  StyleSheet,
  Image,
} from 'react-native'
import NetInfo from '@react-native-community/netinfo'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import MapView, { Circle, Marker, Polyline } from 'react-native-maps'
import {
  requestForegroundPermissionsAsync,
  getCurrentPositionAsync,
  LocationObject,
  watchPositionAsync,
  LocationAccuracy,
  LocationSubscription,
} from 'expo-location'

const Posts = () => {
  const [posts, setPosts] = useState([])
  const [isSynced, setIsSynced] = useState(true)
  const [location, setLocation] = useState<LocationObject | null>(null)
  const [routes, setRoutes] = useState([])
  const [startTime, setStartTime] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)

  const startRecording = () => {
    setStartTime(Date.now())
    setRoutes([])
  }

  const stopRecording = () => {
    setElapsedTime(Date.now() - startTime)
  }

  const addPost = async () => {
    const newPost = {
      name: 'foo',
      email: 'bar',
      ponto_long: -180 + Math.random() * 360, // Longitude: -180 to 180
      ponto_lati: -90 + Math.random() * 180,
    }

    const netInfo = await NetInfo.fetch()

    if (netInfo.isConnected && netInfo.isInternetReachable) {
      const response = await fetch(
        'https://66156f0fb8b8e32ffc7af00b.mockapi.io/api/v1/users',
        {
          method: 'POST',
          body: JSON.stringify(newPost),
          headers: {
            'Content-type': 'application/json; charset=UTF-8',
          },
        },
      )

      const json = await response.json()

      // Add the new post to the list of posts
      setPosts([...posts, json])
    } else {
      // Save the post to AsyncStorage if the user is offline
      const offlinePosts = (await AsyncStorage.getItem('offlinePosts')) || '[]'
      await AsyncStorage.setItem(
        'offlinePosts',
        JSON.stringify([...JSON.parse(offlinePosts), newPost]),
      )
    }
  }

  const fetchPosts = async () => {
    const response = await axios.get(
      'https://66156f0fb8b8e32ffc7af00b.mockapi.io/api/v1/users',
    )
    setPosts(response.data)
  }

  const handleSync = async () => {
    const netInfo = await NetInfo.fetch()

    if (netInfo.isConnected && netInfo.isInternetReachable) {
      // Get the offline posts from AsyncStorage
      const offlinePosts = JSON.parse(
        (await AsyncStorage.getItem('offlinePosts')) || '[]',
      )

      // Send each offline post to the API
      for (const post of offlinePosts) {
        await fetch(
          'https://66156f0fb8b8e32ffc7af00b.mockapi.io/api/v1/users',
          {
            method: 'POST',
            body: JSON.stringify(post),
            headers: {
              'Content-type': 'application/json; charset=UTF-8',
            },
          },
        )
      }

      // Clear the offline posts from AsyncStorage
      await AsyncStorage.setItem('offlinePosts', JSON.stringify([]))

      // Fetch the latest posts from the API
      await fetchPosts()
      setIsSynced(true)
      Alert.alert('Sincronização', 'Dados sincronizados com sucesso!')
    } else {
      setIsSynced(false)
      addPost()
      Alert.alert(
        'Sincronização',
        'Você está offline. Os dados não puderam ser sincronizados.',
      )
    }
  }

  async function requestLocationPermissions() {
    const { granted } = await requestForegroundPermissionsAsync()

    if (!granted) {
      Alert.alert(
        'Permissão de localização',
        'É necessário permitir o acesso à localização para utilizar este aplicativo.',
      )
    } else {
      const currentPosition = await getCurrentPositionAsync()
      setLocation(currentPosition)
    }
  }

  useEffect(() => {
    requestLocationPermissions()
    handleSync()
  }, [])

  useEffect(() => {
    let unsubscribe: LocationSubscription | null = null

    const startWatching = async () => {
      unsubscribe = await watchPositionAsync(
        {
          accuracy: LocationAccuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        async (newLocation) => {
          setLocation(newLocation)
          await AsyncStorage.setItem('location', JSON.stringify(newLocation))
          setRoutes((currentLocations) => [...currentLocations, newLocation])
        },
      )
    }

    const loadLocation = async () => {
      const savedLocation = await AsyncStorage.getItem('location')
      if (savedLocation) {
        setLocation(JSON.parse(savedLocation))
      }
    }

    loadLocation()

    startWatching()

    return () => {
      // Stop watching location when the component is unmounted
      if (unsubscribe) {
        unsubscribe.remove()
      }
    }
  }, [])

  useEffect(() => {
    if (!location) {
      return
    }

    console.log(
      'LOCALIZAÇÃO ATUAL',
      location.coords.latitude,
      location.coords.longitude,
    )

    console.log('ROTA', JSON.stringify(routes, null, 2))
    console.log('QUANTIDADE DE PONTOS DA ROTA', routes.length)
  })

  function generateFakePoints(center, count) {
    const points = []
    const radius = 0.005 // ajuste este valor para mudar a distância dos pontos falsos

    for (let i = 0; i < count; i++) {
      const latitude = center.latitude + (Math.random() - 0.5) * radius * 2
      const longitude = center.longitude + (Math.random() - 0.5) * radius * 2

      points.push({ latitude, longitude })
    }

    return points
  }

  const [fakePoints, setFakePoints] = useState([])

  useEffect(() => {
    if (location) {
      const points = generateFakePoints(location.coords, 50)
      setFakePoints(points)
    }
  }, [location])

  useEffect(() => {
    if (location) {
      setFakePoints((prevPoints) => [
        ...prevPoints,
        {
          latitude: location.coords.latitude + 0.0001, // adiciona aproximadamente 10 metros à latitude
          longitude: location.coords.longitude + 0.0001, // adiciona aproximadamente 10 metros à longitude
        },
      ])
    }
  }, [location])

  function calculateDistance(point1, point2) {
    const lat1 = point1.latitude
    const lon1 = point1.longitude
    const lat2 = point2.latitude
    const lon2 = point2.longitude

    const R = 6371e3 // metros
    const φ1 = (lat1 * Math.PI) / 180 // φ, λ em radianos
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    const d = R * c // em metros
    return d
  }

  const [showButton, setShowButton] = useState(false)

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

  return (
    <ScrollView>
      <View className="h-screen flex-1 items-center justify-center">
        {location && (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
          >
            <Polyline
              strokeColor="#0000ff"
              coordinates={routes.map((loc) => loc.coords)}
            />
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
            >
              <View style={styles.markerContainer}>
                <View style={styles.circle} />
              </View>
            </Marker>

            <Circle
              center={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              radius={15}
              strokeColor="blue"
              fillColor="rgba(0,0,255,0.1)"
            />

            {fakePoints.map((point, index) => (
              <>
                <Marker
                  key={index}
                  coordinate={{
                    latitude: point.latitude,
                    longitude: point.longitude,
                  }}
                />
                <Circle
                  key={`CIRCLE ${index}`}
                  center={{
                    latitude: point.latitude,
                    longitude: point.longitude,
                  }}
                  radius={15}
                  strokeColor="red"
                  fillColor="rgba(255,0,0,0.1)"
                />
              </>
            ))}
          </MapView>
        )}
        {/* <Text>Posts</Text>
        {isSynced ? null : <Text>Dados desincronizados</Text>}
        <Button title="Start Recording" onPress={startRecording} />
        <Button title="Stop Recording" onPress={stopRecording} />
        <Button title="Sincronizar" onPress={handleSync}></Button>
        <Text>Elapsed Time: {elapsedTime / 1000} seconds</Text> */}

        {/* {posts.map((post) => (
          <View
            key={post.id}
            className=" w-full flex-row items-center justify-between"
          >
            <Text>{post.id}</Text>
            <Text>{post.name}</Text>
          </View>
        ))} */}
      </View>
      {showButton && <Button title="APLICACAO" />}
    </ScrollView>
  )
}

export default Posts

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    alignItems: 'center',
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'blue',
  },
})
