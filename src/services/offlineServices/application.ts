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
    pointreference: 3,
    device: 1,
    applicator: 2,
  }

  try {
    const data = db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO Application (body) VALUES (?);`,
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
