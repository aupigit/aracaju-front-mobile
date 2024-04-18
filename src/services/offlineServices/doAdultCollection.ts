import { db } from '@/lib/database'

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
    coordinates,
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
        `INSERT INTO AdultCollection (
          pointreference,
          device,
          applicator,
          marker,
          from_txt,
          latitude,
          longitude,
          altitude,
          accuracy,
          wind,
          climate,
          temperature,
          humidity,
          insects_number,
          transmition
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          body.pointreference,
          body.device,
          body.applicator,
          JSON.stringify(body.coordinates),
          body.from_txt,
          body.latitude,
          body.longitude,
          body.altitude,
          body.accuracy,
          body.wind,
          body.climate ? 1 : 0,
          body.temperature ? 1 : 0,
          body.humidity,
          body.insects_number,
          'offline',
        ],
        () =>
          console.log('Data inserted successfully in Adult Collection table'),
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
