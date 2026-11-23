import { useCallback, useMemo, useState } from 'react'
import {
  AUTH_TYPES,
  buildDefaultConnectionName,
  defaultEncryptKeys,
  getConnectionAppSlug
} from '../../Utils/connectionAuth'
import { getOneClickConfig, oneClickExchange } from '../../Utils/connectionApi'
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
  extraFormData = {},
  oneClickApp = ''
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

  if (oneClickApp) base.one_click_app = oneClickApp

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
    extraFields = [],
    oneClick
  } = authDetails || {}
  const {
    app: oneClickApp = '',
    scope: oneClickScope,
    label: oneClickLabel = __('One-click', 'bit-integrations'),
    hint: oneClickHint,
    customLabel = __('Your own app credentials', 'bit-integrations'),
    customHint
  } = oneClick || {}
  const connectionTypeHint = useCustomApp ? customHint : oneClickHint

  const [useCustomApp, setUseCustomApp] = useState(!oneClickApp)
  const isOneClick = Boolean(oneClickApp) && !useCustomApp

  const appSlug = getConnectionAppSlug(config)
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
    if (!isOneClick && !formData.clientId?.trim()) {
      next.clientId = __('Client ID is required', 'bit-integrations')
    }
    if (!isOneClick && !formData.clientSecret?.trim()) {
      next.clientSecret = __('Client secret is required', 'bit-integrations')
    }
    extraFields.forEach(field => {
      if (field.required && !formData[field.name]?.trim()) {
        next[field.name] = `${field.label} ${__('is required', 'bit-integrations')}`
      }
    })
    return next
  }, [extraFields, formData, isOneClick])

  const requestAuthCode = useCallback(
    async ({ clientId, authRedirectUri, codeChallenge, scopeOverride }) => {
      const declaredQueryParams = {
        ...(resolvedAuthCodeEndpoint?.queryParams || {}),
        ...(scopeOverride ? { scope: scopeOverride } : {})
      }
      const extraParams = { client_id: clientId }
      if (!declaredQueryParams.response_type) extraParams.response_type = 'code'
      if (scope && !declaredQueryParams.scope) extraParams.scope = scope

      if (codeChallenge) {
        extraParams.code_challenge = codeChallenge
        extraParams.code_challenge_method = 'S256'
      }

      // Drop integration-declared client_id placeholder; URL.searchParams.append does not dedupe,
      // so a placeholder + extraParams.client_id would emit two client_id entries.
      const { client_id: _ignored, ...queryParams } = declaredQueryParams
      const populatedAuthCodeEndpoint = { ...resolvedAuthCodeEndpoint, queryParams }

      const oauthChannelKey = createOauthChannelKey()
      const state = buildCallbackState(oauthChannelKey)
      const authUrl = buildAuthUrl(populatedAuthCodeEndpoint, {
        state,
        redirectUri: authRedirectUri,
        extraParams
      })
      const popupResponse = await openOauthPopup(authUrl, {
        channelKey: oauthChannelKey,
        includeLegacyFallback: true
      })

      if (popupResponse?.error) {
        throw new Error(
          popupResponse.error === 'popup_blocked'
            ? __('Popup blocked. Please allow popups and try again.', 'bit-integrations')
            : popupResponse.error_description ||
                __('Authorization window closed before completing.', 'bit-integrations')
        )
      }

      if (!popupResponse?.code) {
        throw new Error(
          popupResponse?.error_description || __('Authorization code missing', 'bit-integrations')
        )
      }

      return popupResponse.code
    },
    [resolvedAuthCodeEndpoint, scope]
  )

  const handleOneClickFlow = useCallback(async () => {
    const configRes = await getOneClickConfig(oneClickApp)

    if (!configRes?.success || !configRes?.data?.client_id) {
      throw new Error(
        (typeof configRes?.data === 'string' && configRes.data) ||
          __('One-click authorization is unavailable right now', 'bit-integrations')
      )
    }

    const { client_id: clientId, redirect_uri: authRedirectUri } = configRes.data
    const code = await requestAuthCode({ clientId, authRedirectUri, scopeOverride: oneClickScope })
    const tokenRes = await oneClickExchange({
      app: oneClickApp,
      code,
      token_url: resolvedTokenEndpoint?.url
    })

    if (!tokenRes?.success) {
      throw new Error(
        tokenRes?.data?.message ||
          (typeof tokenRes?.data === 'string' && tokenRes.data) ||
          __('Token exchange failed', 'bit-integrations')
      )
    }

    return tokenRes?.data?.data || {}
  }, [oneClickApp, oneClickScope, requestAuthCode, resolvedTokenEndpoint?.url])

  const handleAuthorizationCodeFlow = useCallback(async () => {
    const isPkce = grantType === GRANT_TYPES.AUTHORIZATION_CODE_PKCE
    const codeVerifier = isPkce ? generateCodeVerifier() : undefined
    const codeChallenge = isPkce ? await generateCodeChallengeS256(codeVerifier) : undefined
    const code = await requestAuthCode({
      clientId: formData.clientId,
      authRedirectUri: redirectUri,
      codeChallenge
    })

    const tokenRes = await exchangeAuthCodeForToken({
      tokenEndpoint: resolvedTokenEndpoint,
      clientId: formData.clientId,
      clientSecret: formData.clientSecret,
      clientAuthentication,
      code,
      codeVerifier,
      redirectUri,
      sslVerify
    })

    if (!tokenRes?.success) {
      // The backend sends {message} on some paths and a bare string on others (e.g.
      // $wpError->get_error_message()); reading only .message swallowed the real cause.
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
    requestAuthCode,
    resolvedTokenEndpoint,
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
      // The backend sends {message} on some paths and a bare string on others (e.g.
      // $wpError->get_error_message()); reading only .message swallowed the real cause.
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
    if (isOneClick) {
      return handleOneClickFlow()
    }

    if (grantType === GRANT_TYPES.CLIENT_CREDENTIALS) {
      return handleClientCredentialsFlow()
    }

    return handleAuthorizationCodeFlow()
  }, [
    grantType,
    handleAuthorizationCodeFlow,
    handleClientCredentialsFlow,
    handleOneClickFlow,
    isOneClick
  ])

  const buildSavePayload = useCallback(
    tokenResponse => {
      const extraFormData = extraFields.reduce((acc, { name }) => {
        if (formData[name] != null) acc[name] = formData[name]
        return acc
      }, {})

      const savedAuthDetails = buildSavedAuthDetails({
        tokenResponse,
        clientId: isOneClick ? tokenResponse?.client_id || '' : formData.clientId,
        clientSecret: isOneClick ? '' : formData.clientSecret,
        clientAuthentication: isOneClick ? 'body' : clientAuthentication,
        grantType: isOneClick ? GRANT_TYPES.AUTHORIZATION_CODE : grantType,
        refreshTokenUrl: resolvedRefreshTokenUrl,
        tokenUrl: resolvedTokenEndpoint?.url,
        scope: isOneClick ? oneClickScope : scope,
        sslVerify,
        extraTokenFields,
        extraFormData,
        oneClickApp: isOneClick ? oneClickApp : ''
      })

      return {
        app_slug: appSlug,
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
      appSlug,
      clientAuthentication,
      extraFields,
      extraTokenFields,
      formData,
      grantType,
      isOneClick,
      oneClickApp,
      oneClickScope,
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
    buildConfigUpdate: () => ({ one_click_app: isOneClick ? oneClickApp : undefined }),
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
      {oneClickApp && !isInfo && (
        <>
          <div className="mt-3">
            <label htmlFor="btcd-connection-type">
              <b>{__('Connection Type:', 'bit-integrations')}</b>
            </label>
          </div>
          <select
            id="btcd-connection-type"
            className="btcd-paper-inp w-6 mt-1"
            value={useCustomApp ? 'custom' : 'oneClick'}
            onChange={e => setUseCustomApp(e.target.value === 'custom')}
            aria-describedby={connectionTypeHint ? 'btcd-connection-type-hint' : undefined}
            disabled={isLoading}>
            <option value="oneClick">{oneClickLabel}</option>
            <option value="custom">{customLabel}</option>
          </select>
          {connectionTypeHint && (
            <p id="btcd-connection-type-hint" className="btcd-connection-type-hint">
              {connectionTypeHint}
            </p>
          )}
        </>
      )}

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

      {!isOneClick && isAuthCodeFlow && (
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

      {!isOneClick && (
        <>
          <div className="mt-3">
            <b>{__('Client ID:', 'bit-integrations')}</b>
          </div>
          <input
            className="btcd-paper-inp w-6 mt-1"
            onChange={handleChange}
            name="clientId"
            value={formData.clientId || ''}
            type="text"
            autoComplete="off"
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
            autoComplete="new-password"
            placeholder={__('Client Secret...', 'bit-integrations')}
            disabled={isInfo}
          />
          <div style={ERROR_TEXT_STYLE}>{errors.clientSecret || ''}</div>
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
