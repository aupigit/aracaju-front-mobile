import { db } from '@/lib/database'

export const doTrailsOffline = async (
  coordinates: number[],
  latitude: number,
  longitude: number,
  altitude: number,
  acuracia: number,
  applicator: number,
  contract: number,
) => {
  const body = {
    coordinates,
    from_txt: 'teste offline',
    latitude,
    longitude,
    altitude,
    acuracia,
    device: 1,
    applicator,
    contract,
  }

  try {
    const data = db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO Trails (
          device,
          applicator,
          marker,
          from_txt,
          latitude,
          longitude,
          altitude,
          accuracy,
          created_ondevice_at,
          contract,
          transmition
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          body.device,
          body.applicator,
          JSON.stringify(body.coordinates),
          body.from_txt,
          body.latitude,
          body.longitude,
          body.altitude,
          body.acuracia,
          new Date().toISOString(),
          body.contract,
          'offline',
        ],
        () => console.log('Data inserted successfully in Trails table'),
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
