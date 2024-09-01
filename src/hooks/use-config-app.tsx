import { inArray } from 'drizzle-orm'
import { useLiveQuery } from 'drizzle-orm/expo-sqlite'
import { keyBy, camelCase } from 'lodash'

import { ConfigApp, SelectConfigApp } from '@/db/config-app'
import { useDB } from '@/features/database'

type ConfigKey =
  | 'volume_escala'
  | 'volume_bti'
  | 'coleta_clima'
  | 'coleta_vento'
  | 'raio_do_ponto'

export const useConfigApp = (
  keys: ConfigKey[],
): Record<string, SelectConfigApp | undefined> => {
  const db = useDB()
  const query = useLiveQuery(
    db.select().from(ConfigApp).where(inArray(ConfigApp.name, keys)),
  )

  return keyBy(query.data, (data) => camelCase(data.name))
}
