// eslint-disable-next-line import/no-extraneous-dependencies
import { __ } from '../../../Utils/i18nwrap'
import bitsFetch from '../../../Utils/bitsFetch'

export const handleInput = (e, benchMarkConf, setBenchMarkConf) => {
  const newConf = { ...benchMarkConf }
  newConf.name = e.target.value
  setBenchMarkConf({ ...newConf })
}

const buildAuthRequestParams = conf =>
  conf.connection_id ? { connection_id: conf.connection_id } : { api_secret: conf.api_secret }

// refreshMappedLists
export const refreshBenchMarkList = (benchMarkConf, setBenchMarkConf, setIsLoading, setSnackbar) => {
  const refreshListsRequestParams = {
    ...buildAuthRequestParams(benchMarkConf)
  }
  bitsFetch(refreshListsRequestParams, 'benchMark_lists')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...benchMarkConf }
        if (result.data.benchMarkLists) {
          if (!newConf.default) {
            newConf.default = {}
          }
          newConf.default.benchMarkLists = result.data.benchMarkLists
          setSnackbar({
            show: true,
            msg: __('Benchmark lists refreshed', 'bit-integrations')
          })
        } else {
          setSnackbar({
            show: true,
            msg: __(
              'No Benchmark lists found. Try changing the header row number or try again',
              'bit-integrations'
            )
          })
        }

        setBenchMarkConf({ ...newConf })
      } else {
        setSnackbar({
          show: true,
          msg: __('Benchmark lists refresh failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}
// refreshMappedFields
export const refreshBenchMarkHeader = (benchMarkConf, setBenchMarkConf, setIsLoading, setSnackbar) => {
  const refreshListsRequestParams = {
    ...buildAuthRequestParams(benchMarkConf),
    list_id: benchMarkConf.listId
  }
  bitsFetch(refreshListsRequestParams, 'benchMark_headers')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...benchMarkConf }
        if (result.data.benchMarkField) {
          if (!newConf.default) {
            newConf.default = {}
          }
          newConf.default.fields = result.data.benchMarkField
          const { fields } = newConf.default
          newConf.field_map = Object.values(fields)
            .filter(f => f.required)
            .map(f => ({
              formField: '',
              benchMarkField: f.fieldId,
              required: true
            }))
          setSnackbar({
            show: true,
            msg: __('Benchmark fields refreshed', 'bit-integrations')
          })
        } else {
          setSnackbar({
            show: true,
            msg: __(
              'No Benchmark fields found. Try changing the header row number or try again',
              'bit-integrations'
            )
          })
        }

        setBenchMarkConf({ ...newConf })
      } else {
        setSnackbar({
          show: true,
          msg: __('Benchmark fields refresh failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const checkMappedFields = benchMarkConf => {
  const mappedFields = benchMarkConf?.field_map
    ? benchMarkConf.field_map.filter(
        mappedField => !mappedField.formField && mappedField.benchMarkField && mappedField.required
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}
