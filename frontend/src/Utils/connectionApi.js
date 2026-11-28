import bitsFetch from './bitsFetch'

/**
 * List saved connections for an app (decrypted server-side).
 *
 * @param {string} appSlug
 */
export const listConnections = (appSlug, options = {}) => {
  const query = { app_slug: appSlug }

  if (options?.includeLinkedIntegrations) {
    query.include_linked_integrations = 1
  }

  return bitsFetch(null, 'connections/list', query, 'GET')
}

export const getConnection = id => bitsFetch(null, 'connections/get', { id }, 'GET')

export const authorizeConnection = payload => bitsFetch(payload, 'connections/authorize')

export const oauthConnectionExchange = payload => bitsFetch(payload, 'connections/oauth2/exchange')

export const getOneClickConfig = app =>
  bitsFetch(null, 'connections/oauth2/one-click/config', { app }, 'GET')

export const oneClickExchange = payload => bitsFetch(payload, 'connections/oauth2/one-click/exchange')

export const getGooglePicker = connectionId =>
  bitsFetch({ connection_id: connectionId }, 'connections/google/picker')

export const verifyPluginActivation = payload =>
  bitsFetch(payload, 'connections/verify-plugin-activation')

export const saveConnection = payload => bitsFetch(payload, 'connections/save')

export const updateConnection = payload => bitsFetch(payload, 'connections/update')

export const reauthorizeConnection = payload => bitsFetch(payload, 'connections/reauthorize')

export const deleteConnection = id => bitsFetch({ id }, 'connections/delete')
