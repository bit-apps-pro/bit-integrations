import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import { generateMappedField } from './BitCrmCommonFunc'
import BitCrmFieldMap from './BitCrmFieldMap'
import { bitCrmStaticData, modules } from './staticData'

export default function BitCrmIntegLayout({ formFields, bitCrmConf, setBitCrmConf }) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const handleMainAction = value => {
    setBitCrmConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.bitCrmFields = bitCrmStaticData[value] ?? []
        draftConf.field_map = generateMappedField(draftConf.bitCrmFields)
      })
    )
  }

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="mainAction"
          defaultValue={bitCrmConf?.mainAction ?? null}
          className="mt-2 w-5"
          onChange={value => handleMainAction(value)}
          options={modules?.map(action => ({
            label: checkIsPro(isPro, action.is_pro) ? action.label : getProLabel(action.label),
            value: action.name,
            disabled: !checkIsPro(isPro, action.is_pro)
          }))}
          singleSelect
          closeOnSelect
        />
      </div>

      {bitCrmConf?.mainAction && (
        <div className="mt-4">
          <div className="flx flx-between mt-3">
            <b className="wdt-200 d-in-b">{__('Map Fields:', 'bit-integrations')}</b>
            <button
              onClick={() => addFieldMap(bitCrmConf.field_map.length, bitCrmConf, setBitCrmConf)}
              className="icn-btn sh-sm mr-3"
              type="button">
              +
            </button>
          </div>

          {bitCrmConf?.field_map?.map((field, i) => (
            <BitCrmFieldMap
              // eslint-disable-next-line react/no-array-index-key
              key={`bit-crm-fm-${i}`}
              i={i}
              field={field}
              formFields={formFields}
              bitCrmConf={bitCrmConf}
              setBitCrmConf={setBitCrmConf}
            />
          ))}
        </div>
      )}
    </>
  )
}
