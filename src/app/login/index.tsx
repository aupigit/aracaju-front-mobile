import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  Alert,
  ScrollView,
  Button,
  Pressable,
  ActivityIndicator,
  TextInput,
} from 'react-native'
import * as LocalAuthentication from 'expo-local-authentication'
import NetInfo from '@react-native-community/netinfo'
import { Link, router } from 'expo-router'
// import { View, FormControl, Input, Stack, useToast } from 'native-base'
import { z } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { useUser } from '@/contexts/UserContext'
import { zodResolver } from '@hookform/resolvers/zod'
import { FontAwesome } from '@expo/vector-icons'

const authSchema = z.object({
  email: z
    .string({
      required_error: 'Email é obrigatório',
      invalid_type_error: 'Email precisa ser uma string',
    })
    .min(2, 'Email precisa ter pelo menos 2 caracteres')
    .email(),

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

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  })

  const onSubmit = handleSubmit(async (data) => {
    console.log(data)
    router.replace('/posts')
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

          <View className="gap-3">
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  onBlur={onBlur}
                  onChangeText={(value) => onChange(value)}
                  value={value}
                  placeholder="Email"
                  className=" rounded-md border border-zinc-700/20 p-2"
                />
              )}
              name="email"
              rules={{ required: true }}
              defaultValue=""
            />
            {errors.email && <Text>This is required.</Text>}

            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <View className="relative">
                  <TextInput
                    onBlur={onBlur}
                    onChangeText={(value) => onChange(value)}
                    value={value}
                    placeholder="Password"
                    secureTextEntry={!showPassword}
                    className=" rounded-md border border-zinc-700/20 p-2"
                  />
                  <Pressable className=" absolute right-5 top-3">
                    <FontAwesome
                      name={showPassword ? 'eye-slash' : 'eye'}
                      size={24}
                      color="black"
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  </Pressable>
                </View>
              )}
              name="password"
              rules={{ required: true }}
              defaultValue=""
            />
            {errors.password && <Text>This is required.</Text>}

            <Button title="Submit" onPress={onSubmit} />
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

export default Login
