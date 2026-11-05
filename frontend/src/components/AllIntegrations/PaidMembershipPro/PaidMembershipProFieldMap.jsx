import { create } from 'mutative'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __, sprintf } from '../../../Utils/i18nwrap'
import { SmartTagField } from '../../../Utils/StaticData/SmartTagField'
import TagifyInput from '../../Utilities/TagifyInput'
import { addFieldMap, delFieldMap, handleFieldMapping } from '../IntegrationHelpers/FieldMapHelper'

export default function PaidMembershipProFieldMap({
  i,
  formFields,
  field,
  paidMembershipProConf,
  setPaidMembershipProConf
}) {
  const { isPro } = useRecoilValue($appConfigState)
  const profileFields = paidMembershipProConf?.profileFields || []

  const setCustomValue = val =>
    setPaidMembershipProConf(prevConf =>
      create(prevConf, draftConf => {
        if (draftConf.field_map?.[i]) {
          draftConf.field_map[i].customValue = val?.target?.value ?? val
        }
      })
    )

  return (
    <div className="flx mt-2 mb-2 btcbi-field-map">
      <div className="pos-rel flx">
        <div className="flx integ-fld-wrp">
          <select
            className="btcd-paper-inp mr-2"
            name="formField"
            value={field.formField || ''}
            onChange={ev => handleFieldMapping(ev, i, paidMembershipProConf, setPaidMembershipProConf)}>
            <option value="">{__('Select Field', 'bit-integrations')}</option>
            <optgroup label={__('Form Fields', 'bit-integrations')}>
              {formFields?.map(f => (
                <option key={`ff-pmpro-${f.name}`} value={f.name}>
                  {f.label}
                </option>
              ))}
            </optgroup>
            <option value="custom">{__('Custom...', 'bit-integrations')}</option>
            <optgroup
              label={sprintf(
                __('General Smart Codes %s', 'bit-integrations'),
                isPro ? '' : `(${__('Pro', 'bit-integrations')})`
              )}>
              {isPro &&
                SmartTagField?.map(f => (
                  <option key={`st-pmpro-${f.name}`} value={f.name}>
                    {f.label}
                  </option>
                ))}
            </optgroup>
          </select>

          {field.formField === 'custom' && (
            <TagifyInput
              onChange={setCustomValue}
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
            name="paidmembershipproFormField"
            value={field.paidmembershipproFormField || ''}
            onChange={ev => handleFieldMapping(ev, i, paidMembershipProConf, setPaidMembershipProConf)}>
            <option value="">{__('Select Field', 'bit-integrations')}</option>
            {profileFields.map(({ key, label }) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => addFieldMap(i, paidMembershipProConf, setPaidMembershipProConf)}
          className="icn-btn sh-sm ml-2 mr-1"
          type="button">
          +
        </button>
        <button
          onClick={() => delFieldMap(i, paidMembershipProConf, setPaidMembershipProConf)}
          className="icn-btn sh-sm ml-1"
          type="button"
          aria-label={__('Remove field', 'bit-integrations')}>
          <span className="btcd-icn icn-trash-2" />
        </button>
      </div>
    </div>
  )
}
