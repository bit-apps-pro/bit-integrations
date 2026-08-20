import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import TrashIcn from '../../../Icons/TrashIcn'
import { __, sprintf } from '../../../Utils/i18nwrap'
import { SmartTagField } from '../../../Utils/StaticData/SmartTagField'
import MtInput from '../../Utilities/MtInput'
import TagifyInput from '../../Utilities/TagifyInput'
import { handleCustomValue } from '../IntegrationHelpers/IntegrationHelpers'
import { generateMappedField } from './GetgistCommonFunc'

export default function GetgistFieldMap({ i, formFields, field, getgistConf, setGetgistConf }) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  if (getgistConf?.field_map?.length === 1 && field?.getgistFormField === '') {
    const newConf = { ...getgistConf }
    const tmp = generateMappedField(newConf)
    newConf.field_map = tmp
    setGetgistConf(newConf)
  }
  const addFieldMap = indx => {
    const newConf = { ...getgistConf }
    newConf.field_map.splice(indx, 0, {})
    setGetgistConf(newConf)
  }

  const delFieldMap = indx => {
    const newConf = { ...getgistConf }
    if (newConf.field_map.length > 1) {
      newConf.field_map.splice(indx, 1)
    }
    setGetgistConf(newConf)
  }

  const handleFieldMapping = (event, indx) => {
    const newConf = { ...getgistConf }
    newConf.field_map[indx][event.target.name] = event.target.value

    if (event.target.value === 'custom') {
      newConf.field_map[indx].customValue = ''
    }
    setGetgistConf(newConf)
  }

  const requiredFlds = getgistConf?.gistFields.filter(fld => fld.required === true) || []
  const nonRequiredFlds = getgistConf?.gistFields.filter(fld => fld.required === false) || []
  return (
    <div className="flx mt-2 mb-2 btcbi-field-map">
      <div className="pos-rel flx">
        <div className="flx integ-fld-wrp">
          <select
            className="btcd-paper-inp mr-2"
            name="formField"
            value={field.formField || ''}
            onChange={ev => handleFieldMapping(ev, i)}>
            <option value="">{__('Select Field', 'bit-integrations')}</option>
            <optgroup label={__('Form Fields', 'bit-integrations')}>
              {formFields.map(
                f =>
                  f.type !== 'file' && (
                    <option key={`ff-getgist-${f.name}`} value={f.name}>
                      {f.label}
                    </option>
                  )
              )}
            </optgroup>
            <option value="custom">{__('Custom...', 'bit-integrations')}</option>

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
              onChange={e => handleCustomValue(e, i, getgistConf, setGetgistConf)}
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
            name="getgistFormField"
            value={i < requiredFlds.length ? requiredFlds[i]?.key || '' : field.getgistFormField || ''}
            onChange={ev => handleFieldMapping(ev, i, getgistConf, setGetgistConf)}>
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
        {i >= requiredFlds?.length && (
          <>
            <button onClick={() => addFieldMap(i)} className="icn-btn sh-sm ml-2" type="button">
              +
            </button>
            <button
              onClick={() => delFieldMap(i)}
              className="icn-btn sh-sm ml-2"
              type="button"
              aria-label="btn">
              <TrashIcn />
            </button>
          </>
        )}

      </div>
    </div>
  )
}
