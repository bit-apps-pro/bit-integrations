/* eslint-disable no-restricted-syntax */
/* eslint-disable no-undef */

import { APP_CONFIG } from '../config/app'

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

  const response = await fetch(uri, options)
    .then(res => res.text())
    .then(res => {
      try {
        return JSON.parse(res)
      } catch (error) {
        const parsedRes = res.match(/{"success":(?:[^{}]*)*}/)
        return parsedRes ? JSON.parse(parsedRes[0]) : { success: false, data: res }
      }
    })

  return response
}
