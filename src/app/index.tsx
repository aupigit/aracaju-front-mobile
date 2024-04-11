import { View, Text, Image, Pressable, Linking, Button } from 'react-native'
import React, { useEffect, useState } from 'react'
import { router } from 'expo-router'
import * as SQLite from 'expo-sqlite'

const Home = () => {
  const [count, setCounter] = useState(0)
  // const [data, setData] = useState([])

  const handleCounter = () => {
    setCounter(count + 1)
    router.replace('login')
  }

  const db = SQLite.openDatabase('db.name')
  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS MyModel (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      description TEXT
    );`,
        [],
        () => console.log('Table created successfully'),
        (_, error) => {
          console.log('Error creating table: ', error)
          return true
        },
      )
    })
  })

  // const handleClick = () => {
  //   db.transaction((tx) => {
  //     tx.executeSql(
  //       `INSERT INTO MyModel (name, description) VALUES (?, ?);`,
  //       ['Test Name 1', 'Test Description 1'],
  //       () => console.log('Data inserted successfully'),
  //       (_, error) => {
  //         console.log('Error inserting data: ', error)
  //         return true
  //       },
  //     )
  //   })
  // }

  // const handleRetrieve = () => {
  //   db.transaction((tx) => {
  //     tx.executeSql(
  //       `SELECT * FROM MyModel;`,
  //       [],
  //       (_, { rows: { _array } }) => setData(_array),
  //       (_, error) => {
  //         console.log('Error retrieving data: ', error)
  //         return true
  //       },
  //     )
  //   })
  // }

  return (
    <View className="flex-1 items-center justify-center gap-5">
      <View className="size-32">
        <Image
          source={require('../public/aupi_logo.jpeg')}
          alt=""
          className="h-full w-full"
        />
      </View>

      <View>
        <Text className="text-center text-2xl font-bold">
          Bem-vindo ao template padrão da
        </Text>
        <Pressable onPress={() => Linking.openURL('https://aupi.com.br')}>
          <Text className="text-center text-xl font-bold text-[#5178be]">
            Aupi Soluções em TI
          </Text>
        </Pressable>
      </View>

      <View>
        <Button
          color={'#5178be'}
          title="CLIQUE AQUI"
          onPress={handleCounter}
        ></Button>
        {/* <Button
          color={'#5178be'}
          title="RETORNE AQUI"
          onPress={handleRetrieve}
        ></Button> */}
        {/* {data?.map((data) => (
          <Text key={data.id}>
            {data.name} - {data.description}
          </Text>
        ))} */}

        <View>
          {count > 0 && (
            <View className=" w-full items-center justify-center p-5">
              <Text className="text-lg">{count}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  )
}

export default Home
