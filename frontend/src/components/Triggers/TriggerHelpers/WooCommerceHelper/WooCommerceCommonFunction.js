import toast from 'react-hot-toast'
import bitsFetch from '../../../../Utils/bitsFetch'
import { __ } from '../../../../Utils/i18nwrap'
import { create } from 'mutative'

export const getAllOrderStatus = (data, setFlow) => {
  const loadPostTypes = bitsFetch(null, 'get_all_order_status', null, 'GET').then(result => {
    if (result && result.success) {
      const tmpFlow = { ...data }
      tmpFlow.flow_details.orderStatus = result.data
      setFlow({ ...tmpFlow })
      return __('Fetched order status successfully', 'bit-integrations')
    }
    return __('Order status fetching failed. please try again', 'bit-integrations')
  })
  toast.promise(loadPostTypes, {
    success: data => data,
    error: __('Error Occurred', 'bit-integrations'),
    loading: __('Loading order status...')
  })
}

export const getAllWCProducts = (data, setFlow) => {
  const loadQuizType = bitsFetch(null, 'get_all_woocommerce_product', null, 'GET').then(result => {
    if (result && result.success) {
      const tmpFlow = { ...data }
      tmpFlow.flow_details.products = result.data
      setFlow({ ...tmpFlow })
      return __('Fetched all product successfully', 'bit-integrations')
    }
    return __('All product fetching failed. please try again', 'bit-integrations')
  })
  toast.promise(loadQuizType, {
    success: data => data,
    error: __('Error Occurred', 'bit-integrations'),
    loading: __('Loading all product...')
  })
}

export const getAllWCProductCategory = (data, setFlow) => {
  const loadQuizType = bitsFetch(null, 'get_all_product_category', null, 'GET').then(result => {
    if (result && result.success) {
      const tmpFlow = { ...data }
      tmpFlow.flow_details.allProductCategories = result.data
      setFlow({ ...tmpFlow })
      return __('All product categories fetched successfully', 'bit-integrations')
    }
    return __('Product categories fetching failed. please try again', 'bit-integrations')
  })
  toast.promise(loadQuizType, {
    success: data => data,
    error: __('Error Occurred', 'bit-integrations'),
    loading: __('Loading categories product...')
  })
}

export const getVariationsByProduct = (val, tmpNewFlow, setNewFlow, edit = false) => {
  const queryParams = { product_id: val }
  const loadPostTypes = bitsFetch(null, 'get_all_variation_by_product', queryParams, 'GET').then(
    result => {
      if (result && result.success) {
        // rubel vai code with immer js
        setNewFlow(
          create(tmpNewFlow, draftConf => {
            if (!edit) {
              draftConf.triggerData.allVariation = result.data
            } else {
              if (draftConf.flow_details === undefined) {
                draftConf.flow_details = {}
              }
              draftConf.flow_details.allVariation = result.data
            }
          })
        )

        return __('Fetched all variation successfully', 'bit-integrations')
      }
      return __('Variation fetching failed. please try again', 'bit-integrations')
    }
  )
  toast.promise(loadPostTypes, {
    success: data => data,
    error: __('Error Occurred here', 'bit-integrations'),
    loading: __('Loading variation...')
  })
}
