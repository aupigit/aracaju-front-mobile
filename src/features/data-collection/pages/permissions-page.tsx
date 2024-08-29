import { View, Text, Linking, Alert } from 'react-native'
import * as Location from 'expo-location'
import * as Notifications from 'expo-notifications'
import { ReactNode } from 'react'

import { SimpleLoadingScreen } from '@/components/simple-loading-screen'
import { PermissionSection } from '@/features/data-collection/components'

export const PermissionsPage = ({ children }: { children: ReactNode }) => {
  const [foreground, requestForeground] = Location.useForegroundPermissions()
  const [background, requestBackground] = Location.useBackgroundPermissions()
  const [notification, requestNotification] = Notifications.usePermissions()

  const handlePermissionRequest = async (
    request: () => Promise<{ canAskAgain: boolean }>,
  ) => {
    try {
      const permission = await request()

      if (!permission.canAskAgain) {
        Alert.alert(
          'Erro ao solicitar permissão',
          'Conceda as permissões de localização através das configurações do app',
          [
            {
              text: 'Abrir Configurações',
              onPress: () => Linking.openSettings(),
            },
          ],
        )
      }
    } catch (error) {
      console.log('[permissions-page] error', error)
      Alert.alert('Erro ao solicitar permissão', 'Tente novamente')
    }
  }

  const requestForegroundPermissions = () => {
    // eslint-disable-next-line no-void
    void handlePermissionRequest(requestForeground)
  }

  const requestBackgroundPermissions = () => {
    // eslint-disable-next-line no-void
    void handlePermissionRequest(requestBackground)
  }

  const requestNotificationPermissions = () => {
    // eslint-disable-next-line no-void
    void handlePermissionRequest(requestNotification)
  }

  if (!background || !foreground || !notification) {
    return <SimpleLoadingScreen message="Verficando pemissões de localização" />
  }

  if (background?.granted && foreground?.granted && notification?.granted) {
    return children
  }

  return (
    <View className="container h-screen flex-1 justify-center bg-white">
      <Text className="py-10 text-2xl font-bold">
        O app precisa destas permissões para funcionar:
      </Text>
      <View className="gap-5">
        <PermissionSection
          title="Localização em primeiro plano"
          description="Usado para rastreamento de localização enquanto o app está em primeiro plano"
          icon="map"
          granted={foreground.granted}
          request={requestForegroundPermissions}
        />
        <PermissionSection
          title="Localização em segundo plano"
          description="Usado para rastreamento de localização enquanto o app está em segundo plano"
          icon="location-arrow"
          granted={background.granted}
          request={requestBackgroundPermissions}
        />
        <PermissionSection
          title="Notificação de rastreamento"
          description="Usado para notificar sobre o rastreamento ativo enquanto o app está ativo"
          icon="bell"
          granted={notification.granted}
          request={requestNotificationPermissions}
        />
      </View>
    </View>
  )
}
