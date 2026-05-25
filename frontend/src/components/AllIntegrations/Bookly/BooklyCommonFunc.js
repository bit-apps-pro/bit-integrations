import { create } from 'mutative'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, booklyConf, setBooklyConf) => {
  const { name, value } = e.target
  setBooklyConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

export const checkMappedFields = booklyConf => {
  const unmapped = booklyConf?.field_map
    ? booklyConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.booklyField ||
          (mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []
  if (unmapped.length > 0) return false

  const action = booklyConf?.mainAction
  const utils = booklyConf?.utilities || {}

  if (action === 'create_appointment') {
    if (!utils.staffId) return false
    if (!utils.status) return false
  }

  if (action === 'update_appointment_status') {
    if (!utils.status) return false
  }

  return true
}

export const generateMappedField = fields => {
  const requiredFlds = fields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        booklyField: field.key,
      }))
    : [{ formField: '', booklyField: '' }]
}

export const getBooklyValidationMsg = booklyConf => {
  const action = booklyConf?.mainAction
  const utils = booklyConf?.utilities || {}

  if (action === 'create_appointment') {
    if (!utils.staffId) return __('Please select a Staff member to continue.', 'bit-integrations')
    if (!utils.status) return __('Please select a Status to continue.', 'bit-integrations')
  }

  if (action === 'update_appointment_status') {
    if (!utils.status) return __('Please select a Status to continue.', 'bit-integrations')
  }

  const unmapped = booklyConf?.field_map?.filter(
    f => !f.formField || !f.booklyField || (f.formField === 'custom' && !f.customValue)
  )
  if (unmapped?.length > 0) return __('Please map all required fields to continue.', 'bit-integrations')

  return null
}

export const refreshBooklyStaff = (setBooklyConf, setDataLoading) => {
  setDataLoading(prev => ({ ...prev, staff: true }))
  bitsFetch({}, 'refresh_bookly_staff')
    .then(res => {
      if (res?.success && res.data?.staff) {
        setBooklyConf(prev =>
          create(prev, draft => {
            draft.allStaff = res.data.staff
          })
        )
      }
    })
    .finally(() => setDataLoading(prev => ({ ...prev, staff: false })))
}

export const refreshBooklyServices = (setBooklyConf, setDataLoading) => {
  setDataLoading(prev => ({ ...prev, services: true }))
  bitsFetch({}, 'refresh_bookly_services')
    .then(res => {
      if (res?.success && res.data?.services) {
        setBooklyConf(prev =>
          create(prev, draft => {
            draft.allServices = res.data.services
          })
        )
      }
    })
    .finally(() => setDataLoading(prev => ({ ...prev, services: false })))
}

export const refreshBooklyStatuses = (setBooklyConf, setDataLoading) => {
  setDataLoading(prev => ({ ...prev, statuses: true }))
  bitsFetch({}, 'refresh_bookly_statuses')
    .then(res => {
      if (res?.success && res.data?.statuses) {
        setBooklyConf(prev =>
          create(prev, draft => {
            draft.allStatuses = res.data.statuses
          })
        )
      }
    })
    .finally(() => setDataLoading(prev => ({ ...prev, statuses: false })))
}
