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

export const generateMappedField = lmfwcFields => {
  const requiredFlds = lmfwcFields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        lmfwcFormField: field.key
      }))
    : [{ formField: '', lmfwcFormField: '' }]
}

export const checkMappedFields = licenseManagerConf => {
  const mappedFields = licenseManagerConf?.field_map
    ? licenseManagerConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.lmfwcFormField ||
          (mappedField.formField === 'custom' && !mappedField.customValue) ||
          (mappedField.lmfwcFormField === 'customFieldKey' && !mappedField.customFieldKey)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}

const buildAuthRequestParams = confTmp => {
  if (confTmp?.connection_id) {
    return { connection_id: confTmp.connection_id }
  }

  return {
    base_url: confTmp.base_url,
    api_key: confTmp.api_key,
    api_secret: confTmp.api_secret
  }
}

export const getAllCustomer = (confTmp, setConf, loading, setLoading) => {
  setLoading({ ...loading, customer: true })

  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'lmfwc_fetch_all_customer').then(result => {
    if (result && result.success) {
      if (result.data) {
        setConf(prevConf => {
          prevConf.customers = result.data
          return prevConf
        })

        setLoading({ ...loading, customer: false })
        toast.success(__('Customers fetched successfully', 'bit-integrations'))
        return
      }
      setLoading({ ...loading, customer: false })
      toast.error(__('Customers Not Found!', 'bit-integrations'))
      return
    }
    setLoading({ ...loading, customer: false })
    toast.error(__('Customers fetching failed', 'bit-integrations'))
  })
}

export const getAllProduct = (confTmp, setConf, loading, setLoading) => {
  setLoading({ ...loading, product: true })

  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'lmfwc_fetch_all_product').then(result => {
    if (result && result.success) {
      if (result.data) {
        setConf(prevConf => {
          prevConf.products = result.data
          return prevConf
        })

        setLoading({ ...loading, product: false })
        toast.success(__('Product fetched successfully', 'bit-integrations'))
        return
      }
      setLoading({ ...loading, product: false })
      toast.error(__('Product Not Found!', 'bit-integrations'))
      return
    }
    setLoading({ ...loading, product: false })
    toast.error(__('Product fetching failed', 'bit-integrations'))
  })
}

export const getAllOrder = (confTmp, setConf, loading, setLoading) => {
  setLoading({ ...loading, order: true })

  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'lmfwc_fetch_all_order').then(result => {
    if (result && result.success) {
      if (result.data) {
        setConf(prevConf => {
          prevConf.orders = result.data
          return prevConf
        })

        setLoading({ ...loading, order: false })
        toast.success(__('Order fetched successfully', 'bit-integrations'))
        return
      }
      setLoading({ ...loading, order: false })
      toast.error(__('Order Not Found!', 'bit-integrations'))
      return
    }
    setLoading({ ...loading, order: false })
    toast.error(__('Order fetching failed', 'bit-integrations'))
  })
}

export const getAllLicense = (confTmp, setConf, loading, setLoading) => {
  setLoading({ ...loading, license: true })

  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'lmfwc_fetch_all_license').then(result => {
    if (result && result.success) {
      if (result.data) {
        setConf(prevConf => {
          prevConf.licenses = result.data
          return prevConf
        })

        setLoading({ ...loading, license: false })
        toast.success(__('License fetched successfully', 'bit-integrations'))
        return
      }
      setLoading({ ...loading, license: false })
      toast.error(__('License Not Found!', 'bit-integrations'))
      return
    }
    setLoading({ ...loading, license: false })
    toast.error(__('License fetching failed', 'bit-integrations'))
  })
}

export const getAllGenerator = (confTmp, setConf, loading, setLoading) => {
  setLoading({ ...loading, generator: true })

  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'lmfwc_fetch_all_generator').then(result => {
    if (result && result.success) {
      if (result.data) {
        setConf(prevConf => {
          prevConf.generators = result.data
          return prevConf
        })

        setLoading({ ...loading, generator: false })
        toast.success(__('Generator fetched successfully', 'bit-integrations'))
        return
      }
      setLoading({ ...loading, generator: false })
      toast.error(__('Generator Not Found!', 'bit-integrations'))
      return
    }
    setLoading({ ...loading, generator: false })
    toast.error(__('Generator fetching failed', 'bit-integrations'))
  })
}
