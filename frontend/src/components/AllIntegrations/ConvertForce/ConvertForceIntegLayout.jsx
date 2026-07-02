import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import { generateMappedField } from './ConvertForceCommonFunc'
import ConvertForceFieldMap from './ConvertForceFieldMap'
import {
  CampaignDeleteFields,
  CampaignFields,
  CampaignStatusFields,
  CampaignUpdateFields,
  modules
} from './staticData'

export default function ConvertForceIntegLayout({ formFields, convertForceConf, setConvertForceConf }) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const handleMainAction = value => {
    setConvertForceConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value

        switch (value) {
          case 'createCampaign':
            draftConf.convertForceFields = CampaignFields
            draftConf.field_map = generateMappedField(CampaignFields)
            break
          case 'updateCampaign':
            draftConf.convertForceFields = CampaignUpdateFields
            draftConf.field_map = generateMappedField(CampaignUpdateFields)
            break
          case 'updateCampaignStatus':
            draftConf.convertForceFields = CampaignStatusFields
            draftConf.field_map = generateMappedField(CampaignStatusFields)
            break
          case 'deleteCampaign':
            draftConf.convertForceFields = CampaignDeleteFields
            draftConf.field_map = generateMappedField(CampaignDeleteFields)
            break
          default:
            draftConf.convertForceFields = []
            draftConf.field_map = [{ formField: '', convertForceField: '' }]
        }
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
          defaultValue={convertForceConf?.mainAction ?? null}
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

      {convertForceConf?.mainAction && (
        <>
          <br />
          <div className="mt-5">
            <b className="wdt-100">{__('Field Map', 'bit-integrations')}</b>
          </div>
          <br />
          <div className="btcd-hr" />
          {convertForceConf?.field_map?.map((field, i) => (
            <ConvertForceFieldMap
              key={`convert-force-m-${i + 9}`}
              i={i}
              field={field}
              formFields={formFields}
              convertForceConf={convertForceConf}
              setConvertForceConf={setConvertForceConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() => addFieldMap(0, convertForceConf, setConvertForceConf)}
              className="icn-btn sh-sm mt-2"
              type="button">
              +
            </button>
          </div>
        </>
      )}
    </>
  )
}
