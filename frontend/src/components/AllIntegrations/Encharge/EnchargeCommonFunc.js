// eslint-disable-next-line import/no-extraneous-dependencies
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, enchargeConf, setEnchargeConf) => {
  const newConf = { ...enchargeConf }
  newConf.name = e.target.value
  setEnchargeConf({ ...newConf })
}

const buildAuthRequestParams = conf =>
  conf.connection_id ? { connection_id: conf.connection_id } : { api_key: conf.api_key }

export const refreshEnchargeHeader = (enchargeConf, setEnchargeConf, setIsLoading, setSnackbar) => {
  const refreshEnchargeHeaderData = buildAuthRequestParams(enchargeConf)
  const newConf = { ...enchargeConf }
  bitsFetch(refreshEnchargeHeaderData, 'encharge_headers')
    .then(result => {
      if (result && result.success) {
        if (!newConf.default) {
          newConf.default = {}
        }
        if (result.data.enChargeFields) {
          newConf.default.fields = result.data.enChargeFields
          const { fields } = newConf.default
          newConf.field_map = Object.values(fields)
            .filter(f => f.required)
            .map(f => ({ formField: '', enChargeFields: f.fieldId, required: true }))
          setSnackbar({ show: true, msg: __('Encharge fields refreshed', 'bit-integrations') })
        } else {
          setSnackbar({
            show: true,
            msg: __(
              'No Encharge fields found. Try changing the header row number or try again',
              'bit-integrations'
            )
          })
        }

        setEnchargeConf({ ...newConf })
      } else {
        setSnackbar({
          show: true,
          msg: __('Encharge fields refresh failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const checkMappedFields = enChargeFields => {
  const mappedFields = enChargeFields?.field_map
    ? enChargeFields.field_map.filter(
        mappedField => !mappedField.formField && mappedField.enChargeFields && mappedField.required
      )
    : []
  if (mappedFields.length > 0) return false
  return true
}
