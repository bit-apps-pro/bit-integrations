import { __ } from '../../../Utils/i18nwrap'

export const USER_EMAIL_FIELD = 'user_email'

export const userEmailFields = [
  { key: USER_EMAIL_FIELD, label: __('User Email', 'bit-integrations'), required: true }
]

export const generateUserFieldMap = mapKey => [{ formField: '', [mapKey]: USER_EMAIL_FIELD }]

export const isUserEmailMapped = (conf, mapKey) =>
  Boolean(
    conf?.field_map?.some(
      fld =>
        fld[mapKey] === USER_EMAIL_FIELD &&
        (fld.formField === 'custom' ? fld.customValue : fld.formField)
    )
  )

export const isUserSourceIncomplete = (conf, mapKey) =>
  conf?.userSource === 'email' && !isUserEmailMapped(conf, mapKey)

export const handleUserSourceChange = (value, conf, setConf, mapKey) =>
  setConf({
    ...conf,
    userSource: value,
    field_map: value === 'email' ? generateUserFieldMap(mapKey) : [{ formField: '', [mapKey]: '' }]
  })
