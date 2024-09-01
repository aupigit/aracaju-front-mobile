import React, { createContext, ReactNode, useContext, useState } from 'react'
import { noop } from 'lodash'
import { useMutation } from 'react-query'

import { SyncModal } from '@/features/data-collection/components/sync-modal'
import { pushOfflineData } from '@/features/background-tasks/operations'
import {
  pullPointLastUpdatedAt,
  upsertPointData,
} from '@/services/pull-services/point-reference'
import { formatDate } from '@/utils/date'
import { findManyPointsReferences } from '@/services/online-services/points'
import { findConfigApp } from '@/services/online-services/config-app'
import { upsertConfigAppData } from '@/services/pull-services/config-app'
import { findManyPointType } from '@/services/online-services/point-type'
import { upsertPointTypeData } from '@/services/pull-services/point-type'
import { useDeviceFactoryId } from '@/features/device'
import {
  findDeviceByFactoryIdQuery,
  findOneApplicatorQuery,
} from '@/features/database/queries'

const toNil = () => null

const Context = createContext({
  startPushData: noop,
  startCompleteSync: noop,
})

export const SyncOperationsProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  const factoryId = useDeviceFactoryId()
  const [modalSync, setModalSync] = useState(false)

  const pushData = useMutation(async () => {
    const [device] = await findDeviceByFactoryIdQuery(factoryId).execute()
    const [applicator] = await findOneApplicatorQuery().execute()

    await pushOfflineData(device, applicator)
  })

  const pullPoints = useMutation(async () => {
    const points = await pullPointLastUpdatedAt()
      .then((date) => (date ? formatDate(new Date(date)) : null))
      .catch(toNil)
      .then((date) => findManyPointsReferences(date))

    // FIXME: shouldn't we discard inactive points?
    //  they're not shown anywhere
    return upsertPointData(points ?? [])
  })

  const pullConfigApp = useMutation(async () => {
    const configApps = await findConfigApp()

    return upsertConfigAppData(configApps ?? [])
  })

  const pullPointType = useMutation(async () => {
    const pointTypes = await findManyPointType()

    return upsertPointTypeData(pointTypes ?? [])
  })

  const handleCompleteSync = useMutation(async () => {
    setModalSync(true)
    await pushData.mutateAsync()
    await Promise.all([
      pullPoints.mutateAsync(),
      pullConfigApp.mutateAsync(),
      pullPointType.mutateAsync(),
    ])
  })

  return (
    <Context.Provider
      value={{
        startPushData: pushData.mutate,
        startCompleteSync: handleCompleteSync.mutate,
      }}
    >
      {children}
      {modalSync && (
        <SyncModal
          pushData={pushData}
          pullPoints={pullPoints}
          pullConfigApp={pullConfigApp}
          pullPointType={pullPointType}
          onClose={() => setModalSync(false)}
        />
      )}
    </Context.Provider>
  )
}

export const useSyncOperations = () => useContext(Context)
