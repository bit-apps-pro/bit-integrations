import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __, sprintf } from '../../../Utils/i18nwrap'
import { SmartTagField } from '../../../Utils/StaticData/SmartTagField'
import MtInput from '../../Utilities/MtInput'
import TagifyInput from '../../Utilities/TagifyInput'
import { addFieldMap, delFieldMap, handleFieldMapping } from '../GlobalIntegrationHelper'
import { handleCustomValue } from '../IntegrationHelpers/IntegrationHelpers'
import { generateMappedField } from './MailercloudCommonFunc'

function MailercloudFieldMap({ i, field, formFields, mailercloudConf, setMailercloudConf }) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  if (mailercloudConf?.field_map?.length === 1 && field.mailercloudFormField === '') {
    const newConf = { ...mailercloudConf }
    const tmp = generateMappedField(newConf)
    newConf.field_map = tmp
    setMailercloudConf(newConf)
  }

  const requiredFields = mailercloudConf?.default?.fields.filter(fld => fld.required === true) || []

  const nonrequiredFields = mailercloudConf?.default?.fields.filter(fld => fld.required === false) || []

  return (
    <div className="flx mt-2 mb-2 btcbi-field-map">
      <div className="pos-rel flx">
        <div className="flx integ-fld-wrp">
          <select
            className="btcd-paper-inp mr-2"
            name="formField"
            onChange={event => {
              handleFieldMapping(event, i, mailercloudConf, setMailercloudConf)
            }}
            value={field.formField || ''}>
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

          {field.formField === 'custom' && (
            <TagifyInput
              onChange={e => handleCustomValue(e, i, mailercloudConf, setMailercloudConf)}
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
            name="mailercloudFormField"
            onChange={event => {
              handleFieldMapping(event, i, mailercloudConf, setMailercloudConf)
            }}
            value={
              i < requiredFields.length ? requiredFields[i].key || '' : field.mailercloudFormField || ''
            }>
            <option value="">{__('Select Field')}</option>
            {i < requiredFields.length ? (
              <option key={requiredFields[i].key} value={requiredFields[i].key}>
                {requiredFields[i].label}
              </option>
            ) : (
              nonrequiredFields.map(({ key, label }) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))
            )}
          </select>
        </div>

        <button
          onClick={() => addFieldMap(i, mailercloudConf, setMailercloudConf)}
          className="icn-btn sh-sm ml-2 mr-1"
          type="button">
          +
        </button>
        <button
          onClick={() => delFieldMap(i, mailercloudConf, setMailercloudConf)}
          className="icn-btn sh-sm ml-1"
          type="button"
          aria-label="btn">
          <span className="btcd-icn icn-trash-2" />
        </button>
      </div>
    </div>
  )
}

export default MailercloudFieldMap
