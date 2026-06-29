import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import ZendeskSupportFieldMap from './ZendeskSupportFieldMap'
import ZendeskSupportActions from './ZendeskSupportActions'
import { generateMappedField } from './ZendeskSupportCommonFunc'
import { ZendeskSupportStaticData, ZendeskSupportUtilities } from './staticData'
import { addFieldMap } from '../GlobalIntegrationHelper'

export default function ZendeskSupportIntegLayout({
  formFields,
  zendeskSupportConf,
  setZendeskSupportConf,
  loading,
  setLoading,
  setSnackbar
}) {
  const { isPro } = useRecoilValue($appConfigState)

  const handleAction = value => {
    const newConf = { ...zendeskSupportConf }
    if (value !== '') {
      newConf.actionName = value
      newConf.utilities = {}
      newConf.field_map = generateMappedField({ ...newConf, actionName: value })
    } else {
      delete newConf.actionName
      newConf.field_map = [{ formField: '', zendeskSupportField: '' }]
    }
    setZendeskSupportConf({ ...newConf })
  }

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Select Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="Action"
          className="mt-2 w-5"
          defaultValue={zendeskSupportConf.actionName}
          onChange={val => handleAction(val)}
          options={ZendeskSupportStaticData.modules.map(module => ({
            label: checkIsPro(isPro, module.is_pro) ? module.label : getProLabel(module.label),
            value: module.value,
            disabled: !checkIsPro(isPro, module.is_pro)
          }))}
          singleSelect
          closeOnSelect
        />
      </div>

      {zendeskSupportConf.actionName && (
        <div>
          <br />
          <div className="mt-5">
            <b className="wdt-100">{__('Field Map', 'bit-integrations')}</b>
          </div>
          <br />
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Zendesk Support Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {zendeskSupportConf?.field_map?.map((itm, i) => (
            <ZendeskSupportFieldMap
              key={`rp-m-${i + 9}`}
              i={i}
              field={itm}
              zendeskSupportConf={zendeskSupportConf}
              formFields={formFields}
              setZendeskSupportConf={setZendeskSupportConf}
              setSnackbar={setSnackbar}
              loading={loading}
              setLoading={setLoading}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(
                  zendeskSupportConf.field_map.length,
                  zendeskSupportConf,
                  setZendeskSupportConf
                )
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>

          {(ZendeskSupportUtilities[zendeskSupportConf.actionName] || []).length > 0 && (
            <>
              <br />
              <div className="mt-4">
                <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
              </div>
              <div className="btcd-hr mt-1" />
              <ZendeskSupportActions
                zendeskSupportConf={zendeskSupportConf}
                setZendeskSupportConf={setZendeskSupportConf}
                loading={loading}
                setLoading={setLoading}
              />
            </>
          )}
          <br />
        </div>
      )}
    </>
  )
}
