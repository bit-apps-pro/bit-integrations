import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { saveConnection } from './connectionApi'
import { __ } from './i18nwrap'

export default function useConnectionAuthorize({
  validate,
  flowFn,
  buildSavePayload,
  buildConfigUpdate,
  onConnectionSaved,
  setConfig
}) {
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)

  const handleAuthorize = useCallback(async () => {
    const validationErrors = validate() || {}
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) return

    setIsLoading(true)

    try {
      const authResult = await flowFn()

      const saveRes = await saveConnection(buildSavePayload(authResult))

      if (!saveRes?.success) {
        setIsAuthorized(false)
        const reason = saveRes?.data?.data || saveRes?.data || ''
        toast.error(`${__('Failed to save connection Cause:', 'bit-integrations')}${reason}`)
        return
      }

      const connection = saveRes?.data?.data || null
      const configUpdate = buildConfigUpdate ? buildConfigUpdate(connection) : {}
      setConfig(prev => ({ ...prev, connection_id: connection?.id, ...configUpdate }))

      if (onConnectionSaved) await onConnectionSaved(connection)

      setIsAuthorized(true)
      toast.success(__('Authorized Successfully', 'bit-integrations'))
    } catch (error) {
      setIsAuthorized(false)
      toast.error(
        `${__('Authorization failed Cause:', 'bit-integrations')} ${error?.message || 'Unknown error'}`
      )
    } finally {
      setIsLoading(false)
    }
  }, [validate, flowFn, buildSavePayload, buildConfigUpdate, onConnectionSaved, setConfig])

  return { isLoading, isAuthorized, errors, setErrors, handleAuthorize }
}
