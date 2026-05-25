// eslint-disable-next-line import/no-extraneous-dependencies
import { __ } from '../../../Utils/i18nwrap'
import bitsFetch from '../../../Utils/bitsFetch'
import { create } from 'mutative'

const normalizeFieldId = fieldId => (fieldId || fieldId === 0 ? String(fieldId) : '')

const getFieldMeta = fields => {
  const refreshedFields = Object.values(fields || {})
  const requiredFieldIds = refreshedFields
    .filter(field => field.required)
    .map(field => normalizeFieldId(field.fieldId))
    .filter(Boolean)

  return {
    requiredFieldIds,
    requiredFieldIdSet: new Set(requiredFieldIds),
    allFieldIdSet: new Set(
      refreshedFields.map(field => normalizeFieldId(field.fieldId)).filter(Boolean)
    )
  }
}

const getExistingMapByFieldId = fieldMap => {
  const existingMapByFieldId = new Map()

  fieldMap.forEach(mappedField => {
    const fieldId = normalizeFieldId(mappedField?.activeCampaignField)
    if (!fieldId) {
      return
    }

    const existingMappedField = existingMapByFieldId.get(fieldId)
    if (!existingMappedField || (!existingMappedField.formField && mappedField.formField)) {
      existingMapByFieldId.set(fieldId, { ...mappedField })
    }
  })

  return existingMapByFieldId
}

const getRequiredMappedFields = (requiredFieldIds, existingMapByFieldId) =>
  requiredFieldIds.map(requiredFieldId => {
    const existingMappedField = existingMapByFieldId.get(requiredFieldId)
    if (existingMappedField) {
      return {
        ...existingMappedField,
        required: true
      }
    }

    return {
      formField: '',
      activeCampaignField: requiredFieldId,
      required: true
    }
  })

const getOptionalMappedFields = (existingFieldMap, requiredFieldIdSet, allFieldIdSet) =>
  existingFieldMap
    .filter(mappedField => !requiredFieldIdSet.has(normalizeFieldId(mappedField?.activeCampaignField)))
    .map(mappedField => {
      const clonedMappedField = { ...mappedField }
      const fieldId = normalizeFieldId(clonedMappedField?.activeCampaignField)

      if (fieldId && !allFieldIdSet.has(fieldId)) {
        clonedMappedField.activeCampaignField = ''
      }

      if (clonedMappedField.required) {
        delete clonedMappedField.required
      }

      return clonedMappedField
    })

const mergeFieldMapWithRefreshedFields = (fieldMap, fields) => {
  const existingFieldMap = Array.isArray(fieldMap) ? fieldMap : []
  const { requiredFieldIds, requiredFieldIdSet, allFieldIdSet } = getFieldMeta(fields)
  const existingMapByFieldId = getExistingMapByFieldId(existingFieldMap)

  return [
    ...getRequiredMappedFields(requiredFieldIds, existingMapByFieldId),
    ...getOptionalMappedFields(existingFieldMap, requiredFieldIdSet, allFieldIdSet)
  ]
}

export const handleInput = (e, activeCampaingConf, setActiveCampaingConf) => {
  const newConf = { ...activeCampaingConf }
  newConf.name = e.target.value
  setActiveCampaingConf({ ...newConf })
}

const buildAuthRequestParams = confTmp =>
  confTmp.connection_id
    ? { connection_id: confTmp.connection_id }
    : {
        api_key: confTmp.api_key,
        api_url: confTmp.api_url
      }

