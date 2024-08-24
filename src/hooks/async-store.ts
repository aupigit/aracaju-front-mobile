import { useCallback, useEffect } from 'react'
import { useQuery } from 'react-query'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { intersection } from 'lodash'

export type AvailableKey = 'token' | 'refresh_token'

// react query doesn't support individual keys, so we'll have to hack
// around for it
const listeners: ((keys: AvailableKey[]) => void)[] = []

export const useAsyncStoreValues = (keys: AvailableKey[]) => {
  const data = useQuery([keys.join('-')], async () => {
    const values = await AsyncStorage.multiGet(keys)

    return values.map((pair) => pair[1])
  })

  const refetch = data.refetch
  useEffect(() => {
    const handleChange = (changedKeys: AvailableKey[]) => {
      if (intersection(keys, changedKeys).length) {
        // eslint-disable-next-line no-void
        void refetch()
      }
    }

    listeners.push(handleChange)
    return () => {
      listeners.splice(listeners.indexOf(handleChange), 1)
    }
  }, [refetch, keys])

  return data
}

export const useChangeAsyncStore = () => {
  return {
    multiRemove: useCallback(async (keys: AvailableKey[]) => {
      await AsyncStorage.multiRemove(keys)

      listeners.forEach((listener) => listener(keys))
    }, []),
    multiSet: useCallback(async (pairs: [AvailableKey, string][]) => {
      await AsyncStorage.multiSet(pairs)
      const removedKeys = pairs.map((pair) => pair[0])

      listeners.forEach((listener) => listener(removedKeys))
    }, []),
  }
}

export const asyncStoreSetItem = (key: AvailableKey, value: string) => {
  return AsyncStorage.setItem(key, value)
}

export const asyncStoreGetItem = (key: AvailableKey) => {
  return AsyncStorage.getItem(key)
}
