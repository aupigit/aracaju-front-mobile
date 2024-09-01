import { omit } from 'lodash'

import { ConfigApp, NewConfigApp } from '@/db/config-app'
import { db } from '@/lib/database'
import { APIConfigApp } from '@/services/online-services/config-app'

export const upsertConfigAppData = async (data: APIConfigApp[]) => {
  for (const config of data) {
    const newConfig: NewConfigApp = {
      id: config.id,
      name: config.name,
      data_type: config.data_type,
      data_config: config.data_config,
      description: config.description,
      created_at: config.created_at,
      updated_at: config.updated_at,
    }

    await db
      .insert(ConfigApp)
      .values(newConfig)
      .onConflictDoUpdate({
        target: ConfigApp.id,
        set: omit(newConfig, ['id']),
      })
      .execute()
  }
}
