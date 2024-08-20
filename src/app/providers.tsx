import { UserProvider } from '@/contexts/UserContext'
import { QueryClient, QueryClientProvider } from 'react-query'
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from 'react-native-safe-area-context'
import { LogBox } from 'react-native'
import { PaperProvider } from 'react-native-paper'
import { ApplicatorProvider } from '@/contexts/ApplicatorContext'
import { DeviceProvider } from '@/features/device/context'
import { PointsReferenceProvider } from '@/contexts/PointsReferenceContext'
import { DatabaseProvider } from '@/features/database'

const queryClient = new QueryClient()

LogBox.ignoreLogs(['In React 18, SSRProvider is not necessary and is a noop.'])

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <PaperProvider>
        <DatabaseProvider>
          <QueryClientProvider client={queryClient}>
            <DeviceProvider>
              <UserProvider>
                <ApplicatorProvider>
                  <PointsReferenceProvider>{children}</PointsReferenceProvider>
                </ApplicatorProvider>
              </UserProvider>
            </DeviceProvider>
          </QueryClientProvider>
        </DatabaseProvider>
      </PaperProvider>
    </SafeAreaProvider>
  )
}
