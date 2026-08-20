import { useCallback, useMemo } from 'react'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useParams } from 'react-router'
import { __ } from '../../Utils/i18nwrap'
import LoaderSm from '../Loaders/LoaderSm'
import { useConnectionSwitch } from './ConnectionSwitchContext'
import 'react-multiple-select-dropdown-lite/dist/index.css'

const NEW_VALUE = '__new__'
const HINT_TEXT_STYLE = { opacity: 0.7 }
const CONTROL_ROW_STYLE = { gap: 8, alignItems: 'center', flexWrap: 'wrap' }

const buildConnectionOption = conn => {
  const accountName = conn.account_name || conn.connection_name
  const hasDifferentNames =
    conn.connection_name && conn.account_name && conn.connection_name !== conn.account_name

  return {
    label: hasDifferentNames
      ? `${conn.connection_name} (${accountName})`
      : conn.connection_name || accountName,
    value: String(conn.id)
  }
}

const getConnectionOptionById = (connections, connection_id) => {
  if (connection_id) return String(connection_id)
  if (connection_id === '') return NEW_VALUE
  if (Array.isArray(connections) && connections.length > 0) return ''

  return NEW_VALUE
}

export default function ConnectionAccountSelect({
  config,
  setConfig,
  connections,
  setShowNewConnection,
  isInfo,
  onRefresh,
  isRefreshing = false,
  onConnectionSelected
}) {
  const { integUrlName } = useParams()
  const connectionSwitch = useConnectionSwitch()
  const canSwitch = Boolean(isInfo && connectionSwitch?.enabled)
  const isSwitching = Boolean(connectionSwitch?.isSwitching)
  const dropdownValue = getConnectionOptionById(connections, config?.connection_id)

  const options = useMemo(
    () => [
      ...(Array.isArray(connections) ? connections.map(buildConnectionOption) : []),
      { label: __('+ Add new connection', 'bit-integrations'), value: NEW_VALUE }
    ],
    [connections]
  )

  const handleChange = useCallback(
    value => {
      if (canSwitch) {
        if (!value) return

        if (value === NEW_VALUE) {
          setShowNewConnection(true)
          return
        }

        setShowNewConnection(false)
        if (String(value) === String(config?.connection_id)) return

        connectionSwitch.onSwitch(value)
        return
      }

      const isNewConnection = value === NEW_VALUE
      setShowNewConnection(isNewConnection)

      if (isNewConnection) {
        setConfig(prev => ({ ...prev, connection_id: '' }))
        return
      }

      setConfig(prev => ({ ...prev, connection_id: value }))
      onConnectionSelected?.(value)
    },
    [
      canSwitch,
      connectionSwitch,
      config?.connection_id,
      setConfig,
      setShowNewConnection,
      onConnectionSelected
    ]
  )

  const connectionTitle = integUrlName
    ? `${integUrlName} ${__('Connections:', 'bit-integrations')}`
    : __('Connections:', 'bit-integrations')
  const fetchConnections = onRefresh
  const isLoading = isRefreshing

  return (
    <div className="connection-select-wrap">
      <div className="mt-3">
        <b>{connectionTitle}</b>
      </div>
      <div className="flx mt-1" style={CONTROL_ROW_STYLE}>
        <MultiSelect
          key={`${dropdownValue}-${options.length}`}
          className="btcd-paper-drpdwn msl-wrp-options w-6"
          defaultValue={dropdownValue}
          options={options}
          onChange={handleChange}
          singleSelect
          closeOnSelect
          showSearch
          placeholder={
            isLoading
              ? __('Loading connections...', 'bit-integrations')
              : __('Select a connection...', 'bit-integrations')
          }
          disabled={canSwitch ? isSwitching || isLoading : isInfo || isLoading}
        />
        {isSwitching && <LoaderSm size={20} clr="#022217" />}
        {(canSwitch || !isInfo) && fetchConnections && (
          <button
            type="button"
            className="icn-btn sh-sm tooltip"
            style={{ '--tooltip-txt': `'${__('Refresh connections', 'bit-integrations')}'` }}
            onClick={fetchConnections}
            disabled={isLoading}
            aria-label={__('Refresh connections', 'bit-integrations')}>
            {isLoading ? <LoaderSm size={16} clr="#022217" /> : <>&#x21BB;</>}
          </button>
        )}
        {isLoading && (
          <span className="connection-loading-txt" aria-live="polite">
            {__('Loading connections...', 'bit-integrations')}
          </span>
        )}
      </div>
      {canSwitch && (
        <div className="mt-1 f-sm" style={HINT_TEXT_STYLE}>
          {connectionSwitch.switched
            ? __(
                'Connection updated. Continue to review the integration config against the new account.',
                'bit-integrations'
              )
            : __(
                'Pick another connection or add a new one — this integration is updated instantly.',
                'bit-integrations'
              )}
        </div>
      )}
    </div>
  )
}
