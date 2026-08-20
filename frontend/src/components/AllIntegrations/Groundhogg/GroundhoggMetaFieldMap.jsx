import { useEffect } from 'react'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { SmartTagField } from '../../../Utils/StaticData/SmartTagField'
import { __, sprintf } from '../../../Utils/i18nwrap'
import TagifyInput from '../../Utilities/TagifyInput'
import { generateMappedField } from './GroundhoggCommonFunc'
import {
  addMetaFieldMap,
  delMetaFieldMap,
  handleMetaCustomValue,
  handleMetaFieldMapping
} from './IntegrationHelpers'

export default function GroundhoggMetaFieldMap({
  i,
  formFields,
  field,
  groundhoggConf,
  setGroundhoggConf
}) {
  useEffect(() => {
    if (groundhoggConf?.field_map_meta?.length === 1 && field.GroundhoggMetaMapField === '') {
      const newConf = { ...groundhoggConf }
      const tmp = generateMappedField(newConf)
      newConf.field_map_meta = tmp
      setGroundhoggConf(newConf)
    }
  }, [])
  const requiredFlds = groundhoggConf?.contactMetaFields.filter(fld => fld.required === true) || []
  const nonRequiredFlds = groundhoggConf?.contactMetaFields.filter(fld => fld.required === false) || []

  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  return (
    <div className="flx mt-2 mb-2 btcbi-field-map">
      <div className="pos-rel flx">
        <div className="flx integ-fld-wrp">
          <select
            className="btcd-paper-inp mr-2"
            name="formField"
            value={field.formField || ''}
            onChange={ev => handleMetaFieldMapping(ev, i, groundhoggConf, setGroundhoggConf)}>
            <option value="">{__('Select Field', 'bit-integrations')}</option>
            <optgroup label={__('Form Fields', 'bit-integrations')}>
              {formFields?.map(f => (
                <option key={`ff-rm-${f.name}`} value={f.name}>
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
                  <option key={`ff-gh-${f.name}`} value={f.name}>
                    {f.label}
                  </option>
                ))}
            </optgroup>
          </select>


          {field.formField === 'custom' && (
            <TagifyInput
              onChange={e => handleMetaCustomValue(e, i, groundhoggConf, setGroundhoggConf)}
              label={__('Custom Value', 'bit-integrations')}
              className="mr-2"
              type="text"
              value={field.customMetaFormValue}
              placeholder={__('Custom Value', 'bit-integrations')}
              formFields={formFields}
            />
          )}

          <select
            className="btcd-paper-inp"
            disabled={i < requiredFlds.length}
            name="GroundhoggMetaMapField"
            value={
              i < requiredFlds.length ? requiredFlds[i].key || '' : field.GroundhoggMetaMapField || ''
            }
            onChange={ev => handleMetaFieldMapping(ev, i, groundhoggConf, setGroundhoggConf)}>
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
              onClick={() => addMetaFieldMap(i, groundhoggConf, setGroundhoggConf, false)}
              className="icn-btn sh-sm ml-2 mr-1"
              type="button">
              +
            </button>
            <button
              onClick={() => delMetaFieldMap(i, groundhoggConf, setGroundhoggConf)}
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
