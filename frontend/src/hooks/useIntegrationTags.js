import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import bitsFetch from '../Utils/bitsFetch'
import { __ } from '../Utils/i18nwrap'

const isPlainObject = value => value && typeof value === 'object' && !Array.isArray(value)

export default function useIntegrationTags() {
  const [tags, setTags] = useState([])
  const [integrationTags, setIntegrationTags] = useState({})

  const fetchTagData = useCallback(
    (showErrorMsg = true) =>
      bitsFetch({}, 'integration-tags/get', null, 'GET')
        .then(res => {
          if (!res?.success) throw new Error('tag_load_failed')
          setTags(Array.isArray(res?.data?.tags) ? res.data.tags : [])
          setIntegrationTags(isPlainObject(res?.data?.integrationTags) ? res.data.integrationTags : {})
        })
        .catch(() => {
          if (showErrorMsg) toast.error(__('Failed to load tags', 'bit-integrations'))
        }),
    []
  )

  useEffect(() => {
    fetchTagData()
  }, [fetchTagData])

  const persistTagData = useCallback(
    (nextTags, nextIntegrationTags, successMsg = '') =>
      bitsFetch(
        { tags: nextTags, integrationTags: nextIntegrationTags },
        'integration-tags/save'
      )
        .then(res => {
          if (!res?.success) throw new Error('tag_save_failed')
          setTags(Array.isArray(res?.data?.tags) ? res.data.tags : nextTags)
          setIntegrationTags(
            isPlainObject(res?.data?.integrationTags) ? res.data.integrationTags : nextIntegrationTags
          )
          if (successMsg) toast.success(successMsg)
        })
        .catch(() => {
          fetchTagData(false)
          toast.error(__('Failed to save tags', 'bit-integrations'))
          throw new Error('tag_save_failed')
        }),
    [fetchTagData]
  )

  return {
    tags,
    integrationTags,
    setTags,
    setIntegrationTags,
    fetchTagData,
    persistTagData
  }
}
