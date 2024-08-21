import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Text } from 'react-native'
import { Snackbar } from 'react-native-paper'

type Toast = {
  id: number
  message: string
  type: 'success' | 'error'
}

const Context = createContext({
  makeToast: (_: Omit<Toast, 'id'>) => {
    console.warn('No context found, ignoring toast')
  },
})

const RenderToast = ({
  toast,
  onCleanup,
}: {
  toast: Toast
  onCleanup: (id: number) => void
}) => {
  const [removed, setRemoved] = useState(false)

  return (
    <Snackbar
      duration={Snackbar.DURATION_SHORT}
      visible={!removed}
      onDismiss={() => {
        onCleanup(toast.id)
      }}
      action={{
        textColor: '#00ff00',
        label: 'Fechar',
        onPress: () => {
          setRemoved(true)
          onCleanup(toast.id)
        },
      }}
    >
      <Text className="text-white">{toast.message}</Text>
    </Snackbar>
  )
}

export const ToasterProvider = ({ children }: { children: ReactNode }) => {
  const id = useRef(0)
  const [toasts, setToasts] = useState<Toast[]>([])

  const makeToast = useCallback((toast: Omit<Toast, 'id'>) => {
    setToasts((prevToasts) => {
      return [...prevToasts, { id: id.current++, ...toast }]
    })
  }, [])

  const onCleanup = useCallback((id: number) => {
    setToasts((prevToasts) => {
      return prevToasts.filter((toast) => toast.id !== id)
    })
  }, [])

  return (
    <Context.Provider value={useMemo(() => ({ makeToast }), [toasts])}>
      {children}
      {toasts.map((toast) => (
        <RenderToast key={toast.id} toast={toast} onCleanup={onCleanup} />
      ))}
    </Context.Provider>
  )
}

export const useToaster = () => useContext(Context)
