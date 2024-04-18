import { IApplication } from '@/interfaces/IPoint'
import { db } from '@/lib/database'

export const doApplicationOffline = async (
  coordinates: number[],
  latitude: number,
  longitude: number,
  altitude: number,
  acuracia: number,
  volumebti: number,
  container: boolean,
  card: boolean,
  plate: boolean,
  observation: string,
  image: string,
  contract: number,
  pointreference: number,
  applicator: number,
) => {
  const body = {
    marker: {
      type: 'Point',
      coordinates,
    },
    from_txt: 'string',
    latitude,
    longitude,
    altitude,
    acuracia,
    volumebti,
    container,
    card,
    plate,
    observation,
    status: 'Em dia',
    image,
    pointreference,
    device: 1,
    applicator,
    contract,
  }

  try {
    const data = db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO Application (
          pointreference,
          device,
          applicator,
          marker,
          from_txt,
          latitude,
          longitude,
          altitude,
          acuracia,
          volumebti,
          container,
          card,
          plate,
          observation,
          status,
          image,
          created_ondevice_at,
          transmition
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          body.pointreference,
          body.device,
          body.applicator,
          JSON.stringify(body.marker),
          body.from_txt,
          body.latitude,
          body.longitude,
          body.altitude,
          body.acuracia,
          body.volumebti,
          body.container ? 1 : 0, // Convert boolean to number
          body.card ? 1 : 0, // Convert boolean to number
          body.plate ? 1 : 0, // Convert boolean to number
          body.observation,
          body.status,
          body.image,
          new Date().toISOString(), // created_ondevice_at
          'offline', // transmition
        ],
        () => console.log('Data inserted successfully in Application table'),
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

export const findManyApplicationsOffline = (): Promise<IApplication[]> => {
  const result = db.transaction((tx) => {
    tx.executeSql(
      `SELECT * FROM Application;`,
      [],
      (_, { rows: { _array } }) => {
        return _array
      },
      (_, error) => {
        console.log('Error retrieving data: ', error)
        return true
      },
    )
  })
  return result as unknown as Promise<IApplication[]>
}
