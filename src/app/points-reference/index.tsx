import {
  PermissionsPage,
  PointsReferencePage,
} from '@/features/data-collection/pages'
import { UserCurrentLocationProvider } from '@/features/data-collection/context'

export default function PointsReference() {
  return (
    <PermissionsPage>
      <UserCurrentLocationProvider>
        <PointsReferencePage />
      </UserCurrentLocationProvider>
    </PermissionsPage>
  )
}
