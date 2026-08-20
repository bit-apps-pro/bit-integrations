import { __ } from './i18nwrap'

export const AUTH_TYPES = Object.freeze({
  WP_PLUGIN_CHECK: 'wp_plugin_check',
  OAUTH2: 'oauth2',
  OAUTH1: 'oauth1',
  API_KEY: 'api_key',
  BEARER_TOKEN: 'bearer_token',
  BASIC_AUTH: 'basic_auth',
  CUSTOM: 'custom'
})

export const defaultEncryptKeys = {
  [AUTH_TYPES.API_KEY]: ['value'],
  [AUTH_TYPES.BASIC_AUTH]: ['username', 'password'],
  [AUTH_TYPES.BEARER_TOKEN]: ['token'],
  [AUTH_TYPES.OAUTH2]: ['client_secret', 'access_token', 'refresh_token'],
  [AUTH_TYPES.OAUTH1]: ['consumer_secret', 'access_token', 'access_token_secret'],
  [AUTH_TYPES.CUSTOM]: []
}

export const isWpPluginCheckType = authType => authType === AUTH_TYPES.WP_PLUGIN_CHECK

export const buildDefaultConnectionName = (appName, connections = []) => {
  const app = String(appName || '').trim()
  const base = app
    ? `${app} ${__('Connection', 'bit-integrations')}`
    : __('Connection', 'bit-integrations')

  const taken = new Set(
    (Array.isArray(connections) ? connections : [])
      .map(conn =>
        String(conn?.connection_name || '')
          .trim()
          .toLowerCase()
      )
      .filter(Boolean)
  )

  if (!taken.has(base.toLowerCase())) return base

  let index = 2
  while (taken.has(`${base} ${index}`.toLowerCase())) index += 1

  return `${base} ${index}`
}
