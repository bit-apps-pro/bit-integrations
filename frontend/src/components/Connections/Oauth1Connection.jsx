import { useCallback, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { authorizeConnection, saveConnection } from '../../Utils/connectionApi'
import { AUTH_TYPES, defaultEncryptKeys } from '../../Utils/connectionAuth'
import {
  buildCallbackState,
  createOauthChannelKey,
  getCallbackState,
  openOauthPopup
} from '../../Utils/oauthHelper'
import { __ } from '../../Utils/i18nwrap'
import { APP_CONFIG } from '../../config/app'
import LoaderSm from '../Loaders/LoaderSm'
import CopyText from '../Utilities/CopyText'

const ERROR_TEXT_STYLE = { color: 'red', fontSize: '15px' }

const resolveTemplate = (template, data) => {
  if (!template) return ''
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const val = data[key]
    if (val == null) return ''
    return typeof val === 'string' ? val.replace(/\/+$/, '') : String(val)
  })
}

const appendQueryParam = (url, key, value) => {
  if (value == null || value === '') return
  url.searchParams.append(key, String(value))
}

const buildOauth1AuthUrl = (authEndpoint, extraParams = {}) => {
  const url = new URL(authEndpoint.url)
  const queryParams = authEndpoint.queryParams || {}

  Object.entries(queryParams).forEach(([key, value]) => appendQueryParam(url, key, value))
  Object.entries(extraParams).forEach(([key, value]) => appendQueryParam(url, key, value))

  return url.toString()
}

const normalizeAdditionalHeaders = headers => {
  if (!headers || typeof headers !== 'object') return {}

  return Object.entries(headers).reduce((acc, [key, value]) => {
    const normalizedKey = String(key || '').trim()
    const normalizedValue = value == null ? '' : String(value).trim()

    if (normalizedKey && normalizedValue) {
      acc[normalizedKey] = normalizedValue
    }

    return acc
  }, {})
}

const resolveHeaderTemplates = (headers, data) => {
  if (!headers || typeof headers !== 'object') return {}

  return Object.entries(headers).reduce((acc, [key, value]) => {
    acc[key] = typeof value === 'string' ? resolveTemplate(value, data) : value
    return acc
  }, {})
}

const resolvePayloadTemplates = (payload, data) => {
  if (Array.isArray(payload)) {
    return payload.map(item => resolvePayloadTemplates(item, data))
  }

  if (payload && typeof payload === 'object') {
    return Object.entries(payload).reduce((acc, [key, value]) => {
      acc[key] = resolvePayloadTemplates(value, data)
      return acc
    }, {})
  }

  if (typeof payload === 'string') {
    return resolveTemplate(payload, data)
  }

  return payload
}

const resolveConfigValue = (value, data) => {
  if (typeof value === 'function') {
    return value(data)
  }

  return value
}

