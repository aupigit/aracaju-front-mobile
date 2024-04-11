import { View, Text, Modal, Pressable, Button, TextInput } from 'react-native'
import React, { useState } from 'react'
import { IPoint } from '@/interfaces/IPoint'
import { RadioButton } from 'react-native-paper'
import { boolean } from 'zod'

interface ApplicationApplicateModalProps {
  modalVisible: boolean
  setModalVisible: (modalVisible: boolean) => void
  selectedPoint: IPoint
}

const ApplicationApplicateModal = ({
  modalVisible,
  setModalVisible,
  selectedPoint,
}: ApplicationApplicateModalProps) => {
  const [recipienteChecked, setRecipienteChecked] = useState('true')
  const [fichaChecked, setFichaChecked] = useState(false)
  const [placaChecked, setPlacaChecked] = useState(false)

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible)
      }}
    >
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
      >
        <View style={{ backgroundColor: 'white', padding: 20 }}>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
              Executar aplicação
            </Text>
            <Pressable
              onPress={() => {
                setModalVisible(!modalVisible)
              }}
            >
              <Text>Fechar</Text>
            </Pressable>
          </View>

          <TextInput
            placeholder="Observação"
            style={{
              borderWidth: 1,
              borderColor: 'gray',
              marginBottom: 10,
              padding: 5,
            }}
          />
          <TextInput
            placeholder="Volume BTI"
            style={{
              borderWidth: 1,
              borderColor: 'gray',
              marginBottom: 10,
              padding: 5,
            }}
          />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <Text>Recipiente:</Text>
            <RadioButton.Group
              onValueChange={(value) => setRecipienteChecked(value)}
              value={recipienteChecked}
            >
              <RadioButton.Item label="Sim " value="true" />
              <RadioButton.Item label="Não " value="false" />
            </RadioButton.Group>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <Text>Ficha:</Text>
            <RadioButton.Group
              onValueChange={(value) => setRecipienteChecked(value)}
              value={recipienteChecked}
            >
              <RadioButton.Item label="Sim " value="true" />
              <RadioButton.Item label="Não " value="false" />
            </RadioButton.Group>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <Text>Placa:</Text>
            <RadioButton.Group
              onValueChange={(value) => setRecipienteChecked(value)}
              value={recipienteChecked}
            >
              <RadioButton.Item label="Sim " value="true" />
              <RadioButton.Item label="Não " value="false" />
            </RadioButton.Group>
          </View>

          <Button title="Selecionar Imagem" />

          <Button
            title="Finalizar"
            onPress={() => {
              // Aqui você pode usar os estados dos checkboxes para suas funcionalidades
              console.log('Recipiente:', recipienteChecked)
              console.log('Ficha:', fichaChecked)
              console.log('Placa:', placaChecked)

              setModalVisible(!modalVisible)
            }}
          />
        </View>
      </View>
    </Modal>
  )
}

export default ApplicationApplicateModal
