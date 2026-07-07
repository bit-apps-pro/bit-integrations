import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, modernCartConf, setModernCartConf) => {
  const { name, value } = e.target

  setModernCartConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

export const refreshModernCartProducts = (setModernCartConf, setIsLoading) => {
  setIsLoading(true)
  bitsFetch(null, 'refresh_modern_cart_products')
    .then(result => {
      if (result?.success && result?.data?.products) {
        setModernCartConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf.allProducts = result.data.products
          })
        )
        toast.success(__('All products fetched successfully', 'bit-integrations'))
      } else {
        toast.error(__('Modern Cart products fetch failed. Please try again', 'bit-integrations'))
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const refreshModernCartProductVariations = (productId, setModernCartConf, setIsLoading) => {
  if (!productId) {
    toast.error(__('Please select a product first', 'bit-integrations'))
    return
  }

  setIsLoading(true)
  bitsFetch({ productId }, 'refresh_modern_cart_product_variations')
    .then(result => {
      if (result?.success && result?.data?.variations) {
        setModernCartConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf.allProductVariations = result.data.variations
          })
        )
        toast.success(__('Product variations fetched successfully', 'bit-integrations'))
      } else {
        toast.error(
          __('Modern Cart product variations fetch failed. Please try again', 'bit-integrations')
        )
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const refreshModernCartCartItems = (setModernCartConf, setIsLoading) => {
  setIsLoading(true)
  bitsFetch(null, 'refresh_modern_cart_cart_items')
    .then(result => {
      if (result?.success && result?.data?.cartItems) {
        setModernCartConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf.allCartItems = result.data.cartItems
          })
        )
        toast.success(__('Cart items fetched successfully', 'bit-integrations'))
      } else {
        toast.error(__('Modern Cart cart items fetch failed. Please try again', 'bit-integrations'))
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const checkMappedFields = modernCartConf => {
  if (!modernCartConf?.mainAction) {
    return false
  }

  if (modernCartConf.mainAction === 'add_product_to_cart' && !modernCartConf?.productId) {
    return false
  }

  if (modernCartConf.mainAction === 'update_cart_quantity' && !modernCartConf?.cartItemKey) {
    return false
  }

  const requiredFields = modernCartConf?.modernCartFields?.filter(fld => fld.required) || []
  const fieldMap = modernCartConf?.field_map || []

  const requiredFieldsMapped = requiredFields.every(requiredField =>
    fieldMap.some(
      mappedField =>
        mappedField.modernCartField === requiredField.key &&
        mappedField.formField &&
        (mappedField.formField !== 'custom' || mappedField.customValue)
    )
  )

  if (!requiredFieldsMapped) {
    return false
  }

  const invalidMappedFields = fieldMap.filter(mappedField => {
    const hasAnyValue = mappedField.formField || mappedField.modernCartField || mappedField.customValue

    if (!hasAnyValue) {
      return false
    }

    return (
      !mappedField.formField ||
      !mappedField.modernCartField ||
      (mappedField.formField === 'custom' && !mappedField.customValue)
    )
  })

  return invalidMappedFields.length === 0
}

export const generateMappedField = fields => {
  const requiredFlds = fields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        modernCartField: field.key
      }))
    : [{ formField: '', modernCartField: '' }]
}
