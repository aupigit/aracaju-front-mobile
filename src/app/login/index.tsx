import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  Alert,
  ScrollView,
  Pressable,
  ActivityIndicator,
  TextInput,
} from 'react-native'
import * as LocalAuthentication from 'expo-local-authentication'
import NetInfo from '@react-native-community/netinfo'
import { Link, router } from 'expo-router'
import { z } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { useUser } from '@/contexts/UserContext'
import { zodResolver } from '@hookform/resolvers/zod'
import FormControl from './FormControl'
import { doLogin } from '@/services/authenticate'
import { Snackbar } from 'react-native-paper'

const authSchema = z.object({
  email: z
    .string({
      required_error: 'Email é obrigatório',
      invalid_type_error: 'Email precisa ser uma string',
    })
    .min(2, 'Email precisa ter pelo menos 2 caracteres')
    .email('Email precisa ser um email válido'),

  password: z
    .string({
      required_error: 'Senha é obrigatório',
      invalid_type_error: 'Senha precisa ser uma string',
    })
    .min(8, 'Senha precisa ter pelo menos 8 caracteres'),
})

export type AuthFormData = z.infer<typeof authSchema>

const Login = () => {
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

  const onSubmit = handleSubmit(async (data) => {
    try {
      setButtonLoading(true)
      // console.log(data)

      const response = await doLogin(data.email, data.password)
      // console.log(response)

      if (response && response.user) {
        setVisibleOK(!visibleOK)

        setTimeout(() => {
          setVisibleOK(!visibleOK)
          router.replace('/posts')
        }, 1000)
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
            Entrar na sua conta da Aracaju
          </Text>
          <Text className="text-xl text-black">
            Insira seus dados e explore todas as funcionalidades que temos a
            oferecer
          </Text>

          <FormControl
            buttonLoading={buttonLoading}
            control={control}
            errors={errors}
            onSubmit={onSubmit}
            setShowPassword={setShowPassword}
            showPassword={showPassword}
          />
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
        <Text className="text-lime-500">Usuário logado com sucesso.</Text>
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
        <Text className="text-red-500">
          Login falhou. Verifique suas credenciais
        </Text>
      </Snackbar>
    </ScrollView>
  )
}

export default Login
