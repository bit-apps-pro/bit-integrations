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

  // Derived from mainAction on every render (not stored in conf) so it is
  // always correct on Edit too, where only mainAction/field_map are persisted.
  const bitCrmFields = bitCrmStaticData[bitCrmConf?.mainAction] ?? []

  const handleMainAction = value => {
    setBitCrmConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.field_map = generateMappedField(bitCrmStaticData[value] ?? [])
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
          <div className="mt-5">
            <b className="wdt-100">{__('Field Map', 'bit-integrations')}</b>
          </div>

          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Bit CRM Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {bitCrmConf?.field_map?.map((field, i) => (
            <BitCrmFieldMap
              // eslint-disable-next-line react/no-array-index-key
              key={`bit-crm-fm-${i}`}
              i={i}
              field={field}
              formFields={formFields}
              bitCrmFields={bitCrmFields}
              bitCrmConf={bitCrmConf}
              setBitCrmConf={setBitCrmConf}
            />
          ))}

          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() => addFieldMap(bitCrmConf.field_map.length, bitCrmConf, setBitCrmConf)}
              className="icn-btn sh-sm ml-2 mr-1"
              type="button">
              +
            </button>
          </div>
        </div>
      )}
    </>
  )
}
