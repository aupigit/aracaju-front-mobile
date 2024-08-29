import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ReactNode } from 'react'

export const TopOverlay = ({ children }: { children: ReactNode }) => {
  const insets = useSafeAreaInsets()

  return (
    <View
      className="absolute left-0 right-0 top-0"
      style={{ paddingTop: insets.top }}
    >
      {children}
    </View>
  )
}
