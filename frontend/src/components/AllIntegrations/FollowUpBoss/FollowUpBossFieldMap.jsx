import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __, sprintf } from '../../../Utils/i18nwrap'
import { SmartTagField } from '../../../Utils/StaticData/SmartTagField'
import TagifyInput from '../../Utilities/TagifyInput'
import {
  addFieldMap,
  delFieldMap,
  handleCustomValue,
  handleFieldMapping
} from '../GlobalIntegrationHelper'
import { customFieldActions, fieldsByAction } from './staticData'

export default function FollowUpBossFieldMap({
  i,
  formFields,
  field,
  followUpBossConf,
  setFollowUpBossConf
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const actionFields = fieldsByAction[followUpBossConf?.mainAction] || []
  const requiredFlds = actionFields.filter(fld => fld.required === true)
  const customFlds = customFieldActions.includes(followUpBossConf?.mainAction)
    ? (followUpBossConf?.default?.customFields || []).map(({ id, name }) => ({
        key: id,
        label: `${name} (${__('Custom Field', 'bit-integrations')})`
      }))
    : []
  const nonRequiredFlds = [...actionFields.filter(fld => fld.required === false), ...customFlds]

  return (
    <div className="flx mt-2 mb-2 btcbi-field-map">
      <div className="pos-rel flx">
        <div className="flx integ-fld-wrp">
          <select
            className="btcd-paper-inp mr-2"
            name="formField"
            value={field.formField || ''}
            onChange={ev => handleFieldMapping(ev, i, followUpBossConf, setFollowUpBossConf)}>
            <option value="">{__('Select Field', 'bit-integrations')}</option>
            <optgroup label={__('Form Fields', 'bit-integrations')}>
              {formFields?.map(f => (
                <option key={`ff-fub-${f.name}`} value={f.name}>
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
                  <option key={`fub-sc-${f.name}`} value={f.name}>
                    {f.label}
                  </option>
                ))}
            </optgroup>
          </select>

          {field.formField === 'custom' && (
            <TagifyInput
              onChange={e => handleCustomValue(e, i, followUpBossConf, setFollowUpBossConf)}
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
            disabled={i < requiredFlds.length}
            name="followUpBossField"
            value={field.followUpBossField || ''}
            onChange={ev => handleFieldMapping(ev, i, followUpBossConf, setFollowUpBossConf)}>
            <option value="">{__('Select Field', 'bit-integrations')}</option>
            {i < requiredFlds.length ? (
              <option key={requiredFlds[i].key} value={requiredFlds[i].key}>
                {requiredFlds[i].label}
              </option>
            ) : (
              nonRequiredFlds.map(({ key, label }) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))
            )}
          </select>
        </div>

        {i >= requiredFlds.length && (
          <>
            <button
              onClick={() => addFieldMap(i, followUpBossConf, setFollowUpBossConf)}
              className="icn-btn sh-sm ml-2 mr-1"
              type="button">
              +
            </button>
            <button
              onClick={() => delFieldMap(i, followUpBossConf, setFollowUpBossConf)}
              className="icn-btn sh-sm ml-1"
              type="button"
              aria-label="btn">
              <span className="btcd-icn icn-trash-2" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
