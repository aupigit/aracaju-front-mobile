import React, { useEffect, useState } from 'react'
import { View, Text, Alert, ScrollView } from 'react-native'
import * as LocalAuthentication from 'expo-local-authentication'
import NetInfo from '@react-native-community/netinfo'
import { router } from 'expo-router'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { useUser } from '@/contexts/UserContext'
import { zodResolver } from '@hookform/resolvers/zod'
import FormControl from './FormControl'
import { Snackbar } from 'react-native-paper'
import { doApplicatorVerificate } from '@/services/applicatorVerificate'

const applicatorVerificateSchema = z.object({
  cpfApplicator: z.string({
    required_error: 'CPF é obrigatório',
    invalid_type_error: 'CPF precisa ser uma string',
  }),
})

export type ApplicatorVerificateData = z.infer<
  typeof applicatorVerificateSchema
>

const Login = () => {
  const [buttonLoading, setButtonLoading] = useState(false)
  const [visibleOK, setVisibleOK] = useState(false)
  const [visibleERROR, setVisibleERROR] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicatorVerificateData>({
    resolver: zodResolver(applicatorVerificateSchema),
  })

  const onDismissSnackBarOK = () => setVisibleOK(false)
  const onDismissSnackBarERROR = () => setVisibleERROR(false)

  const onSubmit = handleSubmit(async (data) => {
    console.log('Aplicador data', data.cpfApplicator)
    try {
      setButtonLoading(true)

      const response = await doApplicatorVerificate(data.cpfApplicator)

      if (response && !response?.is_leader) {
        setVisibleOK(!visibleOK)

        setTimeout(() => {
          setVisibleOK(!visibleOK)
          router.replace('/posts')
        }, 1000)
        console.log('response', response)
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
            Entrar como aplicador
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
        <Text className="text-zinc-700">Aplicador logado com sucesso.</Text>
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

export default Login
