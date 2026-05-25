import { APP_CONFIG } from '../config/app'
import { oauthConnectionExchange } from './connectionApi'

const OAUTH_CHANNEL = 'bit_integrations_oauth_share'
const PKCE_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'

const base64UrlEncode = bytes => {
  let str = ''
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i])
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export const generateCodeVerifier = (length = 64) => {
  const charsetLen = PKCE_CHARSET.length
  // Reject bytes >= max to avoid modulo bias (RFC 7636 wants uniform).
  const max = 256 - (256 % charsetLen)
  const buf = new Uint8Array(1)
  let result = ''
  while (result.length < length) {
    window.crypto.getRandomValues(buf)
    if (buf[0] < max) result += PKCE_CHARSET.charAt(buf[0] % charsetLen)
  }
  return result
}

export const generateCodeChallengeS256 = async codeVerifier => {
  const data = new TextEncoder().encode(codeVerifier)
  const digest = await window.crypto.subtle.digest('SHA-256', data)
  return base64UrlEncode(new Uint8Array(digest))
}

export const getRedirectUri = () => {
  const api = (APP_CONFIG?.api || '').replace(/\/+$/, '')
  return `${api}/redirect`
}

export const getCallbackState = () => {
  const baseURL = APP_CONFIG?.baseURL || ''
  return `${baseURL}/auth-response/`
}

const randomToken = (bytes = 16) => {
  const arr = new Uint8Array(bytes)
  window.crypto.getRandomValues(arr)
  return base64UrlEncode(arr)
}

const getChannelName = channelKey =>
  channelKey ? `${OAUTH_CHANNEL}:${channelKey}` : OAUTH_CHANNEL

export const createOauthChannelKey = () => randomToken(18)

export const buildCallbackState = channelKey => {
  const baseState = getCallbackState()
  return channelKey ? `${baseState}&oauth_channel=${encodeURIComponent(channelKey)}` : baseState
}

const appendQueryParam = (url, key, value) => {
  url.searchParams.append(key, String(value))
}

export const buildAuthUrl = (authCodeEndpoint, { state, redirectUri, extraParams = {} }) => {
  const url = new URL(authCodeEndpoint.url)
  const queryParams = authCodeEndpoint.queryParams || {}

  Object.entries(queryParams).forEach(([key, value]) => appendQueryParam(url, key, value))
  Object.entries(extraParams).forEach(([key, value]) => appendQueryParam(url, key, value))
  url.searchParams.append('redirect_uri', redirectUri)
  url.searchParams.append('state', state)

  return url.toString()
}

const extractChannelFromState = stateValue => {
  if (!stateValue || typeof stateValue !== 'string') return ''

  try {
    const decoded = decodeURIComponent(stateValue)
    const match = decoded.match(/(?:\?|&)oauth_channel=([^&]+)/)
    return match?.[1] ? decodeURIComponent(match[1]) : ''
  } catch {
    return ''
  }
}

export const openOauthPopup = (
  authUrl,
  label = 'OAuth',
  { channelKey = '', includeLegacyFallback = false } = {}
) =>
  new Promise(resolve => {
    const popup = window.open(authUrl, label, 'width=500,height=650,toolbar=off')

    if (!popup) {
      resolve({ error: 'popup_blocked' })
      return
    }

    let resolved = false
    const channel = new BroadcastChannel(getChannelName(channelKey))
    const fallbackChannel =
      includeLegacyFallback && channelKey
        ? new BroadcastChannel(OAUTH_CHANNEL)
        : null

    const cleanup = () => {
      channel.close()
      fallbackChannel?.close()
      clearInterval(closeTimer)
    }

    const resolveMessage = event => {
      if (resolved) return
      resolved = true
      cleanup()
      try { popup.close() } catch (_) {} // eslint-disable-line no-unused-vars, no-empty
      resolve(event.data || {})
    }
    channel.onmessage = resolveMessage
    if (fallbackChannel) fallbackChannel.onmessage = resolveMessage

    const closeTimer = setInterval(() => {
      if (popup.closed && !resolved) {
        resolved = true
        cleanup()
        resolve({ error: 'popup_closed' })
      }
    }, 800)
  })

export const broadcastAuthCodeResponse = response => {
  const channelKey = response?.oauth_channel || extractChannelFromState(response?.state)
  const channel = new BroadcastChannel(getChannelName(channelKey))
  channel.postMessage(response)
  setTimeout(() => channel.close(), 200)
}

export const readAuthResponseFromUrl = () => {
  const response = {}
  const search = new URLSearchParams(window.location.search)
  for (const [key, value] of search) if (value) response[key] = value

  // backend redirect appends "&code=...&state=..." after the hash route
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  for (const [key, value] of hashParams) if (value) response[key] = value

  return response
}

const buildClientAuthHeaders = ({ clientId, clientSecret, clientAuthentication }) => {
  if (clientAuthentication === 'header') {
    return { Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}` }
  }
  return {}
}

const buildClientAuthBody = ({ clientId, clientSecret, clientAuthentication }) => {
  if (clientAuthentication === 'header') return {}
  return { client_id: clientId, client_secret: clientSecret }
}

export const exchangeAuthCodeForToken = ({
  tokenEndpoint,
  clientId,
  clientSecret,
  clientAuthentication = 'body',
  code,
  codeVerifier,
  redirectUri,
  sslVerify = true
}) => {
  const bodyParams = {
    grant_type: 'authorization_code',
    code: decodeURIComponent(code),
    redirect_uri: redirectUri,
    ...(tokenEndpoint?.bodyParams || {}),
    ...buildClientAuthBody({ clientId, clientSecret, clientAuthentication })
  }

  if (codeVerifier) bodyParams.code_verifier = codeVerifier

  return oauthConnectionExchange({
      url: tokenEndpoint.url,
      method: tokenEndpoint.method || 'POST',
      body_params: bodyParams,
      headers: {
        ...(tokenEndpoint?.headers || {}),
        ...buildClientAuthHeaders({ clientId, clientSecret, clientAuthentication })
      },
      ssl_verify: sslVerify
    })
}

export const exchangeClientCredentialsForToken = ({
  tokenEndpoint,
  clientId,
  clientSecret,
  clientAuthentication = 'body',
  scope,
  sslVerify = true
}) => {
  const bodyParams = {
    grant_type: 'client_credentials',
    ...(tokenEndpoint?.bodyParams || {}),
    ...buildClientAuthBody({ clientId, clientSecret, clientAuthentication })
  }

  if (scope) bodyParams.scope = scope

  return oauthConnectionExchange({
      url: tokenEndpoint.url,
      method: tokenEndpoint.method || 'POST',
      body_params: bodyParams,
      headers: {
        ...(tokenEndpoint?.headers || {}),
        ...buildClientAuthHeaders({ clientId, clientSecret, clientAuthentication })
      },
      ssl_verify: sslVerify
    })
}
