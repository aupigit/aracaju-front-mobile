import { View, Text, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { displayAllTables } from '@/utils/displayDatabase'
import { Table, Row } from 'react-native-table-component'

const Database = () => {
  const insets = useSafeAreaInsets()

  const [data, setData] = useState({})

  useEffect(() => {
    displayAllTables().then((result) => setData(result))
  }, [])

  return (
    <ScrollView horizontal>
      <ScrollView>
        {Object.keys(data).map((tableName) => (
          <Table
            key={tableName}
            borderStyle={{ borderWidth: 2, borderColor: '#c8e1ff' }}
          >
            <Row
              data={[tableName]}
              style={{ height: 40, backgroundColor: '#f1f8ff' }}
              textStyle={{ margin: 6 }}
            />
            {data[tableName].map((row, index) => (
              <>
                {index === 0 && (
                  <Row
                    data={Object.keys(row)}
                    textStyle={{ margin: 6 }}
                    widthArr={new Array(Object.keys(row).length).fill(100)}
                  />
                )}
                <Row
                  data={Object.values(row)}
                  textStyle={{ margin: 6 }}
                  widthArr={new Array(Object.values(row).length).fill(100)}
                />
              </>
            ))}
          </Table>
        ))}
      </ScrollView>
    </ScrollView>
  )
}

export default Database
