import { useCallback, useEffect, useMemo, useState } from 'react'
import BackIcn from '../../Icons/BackIcn'
import { isWpPluginCheckType } from '../../Utils/connectionAuth'
import { verifyPluginActivation, listConnections } from '../../Utils/connectionApi'
import { __ } from '../../Utils/i18nwrap'
import LoaderSm from '../Loaders/LoaderSm'
import Note from '../Utilities/Note'
import TutorialLink from '../Utilities/TutorialLink'
import AddNewConnection from './AddNewConnection'
import ConnectionAccountSelect from './ConnectionAccountSelect'

const STEP_ONE_STYLE = { width: 900, height: 'auto' }
const ERROR_TEXT_STYLE = { color: 'red', fontSize: '15px' }

export default function Authorization({
  config,
  setConfig,
  step,
  setStep,
  isInfo,
  tutorialTitle,
  tutorialLinks,
  extraFields,
  noteDetails = undefined,
  authDetails = {},
  customAuthFields,
  onConnectionSelected
}) {
  const [errors, setErrors] = useState({ name: '' })
  const [connections, setConnections] = useState([])
  const [showNewConnection, setShowNewConnection] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [isPendingPostAuth, setIsPendingPostAuth] = useState(false)

  const appSlug = config?.app_slug || config?.type
  const isWpPluginCheck = isWpPluginCheckType(authDetails?.authType)

  const refreshConnections = useCallback(async () => {
    if (!appSlug) {
      setConnections([])
      setShowNewConnection(true)
      return []
    }

    setIsLoading(true)

    try {
      const res = await listConnections(appSlug)
      const savedConnections =
        res?.success && Array.isArray(res?.data?.data) ? res.data.data : []

      setConnections(savedConnections)
      setShowNewConnection(savedConnections.length === 0)
      return savedConnections
    } catch {
      return []
    } finally {
      setIsLoading(false)
    }
  }, [appSlug])

  useEffect(() => {
    if (isWpPluginCheck) {
      return
    }

    refreshConnections()
  }, [appSlug, isWpPluginCheck])

  const handleNameChange = useCallback(
    event => {
      const { name, value } = event.target
      setConfig(prev => ({ ...prev, [name]: value }))

      if (name === 'name') {
        setErrors(prev => ({ ...prev, name: '' }))
      }
    },
    [setConfig]
  )

  const pluginCheck = authDetails?.pluginCheck

  const handleVerifyPluginActivation = useCallback(async () => {
    if (!config?.name?.trim()) {
      setErrors({ name: __('Integration name is required', 'bit-integrations') })
      return
    }

    const hasGroups = Array.isArray(pluginCheck?.groups) && pluginCheck.groups.length > 0
    const hasChecks = Array.isArray(pluginCheck?.checks) && pluginCheck.checks.length > 0

    if (!hasGroups && !hasChecks) {
      setErrors({
        name: __('Plugin checks are not defined for this integration', 'bit-integrations')
      })
      return
    }

    setIsVerifying(true)
    setErrors({})

    try {
      const res = await verifyPluginActivation({
        logic: pluginCheck.logic || 'AND',
        ...(hasGroups ? { groups: pluginCheck.groups } : { checks: pluginCheck.checks })
      })

      if (res?.success) {
        setIsVerified(true)
      } else {
        setIsVerified(false)
        setErrors({
          name: res?.data || __('Plugin is not installed or activated', 'bit-integrations')
        })
      }
    } catch (error) {
      setIsVerified(false)
      setErrors({
        name: error?.message || __('Plugin check failed', 'bit-integrations')
      })
    } finally {
      setIsVerifying(false)
    }
  }, [config?.name, pluginCheck])

  const handleNext = useCallback(() => {
    if (!config?.name?.trim()) {
      setErrors({ name: __('Integration name is required', 'bit-integrations') })
      return
    }

    setStep(2)
  }, [config?.name, setStep])

  const fireConnectionSelected = useCallback(
    async connectionId => {
      if (!onConnectionSelected || !connectionId) return
      setIsPendingPostAuth(true)
      try {
        await onConnectionSelected(connectionId)
      } finally {
        setIsPendingPostAuth(false)
      }
    },
    [onConnectionSelected]
  )

  const canGoNext = isWpPluginCheck
    ? isVerified
    : Boolean(config?.connection_id) && !isPendingPostAuth

  const pageStyle = useMemo(() => (step === 1 ? STEP_ONE_STYLE : undefined), [step])

  const handleConnectionSaved = useCallback(async savedConnection => {
    const refreshedConnections = await refreshConnections()
    const savedConnectionId = savedConnection?.id

    if (savedConnectionId) {
      const matchedConnection = refreshedConnections.find(
        conn => String(conn.id) === String(savedConnectionId)
      )
      const selectedConnectionId = matchedConnection?.id || savedConnectionId
      setConfig(prev => ({ ...prev, connection_id: selectedConnectionId }))
      setShowNewConnection(false)
      await fireConnectionSelected(selectedConnectionId)
      return
    }

    if (refreshedConnections.length > 0) {
      setShowNewConnection(false)
    }
  }, [refreshConnections, setConfig, fireConnectionSelected])

  return (
    <div className="btcd-stp-page" style={pageStyle}>
      {tutorialTitle && <TutorialLink title={tutorialTitle} links={tutorialLinks || {}} />}

      <div className="mt-3">
        <b>{__('Integration Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleNameChange}
        name="name"
        value={config?.name || ''}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={ERROR_TEXT_STYLE}>{errors.name || ''}</div>

      {!isWpPluginCheck && (
        <>
          <ConnectionAccountSelect
            config={config}
            setConfig={setConfig}
            connections={connections}
            setShowNewConnection={setShowNewConnection}
            isInfo={isInfo || isLoading}
            onRefresh={refreshConnections}
            isRefreshing={isLoading}
            onConnectionSelected={fireConnectionSelected}
          />

          {showNewConnection && !isInfo && (extraFields || null)}

          {showNewConnection && !isInfo && (
            <AddNewConnection
              authDetails={authDetails}
              config={config}
              setConfig={setConfig}
              isInfo={isInfo}
              customAuthFields={customAuthFields}
              onConnectionSaved={handleConnectionSaved}
            />
          )}
        </>
      )}

      {isWpPluginCheck && !isInfo && (
        <button
          onClick={handleVerifyPluginActivation}
          className="btn btcd-btn-lg purple mt-3 sh-sm flx"
          type="button"
          disabled={isVerified || isVerifying}>
          {isVerified
            ? __('Authorized ✔', 'bit-integrations')
            : __('Authorize', 'bit-integrations')}
          {isVerifying && <LoaderSm size={20} clr="#022217" className="ml-2" />}
        </button>
      )}

      {!isInfo && canGoNext && (
        <button
          onClick={handleNext}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          <BackIcn className="ml-1 rev-icn" />
        </button>
      )}
      <br />
      <br />

      {noteDetails && (
        <Note
          note={noteDetails?.note}
          isInstructional={noteDetails?.isInstructional || false}
          isHeadingNull={noteDetails?.isHeadingNull || false}
          maxWidth={noteDetails?.maxWidth || '450px'}>
          {noteDetails?.children || null}
        </Note>
      )}
    </div>
  )
}
