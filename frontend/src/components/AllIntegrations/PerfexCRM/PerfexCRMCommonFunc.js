/* eslint-disable no-console */
/* eslint-disable no-else-return */
import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, perfexCRMConf, setPerfexCRMConf) => {
  const newConf = { ...perfexCRMConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setPerfexCRMConf({ ...newConf })
}

const buildAuthRequestParams = confTmp =>
  confTmp.connection_id
    ? { connection_id: confTmp.connection_id }
    : {
        api_token: confTmp.api_token,
        domain: confTmp.domain
      }

// refreshMappedFields
export const refreshCustomFields = (perfexCRMConf, setPerfexCRMConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  const requestParams = {
    ...buildAuthRequestParams(perfexCRMConf),
    action_name: perfexCRMConf.actionName
  }

  bitsFetch(requestParams, 'perfexcrm_custom_fields')
    .then(result => {
      if (result && result.success) {
        setPerfexCRMConf(prevPerfexCRMConf =>
          create(prevPerfexCRMConf, draftConf => {
            draftConf.perfexCRMFields = ''
            draftConf.field_map = [{ formField: '', perfexCRMFormField: '' }]

            if (result.data) {
              if (draftConf.actionName === 'customer') {
                draftConf.perfexCRMFields = draftConf.customerFields
              } else if (draftConf.actionName === 'contact') {
                draftConf.perfexCRMFields = draftConf.contactFields
              } else if (draftConf.actionName === 'lead') {
                draftConf.perfexCRMFields = draftConf.leadFields
              } else if (draftConf.actionName === 'project') {
                draftConf.perfexCRMFields = draftConf.projectFields
              }

              draftConf.perfexCRMFields = [...draftConf.perfexCRMFields, ...result.data]
              draftConf.field_map = generateMappedField(draftConf)
            }

            return draftConf
          })
        )

        setSnackbar({
          show: true,
          msg: __('Custom fields refreshed', 'bit-integrations')
        })
      } else {
        setSnackbar({
          show: true,
          msg: __('Custom fields refresh failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

const generateMappedField = perfexCRMConf => {
  const requiredFlds =
    perfexCRMConf?.perfexCRMFields &&
    perfexCRMConf?.perfexCRMFields.filter(
      fld => fld.required === true && fld.key !== 'owner' && fld.key !== 'pipeline'
    )
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        perfexCRMFormField: field.key
      }))
    : [{ formField: '', perfexCRMFormField: '' }]
}

export const checkMappedFields = perfexCRMConf => {
  const mappedFields = perfexCRMConf?.field_map
    ? perfexCRMConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.perfexCRMFormField ||
          (mappedField.formField === 'custom' && !mappedField.customValue) ||
          (mappedField.perfexCRMFormField === 'customFieldKey' && !mappedField.customFieldKey)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}

export const getAllCustomer = (confTmp, setConf, loading, setLoading) => {
  setLoading({ ...loading, customers: true })

  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'perfexcrm_fetch_all_customers').then(result => {
    if (result && result.success) {
      setConf(prevConf =>
        create(prevConf, draftConf => {
          if (result.data) {
            draftConf.customers = result.data
          }
        })
      )
      setLoading({ ...loading, customers: false })

      toast.success(__('Customer fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...loading, customers: false })
    toast.error(__(String(result?.data) ? result?.data : 'Customer Not Found!', 'bit-integrations'))
  })
}
export const getAllLeads = (confTmp, setConf, loading, setLoading) => {
  setLoading({ ...loading, leads: true })

  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'perfexcrm_fetch_all_leads').then(result => {
    if (result && result.success) {
      setConf(prevConf =>
        create(prevConf, draftConf => {
          if (result.data) {
            draftConf.leads = result.data
          }
        })
      )
      setLoading({ ...loading, leads: false })

      toast.success(__('Lead fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...loading, leads: false })
    toast.error(__(String(result?.data) ? result?.data : 'Lead Not Found!', 'bit-integrations'))
  })
}
export const getAllStaffs = (confTmp, setConf, loading, setLoading) => {
  setLoading({ ...loading, staffs: true })

  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'perfexcrm_fetch_all_staffs').then(result => {
    if (result && result.success) {
      setConf(prevConf =>
        create(prevConf, draftConf => {
          if (result.data) {
            draftConf.staffs = result.data
          }
        })
      )
      setLoading({ ...loading, staffs: false })

      toast.success(__('Project Member fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...loading, staffs: false })
    toast.error(
      String(result?.data) ? result?.data : __('Project Member Not Found!', 'bit-integrations')
    )
  })
}
