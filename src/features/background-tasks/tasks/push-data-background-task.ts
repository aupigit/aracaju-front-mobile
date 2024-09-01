import NetInfo from '@react-native-community/netinfo'
import * as TaskManager from 'expo-task-manager'
import * as BackgroundFetch from 'expo-background-fetch'

import { pushOfflineData } from '@/features/background-tasks/operations'
import { useMutation } from 'react-query'
import {
  findOneApplicatorQuery,
  findOneDeviceQuery,
} from '@/features/database/queries'

const TASK_NAME = 'PUSH_DATA_TASK'

TaskManager.defineTask(TASK_NAME, async () => {
  const netInfo = await NetInfo.fetch()

  if (!netInfo.isConnected || !netInfo.isInternetReachable) {
    console.info('[pull-data-background-task] no internet connection, skipping')

    return BackgroundFetch.BackgroundFetchResult.NoData
  }

  const [device] = await findOneDeviceQuery().execute()
  const [applicator] = await findOneApplicatorQuery().execute()
  if (!device || !applicator) {
    console.info('[push-offline-data] no device or applicator found, skipping')

    return BackgroundFetch.BackgroundFetchResult.NoData
  }

  await pushOfflineData(device, applicator)

  return BackgroundFetch.BackgroundFetchResult.NewData
})

function registerTask() {
  return BackgroundFetch.registerTaskAsync(TASK_NAME, {
    minimumInterval: 60 * 5, // 5 minutes
    stopOnTerminate: false,
    startOnBoot: true,
  })
}

function unregisterTask() {
  return BackgroundFetch.unregisterTaskAsync(TASK_NAME)
}

export const pushDataBackgroundTask = {
  useRegisterTask: () => useMutation(registerTask),
  useUnregisterTask: () => useMutation(unregisterTask),
}
