/* eslint-disable no-restricted-syntax */
/* eslint-disable no-undef */

import { APP_CONFIG } from '../config/app'

const MAX_JSON_START_CANDIDATES = 20

/**
 * Recover the JSON payload from an admin-ajax body that a PHP notice printed into,
 * e.g. `<b>Warning</b>: ...{"success":true,"data":{...}}`. Returns undefined when
 * nothing parses.
 *
 * @param {string} text
 *
 * @return {any|undefined}
 */
function nextValueStart(text, fromIndex) {
  const brace = text.indexOf('{', fromIndex)
  const bracket = text.indexOf('[', fromIndex)

  if (brace === -1) return bracket
  if (bracket === -1) return brace

  return Math.min(brace, bracket)
}

function extractJson(text) {
  let searchFrom = 0

  for (let attempt = 0; attempt < MAX_JSON_START_CANDIDATES; attempt += 1) {
    const from = nextValueStart(text, searchFrom)
    if (from === -1) {
      return undefined
    }

    const open = text[from]
    const close = open === '{' ? '}' : ']'
    let depth = 0
    let inString = false
    let escaped = false

    for (let i = from; i < text.length; i += 1) {
      const char = text[i]

      if (inString) {
        if (escaped) {
          escaped = false
        } else if (char === '\\') {
          escaped = true
        } else if (char === '"') {
          inString = false
        }
      } else if (char === '"') {
        inString = true
      } else if (char === open) {
        depth += 1
      } else if (char === close) {
        depth -= 1
        if (depth === 0) {
          try {
            return JSON.parse(text.slice(from, i + 1))
          } catch (error) {
            break
          }
        }
      }
    }

    searchFrom = from + 1
  }

  return undefined
}

export default async function bitsFetch(data, action, queryParam = null, method = 'POST', signal) {
  const uri = new URL(APP_CONFIG.ajaxURL)

  if (method.toLowerCase() === 'get') {
    uri.searchParams.append('action', APP_CONFIG.withPrefix(action))
    uri.searchParams.append('_ajax_nonce', APP_CONFIG.nonce)
  }
  // append query params in url
  if (queryParam) {
    for (const key in queryParam) {
      if (key) {
        uri.searchParams.append(key, queryParam[key])
      }
    }
  }

  const options = {
    method,
    headers: {},
    signal
  }

  if (method.toLowerCase() === 'post') {
    let formData
    if (!(data instanceof FormData)) {
      formData = new FormData()
      formData.set('data', JSON.stringify(data))
    } else {
      formData = data
    }

    formData.set('action', APP_CONFIG.withPrefix(action))
    formData.set('_ajax_nonce', APP_CONFIG.nonce)

    options.body = formData
  }

  let body
  try {
    const response = await fetch(uri, options)
    body = await response.text()
  } catch (error) {
    const aborted = error?.name === 'AbortError'

    return {
      success: false,
      aborted,
      data: aborted ? 'Request aborted' : error?.message || 'Network request failed'
    }
  }

  try {
    return JSON.parse(body)
  } catch (error) {
    const recovered = extractJson(body)

    return recovered === undefined ? { success: false, data: body } : recovered
  }
}
