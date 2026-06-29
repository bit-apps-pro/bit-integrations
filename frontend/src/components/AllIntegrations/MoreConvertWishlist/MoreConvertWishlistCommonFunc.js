import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, moreConvertWishlistConf, setMoreConvertWishlistConf) => {
  const { name, value } = e.target

  setMoreConvertWishlistConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

export const refreshMoreConvertWishlistWishlists = (setMoreConvertWishlistConf, setIsLoading) => {
  setIsLoading(true)
  bitsFetch(null, 'refresh_more_convert_wishlist_wishlists')
    .then(result => {
      if (result && result?.success && result?.data?.wishlists) {
        setMoreConvertWishlistConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf.allWishlists = result.data.wishlists
          })
        )

        setIsLoading(false)
        toast.success(__('All wishlists fetched successfully', 'bit-integrations'))
        return
      }
      setIsLoading(false)
      toast.error(
        __('MoreConvert Wishlist wishlists fetch failed. Please try again', 'bit-integrations')
      )
    })
    .catch(() => setIsLoading(false))
}

export const refreshMoreConvertWishlistCustomers = (setMoreConvertWishlistConf, setIsLoading) => {
  setIsLoading(true)
  bitsFetch(null, 'refresh_more_convert_wishlist_customers')
    .then(result => {
      if (result && result?.success && result?.data?.customers) {
        setMoreConvertWishlistConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf.allCustomers = result.data.customers
          })
        )

        setIsLoading(false)
        toast.success(__('All customers fetched successfully', 'bit-integrations'))
        return
      }
      setIsLoading(false)
      toast.error(
        __('MoreConvert Wishlist customers fetch failed. Please try again', 'bit-integrations')
      )
    })
    .catch(() => setIsLoading(false))
}

export const refreshMoreConvertWishlistUsers = (setMoreConvertWishlistConf, setIsLoading) => {
  setIsLoading(true)
  bitsFetch(null, 'refresh_more_convert_wishlist_users')
    .then(result => {
      if (result && result?.success && result?.data?.users) {
        setMoreConvertWishlistConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf.allUsers = result.data.users
          })
        )

        setIsLoading(false)
        toast.success(__('All users fetched successfully', 'bit-integrations'))
        return
      }
      setIsLoading(false)
      toast.error(__('MoreConvert Wishlist users fetch failed. Please try again', 'bit-integrations'))
    })
    .catch(() => setIsLoading(false))
}

export const checkMappedFields = moreConvertWishlistConf => {
  const mappedFields = moreConvertWishlistConf?.field_map
    ? moreConvertWishlistConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.moreConvertWishlistField ||
          (mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}

export const generateMappedField = fields => {
  const requiredFlds = fields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        moreConvertWishlistField: field.key
      }))
    : [{ formField: '', moreConvertWishlistField: '' }]
}
