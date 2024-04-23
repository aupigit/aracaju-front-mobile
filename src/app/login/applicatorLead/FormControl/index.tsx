import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native'
import React from 'react'
import { Controller } from 'react-hook-form'
import { FontAwesome } from '@expo/vector-icons'

interface FormControlProps {
  control: any
  errors: any
  buttonLoading: boolean
  onSubmit: () => void
  showPassword: boolean
  setShowPassword: (value: boolean) => void
}

const FormControl = ({
  buttonLoading,
  control,
  errors,
  onSubmit,
  setShowPassword,
  showPassword,
}: FormControlProps) => {
  return (
    <View className="gap-5">
      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="relative">
            <TextInput
              onBlur={onBlur}
              onChangeText={(value) => onChange(value)}
              value={value}
              placeholder="Email"
              className=" rounded-md border border-zinc-700/20 p-2 pl-4"
            />
            {errors && (
              <Text className="absolute -bottom-5 text-sm text-red-500">
                {errors.email?.message}
              </Text>
            )}
          </View>
        )}
        name="email"
        rules={{ required: true }}
        defaultValue=""
      />
      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="relative">
            <TextInput
              onBlur={onBlur}
              onChangeText={(value) => onChange(value)}
              value={value}
              placeholder="Senha"
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
        <Pressable onPress={onSubmit} className="rounded-md bg-zinc-500 p-3">
          <Text className="text-md text-center font-bold text-white">
            ENTRAR
          </Text>
        </Pressable>
      )}
    </View>
  )
}

export default FormControl
