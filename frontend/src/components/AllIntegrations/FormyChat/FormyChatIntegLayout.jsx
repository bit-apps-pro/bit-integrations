import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import {
  addMetaFieldMap,
  generateMappedField,
  refreshFormyChatWidgetFields,
  refreshFormyChatWidgets
} from './FormyChatCommonFunc'
import FormyChatFieldMap from './FormyChatFieldMap'
import FormyChatMetaFieldMap from './FormyChatMetaFieldMap'

const modules = [{ label: __('Create Lead', 'bit-integrations'), value: 'create_lead', is_pro: true }]

export default function FormyChatIntegLayout({
  formFields,
  formyChatConf,
  setFormyChatConf,
  isLoading,
  setIsLoading
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const handleChange = (value, name) => {
    setFormyChatConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf[name] = value
        draftConf.field_map = generateMappedField()
      })
    )

    if (name === 'mainAction') {
      refreshFormyChatWidgets(setFormyChatConf, setIsLoading)
    }
    if (name === 'widgetId') {
      refreshFormyChatWidgetFields(value, setFormyChatConf, setIsLoading)
    }
  }

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="mainAction"
          defaultValue={formyChatConf?.mainAction ?? null}
          className="mt-2 w-5"
          onChange={value => handleChange(value, 'mainAction')}
          options={modules?.map(m => ({
            label: checkIsPro(isPro, m.is_pro) ? m.label : getProLabel(m.label),
            value: m.value,
            disabled: !checkIsPro(isPro, m.is_pro)
          }))}
          singleSelect
          closeOnSelect
        />
      </div>

      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Select Widget:', 'bit-integrations')}</b>
        <MultiSelect
          title="widgetId"
          defaultValue={formyChatConf?.widgetId ?? null}
          className="mt-2 w-5"
          onChange={value => handleChange(value, 'widgetId')}
          options={
            formyChatConf?.allWidgets?.map(w => ({
              label: w.widget_name,
              value: w.widget_id?.toString()
            })) || []
          }
          singleSelect
          closeOnSelect
        />
        <button
          onClick={() => refreshFormyChatWidgets(setFormyChatConf, setIsLoading)}
          className="icn-btn sh-sm ml-2 mr-2 tooltip"
          style={{ '--tooltip-txt': `'${__('Refresh Widgets', 'bit-integrations')}'` }}
          type="button"
          disabled={isLoading}>
          &#x21BB;
        </button>
      </div>

      {isLoading && (
        <Loader
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 100,
            transform: 'scale(0.7)'
          }}
        />
      )}

      {formyChatConf?.mainAction && formyChatConf?.widgetId && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <button
            onClick={() => refreshFormyChatWidgetFields(formyChatConf.widgetId, setFormyChatConf, setIsLoading)}
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `'${__('Refresh Fields', 'bit-integrations')}'` }}
            type="button"
            disabled={isLoading}>
            &#x21BB;
          </button>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('FormyChat Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {formyChatConf?.field_map?.map((field, i) => (
            <FormyChatFieldMap
              key={`fc-fm-${i + 9}`}
              i={i}
              formFields={formFields}
              field={field}
              formyChatConf={formyChatConf}
              setFormyChatConf={setFormyChatConf}
              allFields={formyChatConf.allFields || []}
            />
          ))}

          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() => addFieldMap(formyChatConf.field_map.length, formyChatConf, setFormyChatConf)}
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
          <br />
        </div>
      )}

      {formyChatConf?.mainAction === 'create_lead' && formyChatConf?.widgetId && (
        <div className="mt-4">
          <b className="wdt-100">{__('Meta Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Meta Key', 'bit-integrations')}</b>
            </div>
          </div>

          {(formyChatConf?.meta_map || []).map((field, i) => (
            <FormyChatMetaFieldMap
              key={`fc-mm-${i + 9}`}
              i={i}
              formFields={formFields}
              field={field}
              formyChatConf={formyChatConf}
              setFormyChatConf={setFormyChatConf}
            />
          ))}

          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() => addMetaFieldMap((formyChatConf?.meta_map || []).length, formyChatConf, setFormyChatConf)}
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
          <br />
        </div>
      )}
    </>
  )
}
