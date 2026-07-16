import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { authorizeConnection, saveConnection } from '../../Utils/connectionApi'
import { AUTH_TYPES, defaultEncryptKeys } from '../../Utils/connectionAuth'
import {
  normalizeAdditionalHeaders,
  resolveConfigValue,
  resolveHeaderTemplates,
  resolvePayloadTemplates,
  resolveTemplate
} from '../../Utils/connectionTemplates'
import { __ } from '../../Utils/i18nwrap'
import LoaderSm from '../Loaders/LoaderSm'

const ERROR_TEXT_STYLE = { color: 'red', fontSize: '15px' }

const getAuthPayload = ({ authType, apiEndpoint, method, authData, authDetails, appSlug }) => {
  const resolvedApiEndpoint = resolveConfigValue(apiEndpoint, authData)
  const resolvedHeaders = resolveConfigValue(authDetails?.headers, authData)
  const resolvedPayload = resolveConfigValue(authDetails?.payload, authData)
  const additionalHeaders = resolveHeaderTemplates(normalizeAdditionalHeaders(resolvedHeaders), authData)
  const sslVerify = authDetails?.ssl_verify !== false

  // Extra fields captured first; standard auth keys below always win on collision.
  // Reserved auth_details keys: value, token, key, addTo, username, password, ssl_verify
  const extraAuthDetails = (authDetails?.extraFields || []).reduce((acc, { name }) => {
    if (authData[name] != null) acc[name] = authData[name]
    return acc
  }, {})

  const basePayload = {
    app_slug: appSlug,
    auth_type: authType,
    api_endpoint: resolveTemplate(resolvedApiEndpoint, authData),
    method: method || 'GET',
    auth_details: {
      ...extraAuthDetails,
      ssl_verify: sslVerify
    },
    headers: additionalHeaders
  }

  if (resolvedPayload !== undefined) {
    basePayload.payload = resolvePayloadTemplates(resolvedPayload, authData)
  }

  if (authType === AUTH_TYPES.API_KEY) {
    basePayload.auth_details = {
      ...extraAuthDetails,
      key: authDetails?.key || 'X-API-Key',
      value: authData.api_key,
      addTo: authData.addTo || authDetails?.addTo || 'header',
      ssl_verify: sslVerify
    }
    return basePayload
  }

  if (authType === AUTH_TYPES.BASIC_AUTH) {
    basePayload.auth_details = {
      ...extraAuthDetails,
      username: authData.username,
      password: authData.password,
      ssl_verify: sslVerify
    }
    return basePayload
  }

  if (authType === AUTH_TYPES.BEARER_TOKEN) {
    basePayload.auth_details = {
      ...extraAuthDetails,
      token: authData.token,
      ssl_verify: sslVerify
    }
  }

  return basePayload
}

const getValidationErrors = (authType, authData, extraFields = [], authDetails = {}) => {
  const nextErrors = {}

  if (!authData.connectionName?.trim()) {
    nextErrors.connectionName = __('Connection name is required', 'bit-integrations')
  }

  if (authType === AUTH_TYPES.API_KEY && !authData.api_key?.trim()) {
    nextErrors.api_key = __('API key is required', 'bit-integrations')
  }

  if (authType === AUTH_TYPES.BASIC_AUTH) {
    if (!authData.username?.trim()) {
      nextErrors.username = __('Username is required', 'bit-integrations')
    }

    if (!authDetails?.allowEmptyPassword && !authData.password?.trim()) {
      nextErrors.password = __('Password is required', 'bit-integrations')
    }
  }

  if (authType === AUTH_TYPES.BEARER_TOKEN && !authData.token?.trim()) {
    nextErrors.token = __('Bearer token is required', 'bit-integrations')
  }

  extraFields.forEach(field => {
    const value = authData[field.name]
    const normalized = typeof value === 'string' ? value.trim() : value
    if (field.required && (normalized === '' || normalized == null)) {
      nextErrors[field.name] = `${field.label} ${__('is required', 'bit-integrations')}`
    }
  })

  return nextErrors
}

