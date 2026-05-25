import { reauthorizeConnection, saveConnection } from './connectionApi'

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
  [AUTH_TYPES.BASIC_AUTH]: ['password'],
  [AUTH_TYPES.BEARER_TOKEN]: ['token'],
  [AUTH_TYPES.OAUTH2]: ['client_secret', 'access_token', 'refresh_token'],
  [AUTH_TYPES.OAUTH1]: ['consumer_secret', 'access_token', 'access_token_secret']
}

export const isWpPluginCheckType = authType => authType === AUTH_TYPES.WP_PLUGIN_CHECK
