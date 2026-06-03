import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import {
  generateMappedField,
  refreshIvyFormsFields,
  refreshIvyFormsForms
} from './IvyFormsCommonFunc'
import IvyFormsFieldMap from './IvyFormsFieldMap'

const modules = [{ label: __('Create Entry', 'bit-integrations'), value: 'create_entry', is_pro: true }]

export default function IvyFormsIntegLayout({
  formFields,
  ivyFormsConf,
  setIvyFormsConf,
  isLoading,
  setIsLoading
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const handleChange = (value, name) => {
    setIvyFormsConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf[name] = value
        draftConf.field_map = generateMappedField()
      })
    )

    if (name === 'mainAction') {
      refreshIvyFormsForms(setIvyFormsConf, setIsLoading)
    }
    if (name === 'formId') {
      refreshIvyFormsFields(value, setIvyFormsConf, setIsLoading)
    }
  }

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="mainAction"
          defaultValue={ivyFormsConf?.mainAction ?? null}
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
        <b className="wdt-200 d-in-b">{__('Select Form:', 'bit-integrations')}</b>
        <MultiSelect
          title="formId"
          defaultValue={ivyFormsConf?.formId ?? null}
          className="mt-2 w-5"
          onChange={value => handleChange(value, 'formId')}
          options={
            ivyFormsConf?.allForms?.map(f => ({
              label: f.label,
              value: f.value?.toString()
            })) || []
          }
          singleSelect
          closeOnSelect
        />
        <button
          onClick={() => refreshIvyFormsForms(setIvyFormsConf, setIsLoading)}
          className="icn-btn sh-sm ml-2 mr-2 tooltip"
          style={{ '--tooltip-txt': `'${__('Refresh Forms', 'bit-integrations')}'` }}
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

      {ivyFormsConf?.mainAction && ivyFormsConf?.formId && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <button
            onClick={() => refreshIvyFormsFields(ivyFormsConf.formId, setIvyFormsConf, setIsLoading)}
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
              <b>{__('IvyForms Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {ivyFormsConf?.field_map?.map((field, i) => (
            <IvyFormsFieldMap
              key={`iv-fm-${i + 9}`}
              i={i}
              formFields={formFields}
              field={field}
              ivyFormsConf={ivyFormsConf}
              setIvyFormsConf={setIvyFormsConf}
              allFields={ivyFormsConf.allFields || []}
            />
          ))}

          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() => addFieldMap(ivyFormsConf.field_map.length, ivyFormsConf, setIvyFormsConf)}
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
