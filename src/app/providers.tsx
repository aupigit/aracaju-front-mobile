import { QueryClient, QueryClientProvider } from 'react-query'
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from 'react-native-safe-area-context'
import { LogBox } from 'react-native'
import { PaperProvider } from 'react-native-paper'
import { ReactNode } from 'react'

import { UserProvider, ApplicatorProvider } from '@/features/session'
import { DeviceProvider } from '@/features/device/context'
import { DatabaseProvider } from '@/features/database'
import { ToasterProvider } from '@/features/toaster'
import {
  UserSelectedCoordinatesProvider,
  UserSelectedPointProvider,
  SyncOperationsProvider,
} from '@/features/data-collection/context'

const queryClient = new QueryClient()

LogBox.ignoreLogs(['In React 18, SSRProvider is not necessary and is a noop.'])

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <PaperProvider>
        <ToasterProvider>
          <DatabaseProvider>
            <QueryClientProvider client={queryClient}>
              <DeviceProvider>
                <UserProvider>
                  <ApplicatorProvider>
                    <SyncOperationsProvider>
                      <UserSelectedPointProvider>
                        <UserSelectedCoordinatesProvider>
                          {children}
                        </UserSelectedCoordinatesProvider>
                      </UserSelectedPointProvider>
                    </SyncOperationsProvider>
                  </ApplicatorProvider>
                </UserProvider>
              </DeviceProvider>
            </QueryClientProvider>
          </DatabaseProvider>
        </ToasterProvider>
      </PaperProvider>
    </SafeAreaProvider>
  )
}
