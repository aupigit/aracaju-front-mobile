import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import { InvalidCredentialsError, UnauthorizedError } from '@/errors/webapp'
import { getHeaders } from './get-headers'
import { asyncStoreGetItem, asyncStoreSetItem } from '@/hooks'

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

const httpRequest = async <T>(
  uri: string,
  method: HttpMethod,
  props: IPostRequestParams = {},
  isRetry = false,
): Promise<T> => {
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
    const response = await axios<T>(endpoint, params)

    return response.data
  } catch (error) {
    console.error('[api], error at', endpoint, (error as Error).message)

    if (
      error instanceof AxiosError &&
      error?.response?.status &&
      [401, 403, 405].includes(error.response.status)
    ) {
      const token = await asyncStoreGetItem('token')

      if (!isRetry && token && error.response.data.code === 'token_not_valid') {
        const refresh = await asyncStoreGetItem('refresh_token')
        try {
          const refreshedResponse = await httpRequest<{
            access: string
          }>('token/refresh/', 'POST', { body: { refresh } }, true)

          await asyncStoreSetItem('token', refreshedResponse.access)

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
