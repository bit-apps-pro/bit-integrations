/* eslint-disable no-unused-vars */
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __, sprintf } from '../../../Utils/i18nwrap'
import { SmartTagField } from '../../../Utils/StaticData/SmartTagField'
import MtInput from '../../Utilities/MtInput'
import TagifyInput from '../../Utilities/TagifyInput'
import { addFieldMap, delFieldMap, handleFieldMapping } from '../GlobalIntegrationHelper'
import { handleCustomValue } from '../IntegrationHelpers/IntegrationHelpers'
import { generateMappedField } from './NotionCommonFunc'

function NotionFieldMap({ i, field, formFields, notionConf, setNotionConf }) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  if (notionConf?.field_map?.length === 1 && field.notionFormFields === '') {
    const newConf = { ...notionConf }
    const tmp = generateMappedField(newConf)
    newConf.field_map = tmp
    setNotionConf(newConf)
  }

  const requiredFields = notionConf?.notionFields?.filter(fld => fld.required === true) || []
  const nonrequiredFields = notionConf?.notionFields?.filter(fld => fld.required === false) || []

  return (
    <div className="flx mt-2 mb-2 btcbi-field-map">
      <div className="pos-rel flx">
        <div className="flx integ-fld-wrp">
          <select
            className="btcd-paper-inp mr-2"
            name="formFields"
            onChange={event => {
              handleFieldMapping(event, i, notionConf, setNotionConf)
            }}
            value={field.formFields || ''}>
            <option value="">{__('Select Field')}</option>
            <optgroup label={__('Form Fields', 'bit-integrations')}>
              {formFields?.map(f => (
                <option key={`ff-rm-${f.name}`} value={f.name}>
                  {f.label}
                </option>
              ))}
            </optgroup>
            <option value="custom">{__('Custom...')}</option>
            <optgroup
              label={sprintf(
                __('General Smart Codes %s', 'bit-integrations'),
                isPro ? '' : `(${__('Pro', 'bit-integrations')})`
              )}>
              {isPro &&
                SmartTagField?.map(f => (
                  <option key={`ff-rm-${f.name}`} value={f.name}>
                    {f.label}
                  </option>
                ))}
            </optgroup>
          </select>

          {field.formFields === 'custom' && (
            <TagifyInput
              onChange={e => handleCustomValue(e, i, notionConf, setNotionConf)}
              label={__('Custom Value', 'bit-integrations')}
              className="mr-2"
              type="text"
              value={field.customValue}
              placeholder={__('Custom Value', 'bit-integrations')}
              formFields={formFields}
            />
          )}

          <select
            className="btcd-paper-inp"
            disabled={i < requiredFields.length}
            name="notionFormFields"
            onChange={event => {
              handleFieldMapping(event, i, notionConf, setNotionConf)
            }}
            value={
              i < requiredFields.length ? requiredFields[i].label || '' : field.notionFormFields || ''
            }>
            <option value="">{__('Select Field')}</option>
            {i < requiredFields.length ? (
              <option key={requiredFields[i].key} value={requiredFields[i].label}>
                {requiredFields[i].label}
              </option>
            ) : (
              nonrequiredFields.map(({ key, label }) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))
            )}
          </select>
        </div>

        <button
          onClick={() => addFieldMap(i, notionConf, setNotionConf)}
          className="icn-btn sh-sm ml-2 mr-1"
          type="button">
          +
        </button>
        <button
          onClick={() => delFieldMap(i, notionConf, setNotionConf)}
          className="icn-btn sh-sm ml-1"
          type="button"
          aria-label="btn">
          <span className="btcd-icn icn-trash-2" />
        </button>
      </div>
    </div>
  )
}

export default NotionFieldMap
