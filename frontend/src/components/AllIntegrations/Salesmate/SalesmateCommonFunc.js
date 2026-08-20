/* eslint-disable no-console */
/* eslint-disable no-else-return */
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, salesmateConf, setSalesmateConf) => {
  const newConf = { ...salesmateConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setSalesmateConf({ ...newConf })
}

const buildAuthRequestParams = confTmp =>
  confTmp.connection_id
    ? { connection_id: confTmp.connection_id }
    : { session_token: confTmp.session_token, link_name: confTmp.link_name }

// refreshMappedFields
export const refreshSalesmateFields = (salesmateConf, setSalesmateConf, setIsLoading, setSnackbar) => {
  const requestParams = { ...buildAuthRequestParams(salesmateConf), action_id: salesmateConf.actionId }

  bitsFetch(requestParams, 'Salesmate_fields')
    .then(result => {
      if (result && result.success) {
        setSalesmateConf(prevSalesmateConf => {
          const draftConf = { ...prevSalesmateConf }
          draftConf.field_map = [{ formField: '', salesmateFormField: '' }]

          if (result.data) {
            draftConf.salesmateFields = result.data
            draftConf.field_map = generateMappedField(draftConf)
          }
          return draftConf
        })
        setSnackbar({
          show: true,
          msg: __('Salesmate fields refreshed', 'bit-integrations')
        })
      } else {
        setSnackbar({
          show: true,
          msg: __('Salesmate fields refresh failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

const generateMappedField = salesmateConf => {
  const requiredFlds =
    salesmateConf?.salesmateFields &&
    salesmateConf?.salesmateFields.filter(
      fld => fld.required === true && fld.key !== 'owner' && fld.key !== 'pipeline'
    )
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        salesmateFormField: field.key
      }))
    : [{ formField: '', salesmateFormField: '' }]
}

export const checkMappedFields = salesmateConf => {
  const mappedFields = salesmateConf?.field_map
    ? salesmateConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.salesmateFormField ||
          (mappedField.formField === 'custom' && !mappedField.customValue) ||
          (mappedField.salesmateFormField === 'customFieldKey' && !mappedField.customFieldKey)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}

export const getAllTags = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, tags: true })

  bitsFetch(buildAuthRequestParams(confTmp), 'salesmate_fetch_all_tags').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.tags = result.data
      }
      setConf(newConf)
      setLoading({ ...setLoading, tags: false })

      toast.success(__('Tags fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...setLoading, tags: false })
    toast.error(__('Tags fetching failed', 'bit-integrations'))
  })
}

export const getAllCRMTypes = setConf => {
  const fieldOptions = ['Customer', 'Lead', 'Vendor', 'Partner', 'Competitor', 'Reseller', 'Other']
  setConf(prevConf => {
    const newConf = { ...prevConf }
    newConf.types = fieldOptions
    return newConf
  })

  toast.success(__('Types fetched successfully', 'bit-integrations'))

  return fieldOptions
}

export const getAllCRMLostReasons = setConf => {
  const fieldOptions = [
    'No Reason',
    'Need',
    'Timing',
    'Price',
    'Competition',
    'Feature',
    'Poor Qualification'
  ]
  setConf(prevConf => {
    const newConf = { ...prevConf }
    newConf.lostReasons = fieldOptions
    return newConf
  })

  toast.success(__('Lost Reason fetched successfully', 'bit-integrations'))
  return fieldOptions
}

export const getAllCRMSources = setConf => {
  const fieldOptions = ['Ads', 'Referrals', 'Website', 'Word of mouth']
  setConf(prevConf => {
    const newConf = { ...prevConf }
    newConf.sources = fieldOptions
    return newConf
  })

  toast.success(__('Source fetched successfully', 'bit-integrations'))
  return fieldOptions
}

export const getAllCRMStatus = setConf => {
  const fieldOptions = ['Open', 'Won', 'Lost']
  setConf(prevConf => {
    const newConf = { ...prevConf }
    newConf.statuses = fieldOptions
    return newConf
  })

  toast.success(__('Status fetched successfully', 'bit-integrations'))
  return fieldOptions
}

export const getAllCRMPriority = setConf => {
  const fieldOptions = ['High', 'Medium', 'Low']
  setConf(prevConf => {
    const newConf = { ...prevConf }
    newConf.priorities = fieldOptions
    return newConf
  })

  toast.success(__('Priority fetched successfully', 'bit-integrations'))
  return fieldOptions
}

export const getAllCRMCurrency = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, CRMCurrency: true })

  bitsFetch(buildAuthRequestParams(confTmp), 'salesmate_fetch_all_currencies').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.currencies = result.data
      }
      setConf(newConf)
      setLoading({ ...setLoading, CRMCurrency: false })

      toast.success(__('Currencies fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...setLoading, CRMCurrency: false })
    toast.error(__('Currencies fetching failed', 'bit-integrations'))
  })
}