export default function ApiConnection({
  authDetails,
  config,
  setConfig,
  isInfo = false,
  customAuthFields,
  onConnectionSaved
}) {
  const [authData, setAuthData] = useState({})
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const { authType, apiEndpoint, method } = authDetails || {}

  const handleChange = useCallback(event => {
    const { name, value } = event.target

    setAuthData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }, [])

  const handleAuthorize = useCallback(async () => {
    const validationErrors = getValidationErrors(
      authType,
      authData,
      authDetails?.extraFields,
      authDetails
    )
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    const payload = getAuthPayload({
      authType,
      apiEndpoint,
      method,
      authData,
      authDetails,
      appSlug: config?.app_slug || config?.type
    })

    setIsLoading(true)

    try {
      const authorizeRes = await authorizeConnection(payload)

      if (!authorizeRes?.success) {
        setIsAuthorized(false)
        toast.error(
          `${__('Authorization failed Cause:', 'bit-integrations')}${
            authorizeRes?.data?.data || authorizeRes?.data || 'Unknown error'
          }. ${__('please try again', 'bit-integrations')}`
        )
        return
      }

      const saveRes = await saveConnection({
        app_slug: config?.app_slug || config?.type,
        auth_type: authType,
        connection_name: authData.connectionName,
        account_name: authData.connectionName,
        auth_details: payload.auth_details,
        encrypt_keys: authDetails?.encryptKeys || defaultEncryptKeys[authType] || []
      })

      if (!saveRes?.success) {
        toast.error(
          `${__('Failed to save connection Cause:', 'bit-integrations')}${
            saveRes?.data?.data || saveRes?.data || ''
          }. ${__('please try again', 'bit-integrations')}`
        )
        return
      }

      const connection = saveRes?.data?.data || null
      const persistedExtraFields = (authDetails?.extraFields || []).reduce((acc, field) => {
        const { name } = field

        if (field.persistToConfig === false) {
          return acc
        }

        if (authData[name] != null) {
          acc[name] = authData[name]
        }
        return acc
      }, {})

      setConfig(prev => ({ ...prev, connection_id: connection?.id, ...persistedExtraFields }))

      if (onConnectionSaved) {
        await onConnectionSaved(connection)
      }

      setIsAuthorized(true)
      toast.success(__('Authorized Successfully', 'bit-integrations'))
    } catch (error) {
      setIsAuthorized(false)
      toast.error(
        `${__('Authorization failed Cause:', 'bit-integrations')} ${
          error?.message || 'Unknown error'
        }. ${__('please try again', 'bit-integrations')}`
      )
    } finally {
      setIsLoading(false)
    }
  }, [
    apiEndpoint,
    authData,
    authDetails,
    authType,
    config?.app_slug,
    config?.type,
    method,
    onConnectionSaved,
    setConfig
  ])

  return (
    <>
      <div className="mt-3">
        <b>{__('Connection Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleChange}
        name="connectionName"
        value={authData.connectionName || ''}
        type="text"
        placeholder={__('Connection Name...', 'bit-integrations')}
      />
      <div style={ERROR_TEXT_STYLE}>{errors.connectionName || ''}</div>

      {customAuthFields}

      {authDetails?.extraFields?.map(field => (
        <div key={field.name}>
          <div className="mt-3">
            <b>{field.label}:</b>
          </div>
          {field.type === 'select' ? (
            <select
              className="btcd-paper-inp w-6 mt-1"
              onChange={handleChange}
              name={field.name}
              value={authData[field.name] || ''}
              disabled={isInfo}>
              <option value="">{field.placeholder || `${field.label}...`}</option>
              {(field.options || []).map(option => (
                <option key={option.value || option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              className="btcd-paper-inp w-6 mt-1"
              onChange={handleChange}
              name={field.name}
              value={authData[field.name] || ''}
              type={field.type || 'text'}
              placeholder={field.placeholder || `${field.label}...`}
              disabled={isInfo}
            />
          )}
          <div style={ERROR_TEXT_STYLE}>{errors[field.name] || ''}</div>
        </div>
      ))}

      {authType === AUTH_TYPES.API_KEY && (
        <>
          <div className="mt-3">
            <b>{__('API Key:', 'bit-integrations')}</b>
          </div>
          <input
            className="btcd-paper-inp w-6 mt-1"
            onChange={handleChange}
            name="api_key"
            value={authData.api_key || ''}
            type="text"
            placeholder={__('api_key', 'bit-integrations')}
            disabled={isInfo}
          />
          <div style={ERROR_TEXT_STYLE}>{errors.api_key || ''}</div>
        </>
      )}

      {authType === AUTH_TYPES.BASIC_AUTH && (
        <>
          <div className="mt-3">
            <b>{__('Username:', 'bit-integrations')}</b>
          </div>
          <input
            className="btcd-paper-inp w-6 mt-1"
            onChange={handleChange}
            name="username"
            value={authData.username || ''}
            type="text"
            placeholder={__('Username...', 'bit-integrations')}
            disabled={isInfo}
          />
          <div style={ERROR_TEXT_STYLE}>{errors.username || ''}</div>

          {!authDetails?.allowEmptyPassword && (
            <>
              <div className="mt-3">
                <b>{__('Password:', 'bit-integrations')}</b>
              </div>
              <input
                className="btcd-paper-inp w-6 mt-1"
                onChange={handleChange}
                name="password"
                value={authData.password || ''}
                type="password"
                placeholder={__('Password...', 'bit-integrations')}
                disabled={isInfo}
              />
              <div style={ERROR_TEXT_STYLE}>{errors.password || ''}</div>
            </>
          )}
        </>
      )}

      {authType === AUTH_TYPES.BEARER_TOKEN && (
        <>
          <div className="mt-3">
            <b>{__('Bearer Token:', 'bit-integrations')}</b>
          </div>
          <input
            className="btcd-paper-inp w-6 mt-1"
            onChange={handleChange}
            name="token"
            value={authData.token || ''}
            type="text"
            placeholder={__('Bearer token...', 'bit-integrations')}
            disabled={isInfo}
          />
          <div style={ERROR_TEXT_STYLE}>{errors.token || ''}</div>
        </>
      )}

      <button
        onClick={handleAuthorize}
        className="btn btcd-btn-lg purple mt-3 sh-sm flx"
        type="button"
        disabled={isInfo || isLoading}>
        {isAuthorized ? __('Authorized ✔', 'bit-integrations') : __('Authorize', 'bit-integrations')}
        {isLoading && <LoaderSm size={20} clr="#022217" className="ml-2" />}
      </button>
    </>
  )
}