export const refreshActiveCampaingList = (
  activeCampaingConf,
  setActiveCampaingConf,
  setIsLoading,
  setSnackbar
) => {
  const refreshListsRequestParams = buildAuthRequestParams(activeCampaingConf)
  setIsLoading(true)
  bitsFetch(refreshListsRequestParams, 'aCampaign_lists')
    .then(result => {
      if (result && result.success) {
        if (result.data.activeCampaignLists) {
          setActiveCampaingConf(prevConf =>
            create(prevConf, draftConf => {
              if (!draftConf.default) {
                draftConf.default = {}
              }
              draftConf.default.activeCampaignLists = result.data.activeCampaignLists
            })
          )
          setSnackbar({
            show: true,
            msg: __('ActiveCampaign lists refreshed', 'bit-integrations')
          })
        } else {
          setSnackbar({
            show: true,
            msg: __(
              'No ActiveCampaign lists found. Try changing the header row number or try again',
              'bit-integrations'
            )
          })
        }
      } else {
        setSnackbar({
          show: true,
          msg: __('ActiveCampaign lists refresh failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const refreshActiveCampaingAccounts = (
  activeCampaingConf,
  setActiveCampaingConf,
  setIsLoading,
  setSnackbar
) => {
  const refreshListsRequestParams = buildAuthRequestParams(activeCampaingConf)
  setIsLoading(true)
  bitsFetch(refreshListsRequestParams, 'aCampaign_accounts')
    .then(result => {
      if (result && result.success) {
        if (result.data) {
          setActiveCampaingConf(prevConf =>
            create(prevConf, draftConf => {
              draftConf.accounts = result.data
            })
          )
          setSnackbar({
            show: true,
            msg: __('ActiveCampaign accounts refreshed', 'bit-integrations')
          })
        } else {
          setSnackbar({
            show: true,
            msg: __(
              'No ActiveCampaign account found. Try changing the header row number or try again',
              'bit-integrations'
            )
          })
        }
      } else {
        setSnackbar({
          show: true,
          msg: __('ActiveCampaign accounts refresh failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}
// refreshActiveCampaingTags
export const refreshActiveCampaingTags = (
  activeCampaingConf,
  setActiveCampaingConf,
  setIsLoading,
  setSnackbar
) => {
  const refreshListsRequestParams = buildAuthRequestParams(activeCampaingConf)
  bitsFetch(refreshListsRequestParams, 'aCampaign_tags')
    .then(result => {
      if (result && result.success) {
        if (result.data.activeCampaignTags) {
          setActiveCampaingConf(prevConf =>
            create(prevConf, draftConf => {
              if (!draftConf.default) {
                draftConf.default = {}
              }
              draftConf.default.activeCampaignTags = result.data.activeCampaignTags
            })
          )
          setSnackbar({
            show: true,
            msg: __('ActiveCampaign tags refreshed', 'bit-integrations')
          })
        } else {
          setSnackbar({
            show: true,
            msg: __(
              'No ActiveCampaign tags found. Try changing the header row number or try again',
              'bit-integrations'
            )
          })
        }
      } else {
        setSnackbar({
          show: true,
          msg: __('ActiveCampaign tags refresh failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}
export const refreshActiveCampaingHeader = (
  activeCampaingConf,
  setActiveCampaingConf,
  setIsLoading,
  setSnackbar
) => {
  const refreshListsRequestParams = buildAuthRequestParams(activeCampaingConf)
  setIsLoading(true)
  bitsFetch(refreshListsRequestParams, 'aCampaign_headers')
    .then(result => {
      if (result && result.success) {
        if (result.data.activeCampaignField) {
          setActiveCampaingConf(prevConf =>
            create(prevConf, draftConf => {
              if (!draftConf.default) {
                draftConf.default = {}
              }
              draftConf.default.fields = result.data.activeCampaignField
              draftConf.field_map = mergeFieldMapWithRefreshedFields(
                draftConf.field_map,
                draftConf.default.fields
              )
            })
          )
          setSnackbar({
            show: true,
            msg: __('ActiveCampaign fields refreshed', 'bit-integrations')
          })
        } else {
          setSnackbar({
            show: true,
            msg: __(
              'No ActiveCampaign fields found. Try changing the header row number or try again',
              'bit-integrations'
            )
          })
        }
      } else {
        setSnackbar({
          show: true,
          msg: __('ActiveCampaign fields refresh failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const checkMappedFields = activeCampaingConf => {
  const mappedFields = activeCampaingConf?.field_map
    ? activeCampaingConf.field_map.filter(
        mappedField => !mappedField.formField && mappedField.activeCampaignField && mappedField.required
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}
