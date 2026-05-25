import { create } from 'mutative'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import {
  requiredDocumentationSelectionActions,
  requiredSectionSelectionActions,
  weDocsActionFields
} from './staticData'

export const handleInput = (e, weDocsConf, setWeDocsConf) => {
  const newConf = create(weDocsConf, draftConf => {
    draftConf[e.target.name] = e.target.value
  })
  setWeDocsConf(newConf)
}

export const generateMappedField = () => {
  const requiredFlds = weDocsActionFields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', weDocsField: field.key }))
    : [{ formField: '', weDocsField: '' }]
}

export const checkMappedFields = weDocsConf => {
  const { mainAction, field_map: fieldMap = [] } = weDocsConf || {}

  if (!mainAction) {
    return false
  }

  if (
    requiredDocumentationSelectionActions.includes(mainAction) &&
    (!weDocsConf?.selectedDocumentationId)
  ) {
    return false
  }

  if (
    requiredSectionSelectionActions.includes(mainAction) &&
    (!weDocsConf?.selectedSectionId)
  ) {
    return false
  }

  const requiredFields = weDocsActionFields.filter(field => field.required)
  if (!requiredFields.length) {
    return true
  }

  return requiredFields.every(requiredField =>
    fieldMap.some(
      mappedField =>
        mappedField?.weDocsField === requiredField.key &&
        mappedField?.formField &&
        (mappedField.formField !== 'custom' || mappedField?.customValue)
    )
  )
}

export const refreshDocumentations = (setWeDocsConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)

  bitsFetch({}, 'wedocs_get_documentations')
    .then(result => {
      if (result?.success) {
        setWeDocsConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf.documentations = result?.data?.documentations || []
          })
        )
      } else {
        setSnackbar({
          show: true,
          msg: result?.data || __('Failed to fetch documentations', 'bit-integrations')
        })
      }
    })
    .catch(() => {
      setSnackbar({
        show: true,
        msg: __('Failed to fetch documentations', 'bit-integrations')
      })
    })
    .finally(() => {
      setIsLoading(false)
    })
}

export const refreshSections = (documentationId, setWeDocsConf, setIsLoading, setSnackbar) => {
  if (!documentationId) {
    setWeDocsConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.sections = []
      })
    )
    return
  }

  setIsLoading(true)

  bitsFetch({ documentation_id: documentationId }, 'wedocs_get_sections')
    .then(result => {
      if (result?.success) {
        setWeDocsConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf.sections = result?.data?.sections || []
          })
        )
      } else {
        setSnackbar({
          show: true,
          msg: result?.data || __('Failed to fetch sections', 'bit-integrations')
        })
      }
    })
    .catch(() => {
      setSnackbar({
        show: true,
        msg: __('Failed to fetch sections', 'bit-integrations')
      })
    })
    .finally(() => {
      setIsLoading(false)
    })
}

