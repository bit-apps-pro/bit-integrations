// eslint-disable-next-line import/no-extraneous-dependencies
import { __, sprintf } from '../../../Utils/i18nwrap'
import bitsFetch from '../../../Utils/bitsFetch'
import { create } from 'mutative'

export const handleInput = (e, convertKitConf, setConvertKitConf) => {
  const newConf = { ...convertKitConf }
  newConf.name = e.target.value
  setConvertKitConf({ ...newConf })
}

const buildAuthRequestParams = conf =>
  conf.connection_id ? { connection_id: conf.connection_id } : { api_secret: conf.api_secret }

export const refreshConvertKitForm = (convertKitConf, setConvertKitConf, setIsLoading, setSnackbar) => {
  const refreshFormsRequestParams = {
    ...buildAuthRequestParams(convertKitConf)
  }
  bitsFetch(refreshFormsRequestParams, 'convertKit_forms')
    .then(result => {
      if (result && result.success) {
        if (result.data.convertKitForms) {
          setConvertKitConf(prevConf =>
            create(prevConf, draftConf => {
              if (!draftConf.default) {
                draftConf.default = {}
              }

              draftConf.default.convertKitForms = result.data.convertKitForms
            })
          )
          refreshConvertKitTags(convertKitConf, setConvertKitConf, setIsLoading, setSnackbar)

          setSnackbar({
            show: true,
            msg: __('Convert Kit forms refreshed', 'bit-integrations')
          })
        } else {
          setSnackbar({
            show: true,
            msg: __(
              'No Convert Kit forms found. Try changing the header row number or try again',
              'bit-integrations'
            )
          })
        }
      } else {
        setSnackbar({
          show: true,
          msg: sprintf(
            __('%s forms refresh failed. please try again', 'bit-integrations'),
            'Kit(ConvertKit)'
          )
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}
// refreshConvertKitTags
export const refreshConvertKitTags = (convertKitConf, setConvertKitConf, setIsLoading, setSnackbar) => {
  const refreshFormsRequestParams = {
    ...buildAuthRequestParams(convertKitConf)
  }
  bitsFetch(refreshFormsRequestParams, 'convertKit_tags')
    .then(result => {
      if (result && result.success) {
        if (result.data.convertKitTags) {
          setConvertKitConf(prevConf =>
            create(prevConf, draftConf => {
              if (!draftConf.default) {
                draftConf.default = {}
              }

              draftConf.default.convertKitTags = result.data.convertKitTags
            })
          )

          setSnackbar({
            show: true,
            msg: sprintf(__('%s tags refreshed', 'bit-integrations'), 'Kit(ConvertKit)')
          })
        } else {
          setSnackbar({
            show: true,
            msg: sprintf(
              __(
                'No %s tags found. Try changing the header row number or try again',
                'bit-integrations'
              ),
              'Kit(ConvertKit)'
            )
          })
        }
      } else {
        setSnackbar({
          show: true,
          msg: sprintf(
            __('%s tags refresh failed. please try again', 'bit-integrations'),
            'Kit(ConvertKit)'
          )
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}
// refreshMappedFields
export const refreshConvertKitHeader = (
  convertKitConf,
  setConvertKitConf,
  setIsLoading,
  setSnackbar
) => {
  if (
    convertKitConf?.module === 'add_tags_to_a_subscriber' ||
    convertKitConf?.module === 'remove_tags_to_a_subscriber'
  ) {
    setConvertKitConf(prevConf =>
      create(prevConf, draftConf => {
        if (!draftConf.default) {
          draftConf.default = {}
        }

        draftConf.default.fields = { Email: { fieldId: 'email', fieldName: 'Email', required: true } }
        draftConf.field_map = [
          {
            formField: '',
            convertKitField: 'email',
            required: true
          }
        ]
      })
    )

    setSnackbar({
      show: true,
      msg: sprintf(__('%s fields refreshed', 'bit-integrations'), 'Kit(ConvertKit)')
    })
  } else {
    const refreshFormsRequestParams = {
      ...buildAuthRequestParams(convertKitConf)
    }

    bitsFetch(refreshFormsRequestParams, 'convertKit_headers')
      .then(result => {
        if (result && result.success) {
          if (result.data.convertKitField) {
            setConvertKitConf(prevConf =>
              create(prevConf, draftConf => {
                if (!draftConf.default) {
                  draftConf.default = {}
                }
                draftConf.default.fields = result.data.convertKitField
                const { fields } = draftConf.default
                draftConf.field_map = Object.values(fields)
                  .filter(f => f.required)
                  .map(f => ({
                    formField: '',
                    convertKitField: f.fieldId,
                    required: true
                  }))
              })
            )

            setSnackbar({
              show: true,
              msg: sprintf(__('%s fields refreshed', 'bit-integrations'), 'Kit(ConvertKit)')
            })
          } else {
            setSnackbar({
              show: true,
              msg: sprintf(
                __(
                  'No %s fields found. Try changing the header row number or try again',
                  'bit-integrations'
                ),
                'Kit(ConvertKit)'
              )
            })
          }
        } else {
          setSnackbar({
            show: true,
            msg: sprintf(
              __('%s fields refresh failed. please try again', 'bit-integrations'),
              'Kit(ConvertKit)'
            )
          })
        }
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }
}

export const checkMappedFields = convertKitConf => {
  const mappedFields = convertKitConf?.field_map
    ? convertKitConf.field_map.filter(
        mappedField => !mappedField.formField && mappedField.convertKitField && mappedField.required
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}