const normalizePopupResponse = popupResponse => {
  if (popupResponse && typeof popupResponse === 'object') return popupResponse

  if (typeof popupResponse === 'string') {
    const parsed = {}
    const source = popupResponse.replace(/^#/, '').replace(/^\?/, '')
    const params = new URLSearchParams(source)
    for (const [key, value] of params.entries()) {
      if (value) parsed[key] = value
    }
    return parsed
  }

  return {}
}

const getOauth1Payload = ({
  authDetails,
  formData,
  accessToken,
  accessTokenSecret,
  consumerKeyParam,
  tokenParam
}) => {
  const resolvedApiEndpoint = resolveConfigValue(authDetails?.apiEndpoint, formData)
  const resolvedHeaders = resolveConfigValue(authDetails?.headers, formData)
  const resolvedPayload = resolveConfigValue(authDetails?.payload, formData)
  const additionalHeaders = resolveHeaderTemplates(
    normalizeAdditionalHeaders(resolvedHeaders),
    formData
  )
  const sslVerify = authDetails?.ssl_verify !== false

  const extraAuthDetails = (authDetails?.extraFields || []).reduce((acc, { name }) => {
    if (formData[name] != null) acc[name] = formData[name]
    return acc
  }, {})

  const payload = {
    auth_type: AUTH_TYPES.OAUTH1,
    api_endpoint: resolveTemplate(resolvedApiEndpoint, formData),
    method: authDetails?.method || 'GET',
    auth_details: {
      ...extraAuthDetails,
      consumer_key: formData.clientId,
      consumer_secret: formData.clientSecret || '',
      access_token: accessToken,
      access_token_secret: accessTokenSecret || '',
      consumer_key_param: consumerKeyParam,
      token_param: tokenParam,
      addTo: authDetails?.addTo || 'query',
      ssl_verify: sslVerify
    },
    headers: additionalHeaders
  }

  if (authDetails?.signatureMethod) {
    payload.auth_details.signature_method = authDetails.signatureMethod
  }

  if (resolvedPayload !== undefined) {
    payload.payload = resolvePayloadTemplates(resolvedPayload, formData)
  }

  return payload
}

export default function Oauth1Connection({
  authDetails,
  config,
  setConfig,
  isInfo = false,
  customAuthFields,
  onConnectionSaved
}) {
  const [formData, setFormData] = useState({})
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)

  const callbackUrl = useMemo(
    () => authDetails?.callbackUrl || getCallbackState(),
    [authDetails?.callbackUrl]
  )

  const resolvedAuthEndpoint = useMemo(() => {
    if (!authDetails?.authCodeEndpoint?.url) return null

    return {
      ...authDetails.authCodeEndpoint,
      url: resolveTemplate(authDetails.authCodeEndpoint.url, formData)
    }
  }, [authDetails?.authCodeEndpoint, formData])

  const requireClientSecret = authDetails?.requireClientSecret !== false
  const consumerKeyParam = authDetails?.consumerKeyParam || 'oauth_consumer_key'
  const tokenParam = authDetails?.tokenParam || 'oauth_token'
  const responseTokenField = authDetails?.responseTokenField || tokenParam
  const responseTokenSecretField = authDetails?.responseTokenSecretField || 'oauth_token_secret'

  const handleChange = useCallback(event => {
    const { name, value } = event.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }, [])

  const validate = useCallback(() => {
    const nextErrors = {}
    const extraFields = authDetails?.extraFields || []

    if (!formData.connectionName?.trim()) {
      nextErrors.connectionName = __('Connection name is required', 'bit-integrations')
    }

    if (!formData.clientId?.trim()) {
      nextErrors.clientId = __('Client ID is required', 'bit-integrations')
    }

    if (requireClientSecret && !formData.clientSecret?.trim()) {
      nextErrors.clientSecret = __('Client secret is required', 'bit-integrations')
    }

    extraFields.forEach(field => {
      if (field.required && !formData[field.name]?.trim()) {
        nextErrors[field.name] = `${field.label} ${__('is required', 'bit-integrations')}`
      }
    })

    if (!resolvedAuthEndpoint?.url) {
      nextErrors.authorize = __('OAuth1 authorization URL is required', 'bit-integrations')
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }, [authDetails?.extraFields, formData, requireClientSecret, resolvedAuthEndpoint?.url])

  const saveOauth1Connection = useCallback(
    async payload => {
      const saveRes = await saveConnection({
        app_slug: config?.app_slug || config?.type,
        auth_type: AUTH_TYPES.OAUTH1,
        connection_name: formData.connectionName,
        account_name: formData.connectionName,
        auth_details: payload.auth_details,
        encrypt_keys: authDetails?.encryptKeys || defaultEncryptKeys[AUTH_TYPES.OAUTH1] || []
      })

      if (!saveRes?.success) {
        const reason = saveRes?.data?.data || saveRes?.data || ''
        toast.error(`${__('Failed to save connection Cause:', 'bit-integrations')}${reason}`)
        return null
      }

      const connection = saveRes?.data?.data || null
      const persistedExtraFields = (authDetails?.extraFields || []).reduce((acc, { name }) => {
        if (formData[name] != null) acc[name] = formData[name]
        return acc
      }, {})

      setConfig(prev => ({ ...prev, connection_id: connection?.id, ...persistedExtraFields }))

      if (onConnectionSaved) await onConnectionSaved(connection)

      setIsAuthorized(true)
      toast.success(__('Authorized Successfully', 'bit-integrations'))
      return connection
    },
    [authDetails?.encryptKeys, authDetails?.extraFields, config, formData, onConnectionSaved, setConfig]
  )

  const handleAuthorize = useCallback(async () => {
    if (!validate()) return

    const declaredQueryParams = resolvedAuthEndpoint?.queryParams || {}
    const queryParams = { ...declaredQueryParams }
    const authExtraParams = {}
    const callbackUrlParam = authDetails?.callbackUrlParam || ''
    const stateParam = authDetails?.stateParam || 'state'

    if (!queryParams[consumerKeyParam]) {
      authExtraParams[consumerKeyParam] = formData.clientId
    }

    if (callbackUrlParam && !queryParams[callbackUrlParam]) {
      authExtraParams[callbackUrlParam] = callbackUrl
    }

    setIsLoading(true)

    try {
      const oauthChannelKey = createOauthChannelKey()
      const callbackState = buildCallbackState(oauthChannelKey)

      const authUrl = buildOauth1AuthUrl(
        {
          ...resolvedAuthEndpoint,
          queryParams
        },
        {
          ...authExtraParams,
          ...(queryParams[stateParam] ? {} : { [stateParam]: callbackState })
        }
      )

      const popupResponse = normalizePopupResponse(
        await openOauthPopup(
          authUrl,
          authDetails?.authorizationWindowLabel || 'OAuth1',
          { channelKey: oauthChannelKey, includeLegacyFallback: true }
        )
      )

      if (popupResponse?.error) {
        throw new Error(
          popupResponse.error === 'popup_blocked'
            ? __('Popup blocked. Please allow popups and try again.', 'bit-integrations')
            : popupResponse.error_description ||
                __('Authorization window closed before completing.', 'bit-integrations')
        )
      }

      const accessToken =
        popupResponse?.[responseTokenField] || popupResponse?.[tokenParam] || popupResponse?.token || ''
      const accessTokenSecret =
        popupResponse?.[responseTokenSecretField] || popupResponse?.oauth_token_secret || ''

      if (!accessToken) {
        throw new Error(__('Authorization token missing', 'bit-integrations'))
      }

      const payload = getOauth1Payload({
        authDetails,
        formData,
        accessToken,
        accessTokenSecret,
        consumerKeyParam,
        tokenParam
      })

      if (!authDetails?.skipAuthorizationCheck) {
        const authorizeRes = await authorizeConnection(payload)

        if (!authorizeRes?.success) {
          throw new Error(
            authorizeRes?.data?.data?.message ||
              authorizeRes?.data?.message ||
              authorizeRes?.data?.data ||
              authorizeRes?.data ||
              __('Authorization failed', 'bit-integrations')
          )
        }
      }

      await saveOauth1Connection(payload)
    } catch (error) {
      setIsAuthorized(false)
      toast.error(`${__('Authorization failed Cause:', 'bit-integrations')} ${error?.message || 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }, [
    authDetails,
    callbackUrl,
    consumerKeyParam,
    formData,
    resolvedAuthEndpoint,
    responseTokenField,
    responseTokenSecretField,
    saveOauth1Connection,
    tokenParam,
    validate
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
        value={formData.connectionName || ''}
        type="text"
        placeholder={__('Connection Name...', 'bit-integrations')}
      />
      <div style={ERROR_TEXT_STYLE}>{errors.connectionName || ''}</div>

      {(authDetails?.showCallbackInfo !== false) && (
        <>
          <div className="mt-3">
            <b>{__('Homepage URL:', 'bit-integrations')}</b>
          </div>
          <CopyText value={`${APP_CONFIG?.siteURL || ''}`} className="field-key-cpy w-6 ml-0" readOnly={isInfo} />
          <div className="mt-3">
            <b>{authDetails?.callbackLabel || __('Callback / Return URL:', 'bit-integrations')}</b>
          </div>
          <CopyText value={callbackUrl} className="field-key-cpy w-6 ml-0" readOnly={isInfo} />
        </>
      )}

      {customAuthFields}

      {(authDetails?.extraFields || []).map(field => (
        <div key={field.name}>
          <div className="mt-3">
            <b>{field.label}:</b>
          </div>
          {field.type === 'select' ? (
            <select
              className="btcd-paper-inp w-6 mt-1"
              onChange={handleChange}
              name={field.name}
              value={formData[field.name] || ''}
              disabled={isInfo}>
              <option value="">{field.placeholder || `${field.label}...`}</option>
              {(field.options || []).map(option => (
                <option key={option.value || option.label || option} value={option.value ?? option}>
                  {option.label ?? option}
                </option>
              ))}
            </select>
          ) : (
            <input
              className="btcd-paper-inp w-6 mt-1"
              onChange={handleChange}
              name={field.name}
              value={formData[field.name] || ''}
              type={field.type || 'text'}
              placeholder={field.placeholder || `${field.label}...`}
              disabled={isInfo}
            />
          )}
          <div style={ERROR_TEXT_STYLE}>{errors[field.name] || ''}</div>
        </div>
      ))}

      <div className="mt-3">
        <b>{authDetails?.clientIdLabel || __('Client ID:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleChange}
        name="clientId"
        value={formData.clientId || ''}
        type="text"
        placeholder={__('Client ID...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={ERROR_TEXT_STYLE}>{errors.clientId || ''}</div>

      {requireClientSecret && (
        <>
          <div className="mt-3">
            <b>{authDetails?.clientSecretLabel || __('Client Secret:', 'bit-integrations')}</b>
          </div>
          <input
            className="btcd-paper-inp w-6 mt-1"
            onChange={handleChange}
            name="clientSecret"
            value={formData.clientSecret || ''}
            type="password"
            placeholder={__('Client Secret...', 'bit-integrations')}
            disabled={isInfo}
          />
          <div style={ERROR_TEXT_STYLE}>{errors.clientSecret || ''}</div>
        </>
      )}

      <div style={ERROR_TEXT_STYLE}>{errors.authorize || ''}</div>

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
