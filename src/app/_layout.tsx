import '../global.css'
import { Slot } from 'expo-router'
import { Providers } from './providers'
import { StatusBar } from 'react-native'

export default function Layout() {
  return (
    <Providers>
      <StatusBar barStyle="dark-content" />
      <Slot />
    </Providers>
  )
}
