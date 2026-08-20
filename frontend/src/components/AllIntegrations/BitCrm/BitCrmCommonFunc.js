import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import {
  actionDropdowns,
  actionFieldModules,
  actionSelects,
  CLOSING_STAGE_CATEGORIES,
  closingDateField,
  conditionalFieldKeys,
  lookupSources
} from './staticData'

const SELECT_TYPE = 'select'
const LOOKUP_TYPE = 'lookup'

export const handleInput = (e, bitCrmConf, setBitCrmConf) => {
  const { name, value } = e.target

  setBitCrmConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

export const refreshBitCrmList = (route, listKey, setBitCrmConf, setIsLoading, payload = null) => {
  setIsLoading(listKey)
  bitsFetch(payload, route)
    .then(result => {
      if (result?.success && Array.isArray(result?.data?.options)) {
        setBitCrmConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf[listKey] = result.data.options
          })
        )
        toast.success(__('List refreshed successfully', 'bit-integrations'))
      } else {
        toast.error(__('Bit CRM list fetch failed. Please try again', 'bit-integrations'))
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const CRM_FIELDS_KEY = 'crmFields'

export const fetchBitCrmFields = (module, setBitCrmConf, setIsLoading, notify = false) => {
  if (!module) return

  setIsLoading(CRM_FIELDS_KEY)

  bitsFetch({ module }, 'refresh_bitcrm_fields')
    .then(result => {
      const fetched = result?.success && Array.isArray(result?.data?.fields) ? result.data.fields : []

      setBitCrmConf(prevConf =>
        create(prevConf, draftConf => {
          draftConf.crmFields = fetched
          draftConf.crmFieldsModule = module
        })
      )
      setIsLoading(false)

      if (!notify) return

      if (result?.success) {
        toast.success(__('Fields refreshed successfully', 'bit-integrations'))
      } else {
        toast.error(__('Bit CRM field fetch failed. Please try again', 'bit-integrations'))
      }
    })
    .catch(() => {
      setBitCrmConf(prevConf =>
        create(prevConf, draftConf => {
          draftConf.crmFields = []
          draftConf.crmFieldsModule = module
        })
      )
      setIsLoading(false)
    })
}

export const crmFieldsOf = bitCrmConf => {
  const module = actionFieldModules[bitCrmConf?.mainAction]

  if (!module || bitCrmConf?.crmFieldsModule !== module) return []

  return Array.isArray(bitCrmConf?.crmFields) ? bitCrmConf.crmFields : []
}

const relaxOnUpdate = (fields, action) =>
  action?.startsWith('update_') ? fields.map(fld => ({ ...fld, required: false })) : fields

export const crmMapFields = bitCrmConf =>
  relaxOnUpdate(
    crmFieldsOf(bitCrmConf).filter(
      fld => fld.isCustom || (fld.type !== SELECT_TYPE && fld.type !== LOOKUP_TYPE)
    ),
    bitCrmConf?.mainAction
  )

export const crmSelectFields = bitCrmConf =>
  relaxOnUpdate(
    crmFieldsOf(bitCrmConf).filter(fld => fld.type === SELECT_TYPE),
    bitCrmConf?.mainAction
  )

export const crmLookupFields = bitCrmConf =>
  relaxOnUpdate(
    crmFieldsOf(bitCrmConf).filter(fld => fld.type === LOOKUP_TYPE && lookupSources[fld.relatedModule]),
    bitCrmConf?.mainAction
  ).map(fld => ({ ...fld, ...lookupSources[fld.relatedModule] }))

export const conditionalFields = bitCrmConf => {
  if (bitCrmConf?.mainAction !== 'update_deal_stage') return []
  if (isEmptyValue(bitCrmConf?.selectedStage)) return []

  const stage = (bitCrmConf?.allStages ?? []).find(
    option => String(option.value) === String(bitCrmConf.selectedStage)
  )

  const isClosing =
    stage?.category === undefined ? true : CLOSING_STAGE_CATEGORIES.includes(stage.category)

  return isClosing ? [closingDateField] : []
}

export const checkMappedFields = bitCrmConf => {
  const mappedFields = bitCrmConf?.field_map
    ? bitCrmConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.bitCrmField ||
          (mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []
  return mappedFields.length === 0
}

export const isEmptyValue = value =>
  value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)

export const missingRequiredSelect = bitCrmConf => {
  const action = bitCrmConf?.mainAction
  const fields = [...(actionSelects[action] || []), ...(actionDropdowns[action] || [])]
  const missing = fields
    .filter(field => field.required)
    .find(field => isEmptyValue(bitCrmConf?.[field.key]))

  if (missing) {
    if (missing.dependsOn && isEmptyValue(bitCrmConf?.[missing.dependsOn])) {
      const dependency = fields.find(field => field.key === missing.dependsOn)
      return dependency?.label ?? missing.label
    }

    return missing.label
  }

  const missingCrmField = [...crmSelectFields(bitCrmConf), ...crmLookupFields(bitCrmConf)]
    .filter(field => field.required)
    .find(field => isEmptyValue(bitCrmConf?.fieldValues?.[field.key]))

  return missingCrmField ? missingCrmField.label : null
}

export const isBitCrmConfValid = bitCrmConf =>
  checkMappedFields(bitCrmConf) && !missingRequiredSelect(bitCrmConf)

export const dropStaleConditionalRows = (fieldMap = [], fields = []) => {
  const offered = new Set(fields.map(fld => fld.key))
  const pruned = fieldMap.filter(
    row => !conditionalFieldKeys.includes(row.bitCrmField) || offered.has(row.bitCrmField)
  )

  return pruned.length === fieldMap.length ? fieldMap : pruned
}

export const syncRequiredFieldMap = (fieldMap = [], fields = []) => {
  const requiredKeys = fields.filter(fld => fld.required === true).map(fld => fld.key)
  if (requiredKeys.length === 0) return fieldMap

  const isInPlace = requiredKeys.every((key, i) => fieldMap[i]?.bitCrmField === key)
  if (isInPlace) return fieldMap

  const synced = requiredKeys.map(key => ({
    formField: fieldMap.find(row => row.bitCrmField === key)?.formField ?? '',
    bitCrmField: key
  }))

  const rest = fieldMap.filter(row => row.bitCrmField && !requiredKeys.includes(row.bitCrmField))

  return [...synced, ...rest]
}

export const generateMappedField = fields => {
  const requiredFlds = fields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', bitCrmField: field.key }))
    : [{ formField: '', bitCrmField: '' }]
}
