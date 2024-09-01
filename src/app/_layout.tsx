import '../global.css'
import { Stack } from 'expo-router'
import { Providers } from './providers'
import { StatusBar } from 'react-native'

export default function Layout() {
  return (
    <Providers>
      <StatusBar barStyle="dark-content" />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="points-reference/index"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="login/applicator-lead"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="login/applicator-normal"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="login/applicator-cpf-verify"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="adult-collection/[id]/[lat]/[long]/index"
          options={{ title: 'Coleta inseto adulto' }}
        />
        <Stack.Screen
          name="applications/[id]/[lat]/[long]/index"
          options={{ title: 'Executar Aplicação' }}
        />
        <Stack.Screen
          name="edit-point/[id]/[lat]/[long]/index"
          options={{ title: 'Editar Ponto' }}
        />
      </Stack>
    </Providers>
  )
}
