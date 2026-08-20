import { useCallback, useMemo, useState } from 'react'
import { AUTH_TYPES, buildDefaultConnectionName, defaultEncryptKeys } from '../../Utils/connectionAuth'
import { resolveTemplate } from '../../Utils/connectionTemplates'
import useConnectionAuthorize from '../../Utils/useConnectionAuthorize'
import {
  buildAuthUrl,
  buildCallbackState,
  createOauthChannelKey,
  exchangeAuthCodeForToken,
  exchangeClientCredentialsForToken,
  generateCodeChallengeS256,
  generateCodeVerifier,
  getRedirectUri,
  openOauthPopup
} from '../../Utils/oauthHelper'
import { __ } from '../../Utils/i18nwrap'
import LoaderSm from '../Loaders/LoaderSm'
import CopyText from '../Utilities/CopyText'
import SecretInput from '../Utilities/SecretInput'
import { APP_CONFIG } from '../../config/app'

const ERROR_TEXT_STYLE = { color: 'red', fontSize: '15px' }

const GRANT_TYPES = Object.freeze({
  AUTHORIZATION_CODE: 'authorization_code',
  AUTHORIZATION_CODE_PKCE: 'authorization_code_pkce',
  CLIENT_CREDENTIALS: 'client_credentials'
})

const buildSavedAuthDetails = ({
  tokenResponse,
  clientId,
  clientSecret,
  clientAuthentication,
  grantType,
  refreshTokenUrl,
  tokenUrl,
  scope,
  sslVerify,
  extraTokenFields = [],
  extraFormData = {}
}) => {
  const expiresIn = Number(tokenResponse?.expires_in) || 0
  const persistedGrantType =
    grantType === GRANT_TYPES.AUTHORIZATION_CODE_PKCE ? GRANT_TYPES.AUTHORIZATION_CODE : grantType

  const base = {
    // Extra form fields first (e.g. baseUrl for a self-hosted Mautic). They are raw
    // user input, so the standard credential keys below must always win on collision —
    // merging them afterwards would let an extraField named client_secret or
    // access_token overwrite the real one.
    ...extraFormData,
    access_token: tokenResponse?.access_token || '',
    refresh_token: tokenResponse?.refresh_token || '',
    token_type: tokenResponse?.token_type || 'Bearer',
    expires_in: expiresIn,
    generated_at: Math.floor(Date.now() / 1000),
    client_id: clientId,
    client_secret: clientSecret,
    clientAuthentication,
    grant_type: persistedGrantType,
    refresh_token_url: refreshTokenUrl || tokenUrl,
    scope: scope || '',
    ssl_verify: sslVerify !== false
  }

  // Capture provider-specific extra fields from token response (e.g., instance_url for
  // Salesforce, api_domain for Zoho) — these come from the provider, not the form.
  extraTokenFields.forEach(field => {
    if (tokenResponse?.[field] != null) base[field] = tokenResponse[field]
  })

  return base
}

