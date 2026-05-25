import { create } from 'mutative'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'


export const generateMappedField = wishlistFields => {
  const requiredFields = wishlistFields.filter(fld => fld?.required === true)

  return requiredFields.length > 0
    ? requiredFields.map(field => ({ formField: '', wishlistMemberField: field.key }))
    : [{ formField: '', wishlistMemberField: '' }]
}

export const addFieldMap = (indx, setWishlistMemberConf) => {
  setWishlistMemberConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf.field_map.splice(indx, 0, {})
    })
  )
}

export const deleteFieldMap = (indx, setWishlistMemberConf) => {
  setWishlistMemberConf(prevConf =>
    create(prevConf, draftConf => {
      if (draftConf.field_map.length > 1) {
        draftConf.field_map.splice(indx, 1)
      }
    })
  )
}

const checkMappedFields = wishlistMemberConf => {
  const mappedField = wishlistMemberConf.field_map.filter(
    mapped => mapped.formField && mapped.wishlistMemberField
  )

  return mappedField.length > 0 ? false : true
}

export const setIntegrationName = (e, setWishlistMemberConf) => {
  setWishlistMemberConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[e.target.name] = e.target.value
    })
  )
}

export const checkValidation = wishlistMemberConf => {
  let check = false

  if (wishlistMemberConf?.action === '') {
    check = true
  }

  return checkMappedFields(wishlistMemberConf) || check
}

export const refreshLevels = (setWishlistMemberConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  bitsFetch({}, 'get_wishlist_levels')
    .then(result => {
      if (result && result.success) {
        setIsLoading(false)
        setWishlistMemberConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf.levels = result?.data || []
          })
        )

        setSnackbar({ show: true, msg: __('Membership levels refreshed', 'bit-integrations') })

        return
      }
      setSnackbar({
        show: true,
        msg: __('Membership levels refresh failed. please try again', 'bit-integrations')
      })
    })
    .catch(() => setIsLoading(false))
}
