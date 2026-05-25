import { __ } from '../../../Utils/i18nwrap'
import { create } from 'mutative'

export const handleInput = (e, newsletterConf, setNewsletterConf) => {
  const newConf = create(newsletterConf, draftConf => {
    const { name } = e.target
    if (e.target.value !== '') {
      draftConf[name] = e.target.value
    } else {
      delete draftConf[name]
    }
  })

  setNewsletterConf(newConf)
}

export const generateMappedField = newsletterConf => {
  const requiredFlds = newsletterConf?.staticFields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', newsletterFormField: field.key }))
    : [{ formField: '', newsletterFormField: '' }]
}

export const checkMappedFields = newsletterConf => {
  const mappedFields = newsletterConf?.field_map
    ? newsletterConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.newsletterFormField ||
          (!mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}


export const staticFields = [
  { key: 'email', label: __('Email', 'bit-integrations'), required: true },
  { key: 'name', label: __('First Name', 'bit-integrations'), required: false },
  { key: 'surname', label: __('Last Name', 'bit-integrations'), required: false },
  { key: 'status', label: __('Status', 'bit-integrations'), required: false },
  { key: 'gender', label: __('Gender', 'bit-integrations'), required: false },
  { key: 'country', label: __('Country Code', 'bit-integrations'), required: false },
  { key: 'region', label: __('Region', 'bit-integrations'), required: false },
  { key: 'city', label: __('City', 'bit-integrations'), required: false },
  { key: 'profile_1', label: __('Custom Field 1', 'bit-integrations'), required: false },
  { key: 'profile_2', label: __('Custom Field 2', 'bit-integrations'), required: false },
  { key: 'profile_3', label: __('Custom Field 3', 'bit-integrations'), required: false },
  { key: 'profile_4', label: __('Custom Field 4', 'bit-integrations'), required: false },
  { key: 'profile_5', label: __('Custom Field 5', 'bit-integrations'), required: false },
  { key: 'profile_6', label: __('Custom Field 6', 'bit-integrations'), required: false },
  { key: 'profile_7', label: __('Custom Field 7', 'bit-integrations'), required: false },
  { key: 'profile_8', label: __('Custom Field 8', 'bit-integrations'), required: false },
  { key: 'profile_9', label: __('Custom Field 9', 'bit-integrations'), required: false },
  { key: 'profile_10', label: __('Custom Field 10', 'bit-integrations'), required: false },
  { key: 'profile_11', label: __('Custom Field 11', 'bit-integrations'), required: false },
  { key: 'profile_12', label: __('Custom Field 12', 'bit-integrations'), required: false },
  { key: 'profile_13', label: __('Custom Field 13', 'bit-integrations'), required: false },
  { key: 'profile_14', label: __('Custom Field 14', 'bit-integrations'), required: false },
  { key: 'profile_15', label: __('Custom Field 15', 'bit-integrations'), required: false },
  { key: 'profile_16', label: __('Custom Field 16', 'bit-integrations'), required: false },
  { key: 'profile_17', label: __('Custom Field 17', 'bit-integrations'), required: false },
  { key: 'profile_18', label: __('Custom Field 18', 'bit-integrations'), required: false },
  { key: 'profile_19', label: __('Custom Field 19', 'bit-integrations'), required: false },
  { key: 'profile_20', label: __('Custom Field 20', 'bit-integrations'), required: false }
]

export const listsOptions = () => {
  const options = []

  for (let i = 1; i <= 40; i++) {
    options.push({ label: 'List ' + i, value: i.toString() })
  }

  return options
}