export default function Oauth2Connection({
  authDetails,
  config,
  setConfig,
  connections,
  isInfo = false,
  customAuthFields,
  onConnectionSaved
}) {
  const [formData, setFormData] = useState(() => ({
    connectionName: buildDefaultConnectionName(config?.type || config?.app_slug, connections)
  }))

  const {
    authCodeEndpoint,
    tokenEndpoint,
    refreshTokenUrl,
    grantType = GRANT_TYPES.AUTHORIZATION_CODE,
    clientAuthentication = 'body',
    scope,
    sslVerify = true,
    extraTokenFields = [],
    extraFields = []
  } = authDetails || {}

  const redirectUri = useMemo(() => getRedirectUri(), [])

  // Resolve {fieldName} templates in endpoint URLs using current form values (e.g., Mautic baseUrl)
  const resolvedAuthCodeEndpoint = useMemo(() => {
    if (!authCodeEndpoint) return null
    return { ...authCodeEndpoint, url: resolveTemplate(authCodeEndpoint.url, formData) }
  }, [authCodeEndpoint, formData])

  const resolvedTokenEndpoint = useMemo(() => {
    if (!tokenEndpoint) return null
    return { ...tokenEndpoint, url: resolveTemplate(tokenEndpoint.url, formData) }
  }, [tokenEndpoint, formData])

  // The refresh URL is persisted into auth_details and replayed by the backend long
  // after this form is gone, so it must be resolved here too. Leaving it templated
  // stores a literal '{dataCenter}'/'{baseUrl}' host that fails every later refresh.
  const resolvedRefreshTokenUrl = useMemo(
    () => resolveTemplate(refreshTokenUrl, formData),
    [refreshTokenUrl, formData]
  )

  const validate = useCallback(() => {
    const next = {}
    if (!formData.connectionName?.trim()) {
      next.connectionName = __('Connection name is required', 'bit-integrations')
    }
    if (!formData.clientId?.trim()) {
      next.clientId = __('Client ID is required', 'bit-integrations')
    }
    if (!formData.clientSecret?.trim()) {
      next.clientSecret = __('Client secret is required', 'bit-integrations')
    }
    extraFields.forEach(field => {
      if (field.required && !formData[field.name]?.trim()) {
        next[field.name] = `${field.label} ${__('is required', 'bit-integrations')}`
      }
    })
    return next
  }, [extraFields, formData])

  const handleAuthorizationCodeFlow = useCallback(async () => {
    const isPkce = grantType === GRANT_TYPES.AUTHORIZATION_CODE_PKCE
    const declaredQueryParams = resolvedAuthCodeEndpoint?.queryParams || {}
    let codeVerifier

    const extraParams = { client_id: formData.clientId }
    if (!declaredQueryParams.response_type) extraParams.response_type = 'code'
    if (scope && !declaredQueryParams.scope) extraParams.scope = scope

    if (isPkce) {
      codeVerifier = generateCodeVerifier()
      extraParams.code_challenge = await generateCodeChallengeS256(codeVerifier)
      extraParams.code_challenge_method = 'S256'
    }

    // Drop integration-declared client_id placeholder; URL.searchParams.append does not dedupe,
    // so a placeholder + extraParams.client_id would emit two client_id entries.
    const { client_id: _ignored, ...queryParams } = declaredQueryParams
    const populatedAuthCodeEndpoint = { ...resolvedAuthCodeEndpoint, queryParams }

    const oauthChannelKey = createOauthChannelKey()
    const state = buildCallbackState(oauthChannelKey)
    const authUrl = buildAuthUrl(populatedAuthCodeEndpoint, { state, redirectUri, extraParams })
    const popupResponse = await openOauthPopup(authUrl, {
      channelKey: oauthChannelKey,
      includeLegacyFallback: true
    })

    if (popupResponse?.error) {
      // The backend sends {message} on some paths and a bare string on others (e.g.
      // $wpError->get_error_message()); reading only .message swallowed the real cause.
      throw new Error(
        popupResponse.error === 'popup_blocked'
          ? __('Popup blocked. Please allow popups and try again.', 'bit-integrations')
          : __('Authorization window closed before completing.', 'bit-integrations')
      )
    }

    if (!popupResponse?.code) {
      throw new Error(
        popupResponse?.error_description || __('Authorization code missing', 'bit-integrations')
      )
    }

    const tokenRes = await exchangeAuthCodeForToken({
      tokenEndpoint: resolvedTokenEndpoint,
      clientId: formData.clientId,
      clientSecret: formData.clientSecret,
      clientAuthentication,
      code: popupResponse.code,
      codeVerifier,
      redirectUri,
      sslVerify
    })

    if (!tokenRes?.success) {
      throw new Error(
        tokenRes?.data?.message ||
          (typeof tokenRes?.data === 'string' && tokenRes.data) ||
          __('Token exchange failed', 'bit-integrations')
      )
    }

    return tokenRes?.data?.data || {}
  }, [
    clientAuthentication,
    formData,
    grantType,
    redirectUri,
    resolvedAuthCodeEndpoint,
    resolvedTokenEndpoint,
    scope,
    sslVerify
  ])

  const handleClientCredentialsFlow = useCallback(async () => {
    const tokenRes = await exchangeClientCredentialsForToken({
      tokenEndpoint: resolvedTokenEndpoint,
      clientId: formData.clientId,
      clientSecret: formData.clientSecret,
      clientAuthentication,
      scope,
      sslVerify
    })

    if (!tokenRes?.success) {
      throw new Error(
        tokenRes?.data?.message ||
          (typeof tokenRes?.data === 'string' && tokenRes.data) ||
          __('Token exchange failed', 'bit-integrations')
      )
    }

    return tokenRes?.data?.data || {}
  }, [
    clientAuthentication,
    formData.clientId,
    formData.clientSecret,
    resolvedTokenEndpoint,
    scope,
    sslVerify
  ])

  const flowFn = useCallback(async () => {
    if (grantType === GRANT_TYPES.CLIENT_CREDENTIALS) {
      return handleClientCredentialsFlow()
    }

    return handleAuthorizationCodeFlow()
  }, [grantType, handleAuthorizationCodeFlow, handleClientCredentialsFlow])

  const buildSavePayload = useCallback(
    tokenResponse => {
      const extraFormData = extraFields.reduce((acc, { name }) => {
        if (formData[name] != null) acc[name] = formData[name]
        return acc
      }, {})

      const savedAuthDetails = buildSavedAuthDetails({
        tokenResponse,
        clientId: formData.clientId,
        clientSecret: formData.clientSecret,
        clientAuthentication,
        grantType,
        refreshTokenUrl: resolvedRefreshTokenUrl,
        tokenUrl: resolvedTokenEndpoint?.url,
        scope,
        sslVerify,
        extraTokenFields,
        extraFormData
      })

      return {
        app_slug: config?.app_slug || config?.type,
        auth_type: AUTH_TYPES.OAUTH2,
        connection_name: formData.connectionName,
        account_name: formData.connectionName,
        auth_details: savedAuthDetails,
        // Honor a per-integration override, as ApiConnection and Oauth1Connection do.
        // Hardcoding the default silently dropped the encryptKeys of any OAuth2
        // integration declaring a sensitive extraField.
        encrypt_keys: authDetails?.encryptKeys || defaultEncryptKeys[AUTH_TYPES.OAUTH2] || []
      }
    },
    [
      clientAuthentication,
      config?.app_slug,
      config?.type,
      extraFields,
      extraTokenFields,
      formData,
      grantType,
      resolvedRefreshTokenUrl,
      resolvedTokenEndpoint?.url,
      scope,
      sslVerify
    ]
  )

  const { isLoading, isAuthorized, errors, setErrors, handleAuthorize } = useConnectionAuthorize({
    validate,
    flowFn,
    buildSavePayload,
    onConnectionSaved,
    setConfig
  })

  const handleChange = useCallback(
    event => {
      const { name, value } = event.target
      setFormData(prev => ({ ...prev, [name]: value }))
      setErrors(prev => ({ ...prev, [name]: '' }))
    },
    [setErrors]
  )

  const isAuthCodeFlow =
    grantType === GRANT_TYPES.AUTHORIZATION_CODE || grantType === GRANT_TYPES.AUTHORIZATION_CODE_PKCE

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

      {extraFields.map(field => (
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
              <option value="">{__('--Select--', 'bit-integrations')}</option>
              {field.options?.map(opt => (
                <option key={opt.value ?? opt} value={opt.value ?? opt}>
                  {opt.label ?? opt}
                </option>
              ))}
            </select>
          ) : field.type === 'password' ? (
            <SecretInput
              className="w-6 mt-1"
              onChange={handleChange}
              name={field.name}
              value={formData[field.name] || ''}
              placeholder={field.placeholder || `${field.label}...`}
              disabled={isInfo}
            />
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

      {customAuthFields}

      {isAuthCodeFlow && (
        <>
          <div className="mt-3">
            <b>{__('Homepage URL:', 'bit-integrations')}</b>
          </div>
          <CopyText
            value={`${APP_CONFIG?.siteURL || ''}`}
            className="field-key-cpy w-6 ml-0"
            readOnly={isInfo}
          />
          <div className="mt-3">
            <b>{__('Callback / Redirect URL:', 'bit-integrations')}</b>
          </div>
          <CopyText value={redirectUri} className="field-key-cpy w-6 ml-0" readOnly={isInfo} />
        </>
      )}

      <div className="mt-3">
        <b>{__('Client ID:', 'bit-integrations')}</b>
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

      <div className="mt-3">
        <b>{__('Client Secret:', 'bit-integrations')}</b>
      </div>
      <SecretInput
        className="w-6 mt-1"
        onChange={handleChange}
        name="clientSecret"
        value={formData.clientSecret || ''}
        placeholder={__('Client Secret...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={ERROR_TEXT_STYLE}>{errors.clientSecret || ''}</div>

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
