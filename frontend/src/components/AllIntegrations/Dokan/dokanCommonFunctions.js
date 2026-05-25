/* eslint-disable no-console */
/* eslint-disable no-else-return */
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import { create } from 'mutative'
import { TASK_LIST_VALUES } from './dokanConstants'

export const handleInput = (e, dokanConf, setDokanConf) => {
  const newConf = create(dokanConf, draftConf => {
    const { name } = e.target
    if (e.target.value !== '') {
      draftConf[name] = e.target.value
    } else {
      delete draftConf[name]
    }
  })

  setDokanConf(newConf)
}

export const checkMappedFields = dokanConf => {
  const mappedFields = dokanConf?.field_map
    ? dokanConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.dokanField ||
          (!mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}


export const getAllVendors = (confTmp, setConf, loading, setLoading) => {
  setLoading({ ...loading, vendors: true })

  bitsFetch({}, 'dokan_fetch_vendors').then(result => {
    if (result.success && result.data) {
      const newConf = { ...confTmp }
      newConf.vendors = result.data
      setConf(newConf)
      setLoading({ ...loading, vendors: false })
      toast.success(__('Vendors fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...loading, vendors: false })
    toast.error(__(result?.data ? result.data : 'Something went wrong!', 'bit-integrations'))
  })
}

export const getDokanEUFields = (confTmp, setConf, loading, setLoading) => {
  toast.success('Fields fetched successfully.')
  setLoading({ ...loading, euFields: true })

  bitsFetch({}, 'dokan_fetch_eu_fields').then(result => {
    if (result.success && result.data) {
      const newConf = { ...confTmp }

      if (newConf.staticFields) {
        const defaultFields = newConf.staticFields
        const mergedFields = defaultFields.concat(result.data)
        newConf.staticFields = mergedFields
      }

      if (confTmp.selectedTask === TASK_LIST_VALUES.UPDATE_VENDOR) {
        getAllVendors(newConf, setConf, loading, setLoading)
      }

      setConf(newConf)
      setLoading({ ...loading, euFields: false })
      toast.success(__('EU Compliance Fields fetched successfully', 'bit-integrations'))
      return
    }

    if (confTmp.selectedTask === TASK_LIST_VALUES.UPDATE_VENDOR) {
      getAllVendors(confTmp, setConf, loading, setLoading)
    }
    setLoading({ ...loading, euFields: false })
    toast.error(result?.data ? result.data : __('Something went wrong!', 'bit-integrations'))
  })
}

export const dokanStaticFields = selectedTask => {
  if (
    selectedTask === TASK_LIST_VALUES.CREATE_VENDOR ||
    selectedTask === TASK_LIST_VALUES.UPDATE_VENDOR
  ) {
    return {
      staticFields: [
        {
          key: 'email',
          label: __('Email', 'bit-integrations'),
          required: selectedTask === TASK_LIST_VALUES.CREATE_VENDOR ? true : false
        },
        {
          key: 'user_login',
          label: __('Username', 'bit-integrations'),
          required: selectedTask === TASK_LIST_VALUES.CREATE_VENDOR ? true : false
        },
        {
          key: 'store_name',
          label: __('Store Name', 'bit-integrations'),
          required: selectedTask === TASK_LIST_VALUES.CREATE_VENDOR ? true : false
        },
        { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
        { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false },
        { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
        {
          key: 'payment_bank_ac_name',
          label: __('Account Name', 'bit-integrations'),
          required: false
        },
        {
          key: 'payment_bank_ac_type',
          label: __('Account Type', 'bit-integrations'),
          required: false
        },
        {
          key: 'payment_bank_ac_number',
          label: __('Account Number', 'bit-integrations'),
          required: false
        },
        {
          key: 'payment_bank_bank_name',
          label: __('Bank Name', 'bit-integrations'),
          required: false
        },
        {
          key: 'payment_bank_bank_addr',
          label: __('Bank Address', 'bit-integrations'),
          required: false
        },
        {
          key: 'payment_bank_routing_number',
          label: __('Routing Number', 'bit-integrations'),
          required: false
        },
        { key: 'payment_bank_iban', label: __('IBAN', 'bit-integrations'), required: false },
        { key: 'payment_bank_swift', label: __('Swift', 'bit-integrations'), required: false },
        {
          key: 'payment_paypal_email',
          label: __('PayPal Email', 'bit-integrations'),
          required: false
        },
        { key: 'street_1', label: __('Street 1', 'bit-integrations'), required: false },
        { key: 'street_2', label: __('Street 2', 'bit-integrations'), required: false },
        { key: 'city', label: __('City', 'bit-integrations'), required: false },
        { key: 'zip', label: __('Zip', 'bit-integrations'), required: false },
        { key: 'state', label: __('State', 'bit-integrations'), required: false },
        { key: 'country', label: __('Country', 'bit-integrations'), required: false }
      ],

      fieldMap:
        selectedTask === TASK_LIST_VALUES.CREATE_VENDOR
          ? [
              { formField: '', dokanField: 'email' },
              { formField: '', dokanField: 'user_login' },
              { formField: '', dokanField: 'store_name' }
            ]
          : [{ formField: '', dokanField: '' }]
    }
  } else if (selectedTask === TASK_LIST_VALUES.DELETE_VENDOR) {
    return {
      staticFields: [
        { key: 'vendor_email', label: __('Vendor Email', 'bit-integrations'), required: true },
        {
          key: 'reassign_email',
          label: __('Reassign (Email)', 'bit-integrations'),
          required: false
        }
      ],
      fieldMap: [{ formField: '', dokanField: 'vendor_email' }]
    }
  } else if (selectedTask === TASK_LIST_VALUES.WITHDRAW_REQUEST) {
    return {
      staticFields: [
        { key: 'amount', label: __('Amount', 'bit-integrations'), required: true },
        { key: 'note', label: __('Note', 'bit-integrations'), required: false }
      ],
      fieldMap: [{ formField: '', dokanField: 'amount' }]
    }
  } else if (selectedTask === TASK_LIST_VALUES.REFUND_REQUEST) {
    return {
      staticFields: [
        { key: 'order_id', label: __('Order ID', 'bit-integrations'), required: true },
        { key: 'refund_amount', label: __('Refund Amount', 'bit-integrations'), required: true },
        { key: 'refund_reason', label: __('Refund Reason', 'bit-integrations'), required: false }
      ],
      fieldMap: [
        { formField: '', dokanField: 'order_id' },
        { formField: '', dokanField: 'refund_amount' }
      ]
    }
  }

  return { staticFields: [], fieldMap: [] }
}