export const getAllCRMCompany = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, CRMCompany: true })

  bitsFetch(buildAuthRequestParams(confTmp), 'salesmate_fetch_all_CRMCompanies').then(result => {
    if (result && result.success) {
      if (!result.data) {
        setLoading({ ...setLoading, CRMCompany: false })
        toast.error(__('Companies Not Found!', 'bit-integrations'))
        return
      }

      setConf(prevConf => {
        const draftConf = { ...prevConf }
        if (result.data) {
          draftConf.companies = result.data
        }
        return draftConf
      })
      setLoading({ ...setLoading, CRMCompany: false })

      toast.success(__('Companies fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...setLoading, CRMCompany: false })
    toast.error(__('Companies fetching failed', 'bit-integrations'))
  })
}

export const getAllCRMPipelines = (confTmp, setConf, loading, setLoading) => {
  setLoading({ ...loading, CRMPipelines: true })

  bitsFetch(buildAuthRequestParams(confTmp), 'salesmate_fetch_all_CRMPipelines').then(result => {
    setLoading({ ...loading, CRMPipelines: false })
    if (result && result.success) {
      setConf(prevConf => {
        const draftConf = { ...prevConf }
        if (result.data) {
          draftConf.CRMPipelines = result.data
        }
        return draftConf
      })
      toast.success(__('Pipelines fetched successfully', 'bit-integrations'))

      return
    }
    toast.error(__('Pipelines fetching failed', 'bit-integrations'))
  })
}
export const getAllCRMPrimaryContact = (confTmp, setConf, loading, setLoading) => {
  setLoading({ ...loading, CRMContacts: true })

  bitsFetch(buildAuthRequestParams(confTmp), 'salesmate_fetch_all_CRMContacts').then(result => {
    setLoading({ ...loading, CRMContacts: false })
    if (result && result.success) {
      if (!result.data) {
        toast.error(__('Contacts not found!', 'bit-integrations'))
        return
      }

      setConf(prevConf => {
        const draftConf = { ...prevConf }
        if (result.data) {
          draftConf.CRMContacts = result.data
        }
        return draftConf
      })
      toast.success(__('Contacts fetched successfully', 'bit-integrations'))

      return
    }
    toast.error(__('Contacts fetching failed', 'bit-integrations'))
  })
}

export const getAllCRMOwner = (confTmp, setConf, loading, setLoading) => {
  setLoading({ ...loading, CRMOwners: true })

  bitsFetch(buildAuthRequestParams(confTmp), 'salesmate_fetch_all_CRMOwners').then(result => {
    setLoading({ ...loading, CRMOwners: false })
    if (result && result.success) {
      setConf(prevConf => {
        const draftConf = { ...prevConf }
        if (result.data) {
          draftConf.CRMOwners = result.data
        }
        return draftConf
      })
      toast.success(__('Owner fetched successfully', 'bit-integrations'))

      return
    }
    toast.error(__('Owner fetching failed', 'bit-integrations'))
  })
}
