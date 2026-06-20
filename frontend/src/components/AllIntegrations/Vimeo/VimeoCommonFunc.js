/* eslint-disable no-else-return */
import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import { actionRequirements, dropdownMeta, VimeoStaticData } from './staticData'

export const handleInput = (e, conf, setConf) => {
  const { name, value } = e.target
  setConf(prev =>
    create(prev, draft => {
      draft[name] = value
    })
  )
}

export const generateMappedField = conf => {
  const fields = VimeoStaticData[conf?.mainAction] || []
  const required = fields.filter(f => f.required)
  return required.length > 0
    ? required.map(f => ({ formField: '', vimeoFormField: f.key }))
    : [{ formField: '', vimeoFormField: '' }]
}

export const checkMappedFields = conf => {
  if (!conf?.mainAction) {
    return false
  }

  // Required fetched-id dropdowns (video/showcase/folder/channel) must be chosen.
  const req = actionRequirements[conf.mainAction] || { dropdowns: [] }
  if (req.dropdowns.some(type => !conf?.[dropdownMeta[type].confKey])) {
    return false
  }

  // Required field-map fields must be mapped to a form field.
  const requiredKeys = (VimeoStaticData[conf.mainAction] || [])
    .filter(f => f.required)
    .map(f => f.key)
  const missingRequired = requiredKeys.some(key => {
    const row = (conf?.field_map || []).find(m => m.vimeoFormField === key)
    return !row || !row.formField || (row.formField === 'custom' && !row.customValue)
  })
  if (missingRequired) {
    return false
  }

  // No half-filled mapping rows.
  const invalid = (conf?.field_map || []).filter(
    m => m.vimeoFormField && (!m.formField || (m.formField === 'custom' && !m.customValue))
  )
  return invalid.length === 0
}

export const authorization = (conf, setIsAuthorized, loading, setLoading) => {
  if (!conf.token) {
    toast.error(__("Access Token can't be empty", 'bit-integrations'))
    return
  }

  setLoading({ ...loading, auth: true })

  bitsFetch({ token: conf.token }, 'vimeo_authorize').then(result => {
    setLoading({ ...loading, auth: false })

    if (result && result.success) {
      setIsAuthorized(true)
      toast.success(__('Authorized Successfully', 'bit-integrations'))
      return
    }

    toast.error(__('Authorization failed', 'bit-integrations'))
  })
}

export const refreshDropdown = (type, conf, setConf, loading, setLoading, setSnackbar) => {
  const meta = dropdownMeta[type]
  if (!meta) {
    return
  }
  if (!conf.token) {
    toast.error(__("Access Token can't be empty", 'bit-integrations'))
    return
  }

  setLoading({ ...loading, [meta.dataKey]: true })

  bitsFetch({ token: conf.token }, meta.route).then(result => {
    setLoading({ ...loading, [meta.dataKey]: false })

    if (result && result.success) {
      setConf(prev =>
        create(prev, draft => {
          draft.default = draft.default || {}
          draft.default[meta.dataKey] = result.data || []
        })
      )
      setSnackbar?.({ show: true, msg: __('List refreshed', 'bit-integrations') })
      return
    }

    toast.error(__('Could not fetch the list from Vimeo', 'bit-integrations'))
  })
}

export const handleMainAction = (value, conf, setConf, loading, setLoading, setSnackbar) => {
  const updated = create(conf, draft => {
    draft.mainAction = value
    draft.field_map = generateMappedField({ mainAction: value })
  })

  setConf(updated)

  if (!value) {
    return
  }

  const req = actionRequirements[value] || { dropdowns: [] }
  req.dropdowns.forEach(type => refreshDropdown(type, updated, setConf, loading, setLoading, setSnackbar))
}
