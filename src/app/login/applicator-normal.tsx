import React, { useEffect, useReducer } from 'react'
import {
  View,
  Text,
  Alert,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native'
import * as LocalAuthentication from 'expo-local-authentication'
import NetInfo from '@react-native-community/netinfo'
import { router } from 'expo-router'
import { z } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { doLogin } from '@/services/onlineServices/authenticate'
import { useDevice } from '@/features/device'
import { FontAwesome } from '@expo/vector-icons'
import { useToaster } from '@/features/toaster'
import { useChangeAsyncStore } from '@/hooks'
import { useUpsertUser } from '@/features/session/hooks/use-upsert-user'

const authSchema = z.object({
  deviceToken: z
    .string({
      required_error: 'Token é obrigatório',
      invalid_type_error: 'Token precisa ser uma string',
    })
    .min(8, 'Token precisa ter pelo menos 8 caracteres'),
})

export type AuthFormData = z.infer<typeof authSchema>

const ApplicatorNormalLogin = () => {
  const upsertUser = useUpsertUser()
  const asyncStore = useChangeAsyncStore()
  const toaster = useToaster()
  const device = useDevice()
  const [showToken, toggleShowToken] = useReducer((state) => !state, __DEV__)
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  })

  const onSubmit = handleSubmit(async (data: AuthFormData) => {
    try {
      const response = await doLogin({
        email: device.factory_id,
        password: data.deviceToken,
      })

      if (response?.user) {
        await asyncStore.multiSet([
          ['token', response.access],
          ['refresh_token', response.refresh],
        ])
        await upsertUser(response.user)

        toaster.makeToast({
          type: 'success',
          message: 'Token verificado com sucesso.',
        })

        router.navigate('/login/applicator-cpf-verify')
      } else {
        toaster.makeToast({
          type: 'success',
          message: 'Login falhou. Verifique suas credenciais',
        })
      }
    } catch (error) {
      console.error('[applicator-login]', error)

      toaster.makeToast({
        type: 'success',
        message: 'Login falhou. Verifique suas credenciais',
      })
    }
  })

  useEffect(() => {
    const checkBiometricSupport = async () => {
      const netInfo = await NetInfo.fetch()

      if (!netInfo.isConnected || !netInfo.isInternetReachable) {
        const isHardwareSupported = await LocalAuthentication.hasHardwareAsync()
        const isBiometricSupported = await LocalAuthentication.isEnrolledAsync()

        if (isHardwareSupported && isBiometricSupported) {
          const result = await LocalAuthentication.authenticateAsync()

          if (result.success) {
            Alert.alert('Autenticação', 'Login bem-sucedido!')
          } else {
            Alert.alert('Autenticação', 'Falha no login!')
          }
        } else {
          Alert.alert(
            'Erro',
            'A autenticação biométrica não é suportada neste dispositivo.',
          )
        }
      }
    }

    checkBiometricSupport()
  }, [])

  return (
    <ScrollView className="flex-1">
      <View className="container h-screen flex-1 bg-white">
        <View className="flex-1 justify-center gap-5">
          <Text className="text-4xl font-bold text-black">
            Entrar com o verificador de serviço
          </Text>
          <Text className="text-xl text-black">
            Insira seus dados e explore todas as funcionalidades que temos a
            oferecer
          </Text>
          <View className="gap-5">
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <View className="relative">
                  <TextInput
                    onBlur={onBlur}
                    onChangeText={(value) => onChange(value)}
                    value={value}
                    placeholder="Token"
                    secureTextEntry={!showToken}
                    className=" rounded-md border border-zinc-700/20 p-2 pl-4"
                  />
                  <Pressable className=" absolute right-5 top-3">
                    <FontAwesome
                      name={showToken ? 'eye-slash' : 'eye'}
                      size={24}
                      color="black"
                      onPress={toggleShowToken}
                    />
                  </Pressable>
                  {errors && (
                    <Text className="absolute -bottom-5 text-sm text-red-500">
                      {errors.deviceToken?.message}
                    </Text>
                  )}
                </View>
              )}
              name="deviceToken"
              rules={{ required: true }}
              defaultValue=""
            />

            {isSubmitting ? (
              <Pressable className="rounded-md bg-zinc-500 p-3">
                <ActivityIndicator size="small" color="#fff" />
              </Pressable>
            ) : (
              <Pressable
                onPress={onSubmit}
                className="rounded-md bg-zinc-500 p-3"
              >
                <Text className="text-md text-center font-bold text-white">
                  ENTRAR
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

export default ApplicatorNormalLogin
