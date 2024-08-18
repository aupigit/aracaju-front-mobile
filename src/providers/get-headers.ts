import AsyncStorage from '@react-native-async-storage/async-storage'
import { IHttpRequestParams } from './api'

export const getHeaders = async (props: IHttpRequestParams) => {
  let token = null
  if (typeof window !== 'undefined') {
    token = await AsyncStorage.getItem('token')
  }
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {}

  return {
    ...authHeader,
    'Content-type': 'application/json',
    ...props.extraHeaders,
  }
}
