import React, { useEffect, useState } from 'react'
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
import { useUser } from '@/contexts/UserContext'
import { zodResolver } from '@hookform/resolvers/zod'
import { doLogin } from '@/services/onlineServices/authenticate'
import { Snackbar } from 'react-native-paper'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useDevice } from '@/features/device'
import { useApplicator } from '@/contexts/ApplicatorContext'
import { FontAwesome } from '@expo/vector-icons'

const authSchema = z.object({
  password: z
    .string({
      required_error: 'Senha é obrigatório',
      invalid_type_error: 'Senha precisa ser uma string',
    })
    .min(8, 'Senha precisa ter pelo menos 8 caracteres'),
})

export type AuthFormData = z.infer<typeof authSchema>

const ApplicatorNormalLogin = () => {
  const { device, refetchDevice } = useDevice()
  const { fetchApplicatorData } = useApplicator()
  const { loginUser } = useUser()
  const [showPassword, setShowPassword] = useState(false)
  const [buttonLoading, setButtonLoading] = useState(false)
  const [visibleOK, setVisibleOK] = useState(false)
  const [visibleERROR, setVisibleERROR] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  })

  const onDismissSnackBarOK = () => setVisibleOK(false)
  const onDismissSnackBarERROR = () => setVisibleERROR(false)

  const onSubmit = handleSubmit(async (data: AuthFormData) => {
    await refetchDevice()
    await fetchApplicatorData()
    try {
      setButtonLoading(true)

      const response = await doLogin(device.factory_id, data.password)

      if (response?.user) {
        setVisibleOK(!visibleOK)
        AsyncStorage.setItem('token_service_id', data.password)
        setTimeout(() => {
          setVisibleOK(!visibleOK)
          router.navigate('/login/applicator-cpf-verify')
        }, 1000)

        loginUser(response.user)
      } else {
        setVisibleERROR(!visibleERROR)

        setTimeout(() => {
          setVisibleERROR(!visibleERROR)
        }, 3000)
      }
    } catch (error) {
      setTimeout(() => setButtonLoading(false), 3000)
      setVisibleERROR(!visibleERROR)

      setTimeout(() => {
        setVisibleERROR(!visibleERROR)
      }, 3000)
    } finally {
      setButtonLoading(false)
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
                    secureTextEntry={!showPassword}
                    className=" rounded-md border border-zinc-700/20 p-2 pl-4"
                  />
                  <Pressable className=" absolute right-5 top-3">
                    <FontAwesome
                      name={showPassword ? 'eye-slash' : 'eye'}
                      size={24}
                      color="black"
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  </Pressable>
                  {errors && (
                    <Text className="absolute -bottom-5 text-sm text-red-500">
                      {errors.password?.message}
                    </Text>
                  )}
                </View>
              )}
              name="password"
              rules={{ required: true }}
              defaultValue=""
            />

            {buttonLoading ? (
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
      <Snackbar
        visible={visibleOK}
        onDismiss={onDismissSnackBarOK}
        action={{
          textColor: '#00ff00',
          label: 'Fechar',
          onPress: () => {
            setVisibleOK(false)
          },
        }}
      >
        <Text className="text-zinc-700">
          Líder de equipe logado com sucesso.
        </Text>
      </Snackbar>
      <Snackbar
        visible={visibleERROR}
        onDismiss={onDismissSnackBarERROR}
        action={{
          textColor: '#ff0000',
          label: 'Fechar',
          onPress: () => {
            setVisibleOK(false)
          },
        }}
      >
        <Text className="text-zinc-700">
          Login falhou. Verifique suas credenciais
        </Text>
      </Snackbar>
    </ScrollView>
  )
}

export default ApplicatorNormalLogin
