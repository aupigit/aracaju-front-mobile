import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import { InvalidCredentialsError, UnauthorizedError } from '@/errors/webapp'
import { getHeaders } from './get-headers'
import AsyncStorage from '@react-native-async-storage/async-storage'

export interface IHttpRequestParams {
  extraHeaders?: Record<string, string>
  showToastOnGenericErrorOnly?: boolean
  overwriteEndpoint?: string
  enableRequestThrottle?: boolean
  axiosConfig?: Omit<
    AxiosRequestConfig,
    'headers' | 'method' | 'data' | 'cancelToken'
  >
}

export interface IPostRequestParams extends IHttpRequestParams {
  body?: object | string
  image?: string
  status?: string
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

type WithToken<T> = T & { access: string }

const httpRequest = async <T>(
  uri: string,
  method: HttpMethod,
  props: IPostRequestParams = {},
  isRetry = false,
): Promise<WithToken<T>> => {
  const headers = await getHeaders(props)

  const endpoint = `${process.env.EXPO_PUBLIC_BASE_API_URL}/${uri}`

  const body = props.body ? { data: props.body } : {}

  const params = {
    ...(props.axiosConfig || {}),
    ...body,
    headers,
    method,
  }

  try {
    const response = await axios<WithToken<T>>(endpoint, params)

    return response.data
  } catch (error) {
    console.error(
      'Axios error. Reveja conexão com a internet ',
      (error as Error).message,
    )
    if (
      error instanceof AxiosError &&
      error?.response?.status &&
      [401, 403, 405].includes(error.response.status)
    ) {
      const token = await AsyncStorage.getItem('token')

      if (!isRetry && token && error.response.data.code === 'token_not_valid') {
        const refresh = await AsyncStorage.getItem('refresh')
        try {
          const refreshedResponse = await httpRequest(
            'token/refresh/',
            'POST',
            { body: { refresh } },
            true,
          )

          // FIXME: .data is already the return of `httpRequest`, does this work?
          await AsyncStorage.setItem('token', refreshedResponse.data.access)
          return await httpRequest(endpoint, method, props, true)
        } catch (refreshError) {
          console.error('[api] got error on token refresh', refreshError)

          if (
            refreshError instanceof AxiosError &&
            refreshError?.response?.data?.code !== 'token_not_valid'
          ) {
            console.error('[api] user token is not valid')

            // FIXME: we should throw here
            return undefined!
          }
        }
      } else if (
        error.response.data.detail ===
        'No active account found with the given credentials'
      ) {
        throw new InvalidCredentialsError()
      }

      throw new UnauthorizedError(
        'Você não tem permissão para acessar esta página',
      )
    }
    throw error
  }
}

export const get = <Response>(uri: string, params?: IHttpRequestParams) =>
  httpRequest<Response>(uri, 'GET', params, false)

export const post = <Response>(uri: string, params?: IPostRequestParams) => {
  return httpRequest<Response>(uri, 'POST', params, false)
}

export const put = <Response>(uri: string, params?: IPostRequestParams) =>
  httpRequest<Response>(uri, 'PUT', params, false)

export const patch = <Response>(uri: string, params?: IPostRequestParams) =>
  httpRequest<Response>(uri, 'PATCH', params, false)

export const del = <Response>(uri: string, props?: IHttpRequestParams) =>
  httpRequest<Response>(uri, 'DELETE', props, false)
