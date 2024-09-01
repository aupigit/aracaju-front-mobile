import { Text, TouchableOpacity, View } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'

export const PermissionSection = ({
  title,
  description,
  icon,
  granted,
  request,
}: {
  title: string
  description: string
  icon: 'bell' | 'map' | 'location-arrow'
  granted: boolean
  request: () => void
}) => (
  <View className="justify-center gap-2">
    <View className="flex-row items-center gap-2">
      <FontAwesome name={icon} size={20} color="black" />
      <Text className="text-lg font-bold">{title}</Text>
    </View>
    <Text className="pb-2 text-sm font-bold text-gray-400">{description}</Text>
    {granted ? (
      <View className="flex-row items-center justify-center gap-2 rounded-md bg-green-500 p-2">
        <FontAwesome name="check" size={20} color="white" />
        <Text className="text-center font-bold text-white">Permitido</Text>
      </View>
    ) : (
      <TouchableOpacity
        onPress={request}
        className="rounded-md bg-zinc-700 p-2"
      >
        <Text className="text-center font-bold text-white">Permitir</Text>
      </TouchableOpacity>
    )}
  </View>
)
