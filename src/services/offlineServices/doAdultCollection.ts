// AdultCollection

import { db } from '@/lib/database'

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

export const doAdultCollectionOffline = (
  coordinates: number[],
  latitude: number,
  longitude: number,
  altitude: number,
  accuracy: number,
  wind: string,
  climate: string,
  temperature: string,
  humidity: string,
  insects_number: number,
  observation: string,
  contract: number,
  image: string,
  applicator: number,
  pointreference: number,
) => {
  const body = {
    marker: {
      type: 'Point',
      coordinates,
    },
    from_txt: 'string',
    latitude,
    longitude,
    altitude: 0,
    accuracy: 0,
    wind,
    climate,
    temperature,
    humidity,
    status: 'Em dia',
    observation,
    insects_number,
    pointreference,
    device: 1,
    applicator,
    image,
    contract,
  }

  try {
    const data = db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO AdultCollection (body) VALUES (?);`,
        [JSON.stringify(body)],
        () => console.log('Data inserted successfully'),
        (_, error) => {
          console.log('Error inserting data: ', error)
          return true
        },
      )
    })
    return data
  } catch (error) {
    console.error(error)
    throw error
  }
}
