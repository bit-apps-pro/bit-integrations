/* eslint-disable no-console */
/* eslint-disable no-else-return */
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import { create } from 'mutative'

export const fetchFabmanAccountId = async (connectionId, setConf) => {
  const result = await bitsFetch({ connection_id: connectionId }, 'fabman_fetch_account_id')
  if (result?.success && result.data?.accountId) {
    setConf(prev => ({ ...prev, accountId: result.data.accountId }))
  }
}

export const handleInput = (e, fabmanConf, setFabmanConf) => {
  const newConf = { ...fabmanConf }
  const { name } = e.target

  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }

  setFabmanConf({ ...newConf })
}

export const generateMappedField = fabmanConf => {
  const requiredFlds = fabmanConf?.staticFields.filter(fld => !!fld.required)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', fabmanFormField: field.key }))
    : [{ formField: '', fabmanFormField: '' }]
}

export const checkMappedFields = fabmanConf => {
  const rows = Array.isArray(fabmanConf?.field_map) ? fabmanConf.field_map : []
  const invalidMappings = rows.filter(r => {
    const hasAnySide =
      (r?.formField && r.formField !== '') || (r?.fabmanFormField && r.fabmanFormField !== '')

    if (!hasAnySide) return false

    if (!r.formField || !r.fabmanFormField) return true

    if (r.formField === 'custom' && !r.customValue) return true
    return false
  })
  return invalidMappings.length === 0
}

export const fabmanAuthentication = (
  confTmp,
  setConf,
  setError,
  setIsAuthorized,
  loading,
  setLoading
) => {
  if (!confTmp.apiKey) {
    setError({ apiKey: !confTmp.apiKey ? __("API key can't be empty", 'bit-integrations') : '' })
    return
  }

  setError({})
  setLoading({ ...loading, auth: true })

  const requestParams = { apiKey: confTmp.apiKey }

  bitsFetch(requestParams, 'fabman_authorization')
    .then(result => {
      if (result && result.success) {
        const newConf = create(confTmp, draft => {
          if (result.data && result.data.accountId) {
            draft.accountId = result.data.accountId
          }
        })

        setIsAuthorized(true)
        setConf(newConf)
        setLoading({ ...loading, auth: false })
        toast.success(__('Authorized Successfully', 'bit-integrations'))
        return
      }
      setIsAuthorized(false)
      setLoading({ ...loading, auth: false })
      toast.error(__('Authorization Failed', 'bit-integrations'))
    })
    .catch(error => {
      console.error(error)
      setLoading({ ...loading, auth: false })
      toast.error(__('Authorization Failed', 'bit-integrations'))
    })
}

export const fetchFabmanWorkspaces = (confTmp, setConf, loading, setLoading, type = 'fetch') => {
  if (!confTmp.connection_id && !confTmp.apiKey) {
    toast.error(__("API key can't be empty", 'bit-integrations'))
    return
  }

  setLoading({ ...loading, workspaces: true })

  const requestParams = confTmp.connection_id
    ? { connection_id: confTmp.connection_id }
    : { apiKey: confTmp.apiKey }

  bitsFetch(requestParams, 'fabman_fetch_workspaces')
    .then(result => {
      setLoading({ ...loading, workspaces: false })

      if (result && result.success) {
        // Use mutative's produce for state update
        const newConf = create(confTmp, draft => {
          if (result.data && result.data.workspaces && Array.isArray(result.data.workspaces)) {
            draft.workspaces = result.data.workspaces
            if (result.data.workspaces.length === 1) {
              draft.selectedWorkspace = result.data.workspaces[0].id
            }
          }
        })

        setConf(newConf)
        toast.success(
          type === 'refresh'
            ? __('Workspaces refreshed successfully', 'bit-integrations')
            : __('Workspaces fetched successfully', 'bit-integrations')
        )
        return
      }

      toast.error(__('Failed to fetch workspaces', 'bit-integrations'))
    })
    .catch(error => {
      console.error(error)
      setLoading({ ...loading, workspaces: false })
      toast.error(__('Failed to fetch workspaces', 'bit-integrations'))
    })
}

export const hasEmailFieldMapped = fabmanConf => {
  return fabmanConf.field_map?.some(field => field.fabmanFormField === 'emailAddress' && field.formField)
}

export const getEmailMappingRow = fabmanConf => {
  const rows = Array.isArray(fabmanConf?.field_map) ? fabmanConf.field_map : []
  return rows.find(r => r?.fabmanFormField === 'emailAddress')
}

export const isEmailMappingInvalid = (fabmanConf, formFields, checkValidEmail) => {
  const emailRow = getEmailMappingRow(fabmanConf)

  if (!emailRow) return true

  if (emailRow.formField === 'custom') {
    const customValue = (emailRow.customValue || '').trim()
    return !customValue || !checkValidEmail(customValue)
  }

  const selectedField = (formFields || []).find(f => f.name === emailRow.formField)

  if (!selectedField) return false

  const hasEmailType = selectedField.type && String(selectedField.type).toLowerCase() === 'email'
  const looksLikeEmailField =
    /email/i.test(selectedField.name || '') || /email/i.test(selectedField.label || '')
  return !hasEmailType && selectedField.type && !looksLikeEmailField
}

export const isConfigInvalid = (fabmanConf, formFields, checkValidEmail) => {
  if (!fabmanConf || !fabmanConf.actionName) return true

  if (
    !['delete_member', 'delete_spaces'].includes(fabmanConf.actionName) &&
    !checkMappedFields(fabmanConf)
  )
    return true

  if (
    ['update_member', 'delete_member'].includes(fabmanConf.actionName) &&
    isEmailMappingInvalid(fabmanConf, formFields, checkValidEmail)
  )
    return true

  if (
    ['create_member', 'update_member', 'update_spaces', 'delete_spaces'].includes(
      fabmanConf.actionName
    ) &&
    !fabmanConf.selectedWorkspace
  )
    return true

  if (fabmanConf.actionName === 'delete_member') {
    const hasEmailField = fabmanConf.field_map?.some(
      field => field.fabmanFormField === 'emailAddress' && field.formField
    )

    if (!hasEmailField) {
      return true
    }
  }
  return false
}

export const getValidationErrorMessage = (fabmanConf, formFields, checkValidEmail) => {
  if (!fabmanConf.actionName) {
    return __('Please select an action', 'bit-integrations')
  }

  if (
    !['delete_member', 'delete_spaces'].includes(fabmanConf.actionName) &&
    !checkMappedFields(fabmanConf)
  ) {
    return __('Please map mandatory fields', 'bit-integrations')
  }

  if (
    ['update_member', 'delete_member'].includes(fabmanConf.actionName) &&
    isEmailMappingInvalid(fabmanConf, formFields, checkValidEmail)
  ) {
    return __('Please map a valid email address', 'bit-integrations')
  }

  if (
    ['create_member', 'update_member', 'update_spaces', 'delete_spaces'].includes(
      fabmanConf.actionName
    ) &&
    !fabmanConf.selectedWorkspace
  ) {
    return __('Please select a workspace', 'bit-integrations')
  }

  if (fabmanConf.actionName === 'delete_member' && !hasEmailFieldMapped(fabmanConf)) {
    return __('Please map email field for member lookup', 'bit-integrations')
  }

  return null
}
