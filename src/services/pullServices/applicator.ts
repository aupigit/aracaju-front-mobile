import { IApplicator } from '@/interfaces/IApplicator'
import { db } from '@/lib/database'

export const pullApplicatorData = async (applicatorData: IApplicator[]) => {
  for (const data of applicatorData) {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT OR IGNORE INTO Applicator (
            id,
            name,
            cpf,
            status,
            new_marker,
            edit_marker,
            is_leader,
            description,
            contract
        ) VALUES (?,?,?,?,?,?,?,?,?)`,
        [
          data.id,
          data.name,
          data.cpf,
          data.status ? 1 : 0,
          data.new_marker ? 1 : 0,
          data.edit_marker ? 1 : 0,
          data.is_leader ? 1 : 0,
          data.description,
          data.contract,
        ],
        () => console.log('Data inserted successfully in Applicator table'),
        (_, error) => {
          console.error('Error inserting data: ', error)
          return true
        },
      )
    })
  }
}
