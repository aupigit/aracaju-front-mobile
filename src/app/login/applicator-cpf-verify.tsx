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
import { zodResolver } from '@hookform/resolvers/zod'
import { Snackbar } from 'react-native-paper'
import { doApplicatorVerificate } from '@/services/onlineServices/applicatorVerificate'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useDevice } from '@/features/device'
import { useApplicator } from '@/contexts/ApplicatorContext'
import maskCPF from '@/utils/cpfMask'

const applicatorVerifySchema = z.object({
  cpfApplicator: z.string({
    required_error: 'CPF é obrigatório',
    invalid_type_error: 'CPF precisa ser uma string',
  }),
})

export type ApplicatorVerifyData = z.infer<typeof applicatorVerifySchema>

const ApplicatorCPFVerify = () => {
  const [buttonLoading, setButtonLoading] = useState(false)
  const [visibleOK, setVisibleOK] = useState(false)
  const [visibleERROR, setVisibleERROR] = useState(false)

  const { refetchDevice } = useDevice()
  const { fetchApplicatorData } = useApplicator()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicatorVerifyData>({
    resolver: zodResolver(applicatorVerifySchema),
  })

  const onDismissSnackBarOK = () => setVisibleOK(false)

  const onDismissSnackBarERROR = () => setVisibleERROR(false)

  const onSubmit = handleSubmit(async (data) => {
    // FIXME: why do we need these refetches?
    await refetchDevice()
    await fetchApplicatorData()
    try {
      setButtonLoading(true)

      const response = await doApplicatorVerificate(data.cpfApplicator)

      if (response && !response?.is_leader) {
        setVisibleOK(!visibleOK)
        AsyncStorage.setItem('first_time_on_application', '1')
        setTimeout(() => {
          setVisibleOK(!visibleOK)
          router.navigate('/points-reference')
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

  // Autenticação por Biometria
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

          <View className="gap-5">
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <View className="relative">
                  <TextInput
                    onBlur={onBlur}
                    onChangeText={(val) => {
                      const formattedCPF = maskCPF(val)
                      onChange(formattedCPF)
                    }}
                    value={value}
                    placeholder="Adicione o seu CPF"
                    className=" rounded-md border border-zinc-700/20 p-2 pl-4"
                    keyboardType="numeric"
                  />
                  {errors && (
                    <Text className="absolute -bottom-5 text-sm text-red-500">
                      {errors.cpfApplicator?.message}
                    </Text>
                  )}
                </View>
              )}
              name="cpfApplicator"
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

export default ApplicatorCPFVerify
