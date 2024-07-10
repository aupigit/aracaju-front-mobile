import { UserProvider } from '@/contexts/UserContext'
import { QueryClient, QueryClientProvider } from 'react-query'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { LogBox } from 'react-native'
import { PaperProvider } from 'react-native-paper'
import { ApplicatorProvider } from '@/contexts/ApplicatorContext'
import { DeviceProvider } from '@/contexts/DeviceContext'
import { PointsReferenceProvider } from '@/contexts/PointsReferenceContext'
import { SQLiteProvider } from 'expo-sqlite'
import { DATABASE_NAME } from '@/lib/database'
const queryClient = new QueryClient()

LogBox.ignoreLogs(['In React 18, SSRProvider is not necessary and is a noop.'])
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SQLiteProvider databaseName={DATABASE_NAME}>
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 0, height: 0 },
          insets: { top: 0, left: 0, right: 0, bottom: 0 },
        }}
      >
        <PaperProvider>
          <QueryClientProvider client={queryClient}>
            <DeviceProvider>
              <UserProvider>
                <ApplicatorProvider>
                  <PointsReferenceProvider>{children}</PointsReferenceProvider>
                </ApplicatorProvider>
              </UserProvider>
            </DeviceProvider>
          </QueryClientProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </SQLiteProvider>
  )
}
