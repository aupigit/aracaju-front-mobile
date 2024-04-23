import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Button,
} from 'react-native'
import React, { useEffect, useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import { FontAwesome } from '@expo/vector-icons'
import { Controller, useForm } from 'react-hook-form'

export interface IImagesProps {
  title: string
  uri: string
  base64: string
  size?: number
  type?: string
}

interface PhonePhotosProps {
  images: IImagesProps[]
  setSelectedImage: React.Dispatch<React.SetStateAction<IImagesProps | null>>
  setImages: React.Dispatch<React.SetStateAction<IImagesProps[]>>
  setIsOpenPhoneLocaleModal: React.Dispatch<React.SetStateAction<boolean>>
  onImageUpdate: (newImage: IImagesProps) => void
}

const PhonePhotos: React.FC<PhonePhotosProps> = ({
  images,
  setSelectedImage,
  setIsOpenPhoneLocaleModal,
  setImages,
  onImageUpdate,
}) => {
  const [buttonLoading, setButtonLoading] = useState(false)

  useEffect(() => {
    ;(async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== 'granted') {
        console.error('Permission to access media library denied!')
      }
    })()
  }, [])

  const handleImagePick = async (title) => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0,
        base64: true,
      })

      if (!result.canceled) {
        const updatedImages = images.filter((image) => image.title !== title)
        setImages((prevImages) => [
          ...updatedImages,
          { title, uri: result.assets[0].uri, base64: result.assets[0].base64 },
        ])

        setValue(`images.${title}`, result.assets[0].uri)
      }
    } catch (error) {
      console.error('Error picking image:', error)
    }
  }

  const navigateToLinkOrHandleImagePick = (title) => {
    const filteredImage = images.find(
      (image) => image.title === title && image.uri !== undefined,
    )

    if (filteredImage) {
      setSelectedImage(filteredImage)
      setIsOpenPhoneLocaleModal(true)
    } else {
      handleImagePick(title)
    }
  }

  const removeImage = (title) => {
    setImages((prevImages) =>
      prevImages.filter((image) => !(image.title === title)),
    )
  }

  const { control, handleSubmit, setValue } = useForm()

  return (
    <ScrollView>
      <View className="container z-20 mt-20 flex-1 rounded-t-2xl bg-white">
        <View className="mt-16 flex-1 justify-start gap-5">
          <Text className="text-4xl font-bold text-black dark:text-white">
            Fotos do celular
          </Text>
          <Text className="text-xl text-black dark:text-white">
            Tire fotos do dispositivo para ter uma garantia dos serviços
          </Text>

          <View>
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-bold">Fotos Tiradas</Text>
            </View>
            <View className="border border-zinc-700/20 p-4 ">
              <View className="flex flex-row flex-wrap justify-between">
                {[
                  'Imagem frontal',
                  'Imagem lateral',
                  'Imagem imei',
                  'Imagem Traseira',
                ].map((title) => (
                  <View key={title} className="w-[48%]">
                    <Controller
                      control={control}
                      render={() => (
                        <>
                          <TouchableOpacity
                            onPress={() =>
                              navigateToLinkOrHandleImagePick(title)
                            }
                            className="relative mb-2 h-[150px] w-[100%] overflow-hidden rounded-md border border-black"
                          >
                            <View className="flex flex-col items-center justify-center">
                              {images
                                .filter(
                                  (image) =>
                                    image.title === title &&
                                    image.uri !== undefined,
                                )
                                .map((filteredImage) => (
                                  <View
                                    key={`${title}-${filteredImage.uri}`}
                                    className="relative h-full w-full"
                                  >
                                    <Image
                                      source={{ uri: filteredImage.uri }}
                                      alt=""
                                      className="h-full w-full"
                                    />

                                    <Pressable
                                      className="absolute right-2 top-2 z-10 size-8 items-center justify-center rounded-full bg-red-500"
                                      onPress={() => removeImage(title)}
                                    >
                                      <FontAwesome
                                        name="remove"
                                        size={17}
                                        color="white"
                                      />
                                    </Pressable>
                                  </View>
                                ))}
                              {images.find((image) => image.title === title) ===
                                undefined && (
                                <>
                                  <View
                                    key={`no-image-${title}`}
                                    className="h-[100%] items-center justify-center"
                                  >
                                    <FontAwesome
                                      name="image"
                                      size={50}
                                      color="black"
                                    />
                                  </View>
                                </>
                              )}
                            </View>
                            {images.find((image) => image.title === title) ===
                            undefined ? (
                              <View className="absolute bottom-0 left-0 w-full rounded-b-md border border-zinc-700/20 bg-red-200/60 px-4 py-1">
                                <Text className="text-sm">{title}</Text>
                              </View>
                            ) : (
                              <View className="absolute bottom-0 left-0 w-full rounded-b-md border border-zinc-700/20 bg-green-200/60 px-4 py-1">
                                <Text>{title}</Text>
                              </View>
                            )}
                          </TouchableOpacity>
                        </>
                      )}
                      name={`images.${title}`}
                      defaultValue=""
                    />
                  </View>
                ))}
              </View>
              <Text className="text-zinc-800/50">
                * Insira todas as imagens para prosseguir
              </Text>
            </View>
          </View>
          <View className="w-full">
            <View className="flex items-end justify-center">
              {buttonLoading ? (
                <Pressable className="w-157 my-5 bg-[#f25a38] px-10">
                  <ActivityIndicator size="small" color="#ffffff" />
                </Pressable>
              ) : images.length !== 1 ? (
                <Pressable
                  className="w-157 my-5 bg-[#f25a3850] px-8"
                  disabled={true}
                >
                  <Text>CONTINUAR</Text>
                </Pressable>
              ) : (
                <Pressable
                  className="w-157 my-5 bg-[#f25a38] px-8"
                  disabled={false}
                >
                  <Text>CONTINUAR</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

export default PhonePhotos
