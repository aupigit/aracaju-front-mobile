import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native'
import React from 'react'
import { Controller } from 'react-hook-form'
import maskCPF from '@/utils/cpfMask'

interface FormControlProps {
  control: any
  errors: any
  buttonLoading: boolean
  onSubmit: () => void
}

const FormControl = ({
  buttonLoading,
  control,
  errors,
  onSubmit,
}: FormControlProps) => {
  return (
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
