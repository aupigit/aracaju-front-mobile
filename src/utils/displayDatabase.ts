import { db } from '@/lib/database'

const tableNames = [
  'Region',
  'SubRegion',
  'City',
  'PointStatus',
  'PointType',
  'PointReference',
  'Application',
  'AdultCollection',
  'Trails',
  'FlowRate',
  'Customer',
  'Contract',
  'ContractManager',
  'SystemAdministrator',
  'User',
  'Applicator',
  'Device',
  'ConfigApp',
]

export const displayAllTables = () => {
  return new Promise((resolve, reject) => {
    const data = {}

    db.transaction((tx) => {
      tableNames.forEach((tableName, index, array) => {
        tx.executeSql(
          `SELECT * FROM ${tableName}`,
          [],
          (_, { rows: { _array } }) => {
            data[tableName] = _array
            if (index === array.length - 1) resolve(data)
          },
          (_, error) => {
            console.log(`Error fetching data from ${tableName}: `, error)
            reject(error)
            return true
          },
        )
      })
    })
  })
}
