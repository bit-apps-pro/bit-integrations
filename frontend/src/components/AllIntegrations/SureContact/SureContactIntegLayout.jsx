import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../GlobalIntegrationHelper'
import SureContactActions from './SureContactActions'
import { generateMappedField, getLists, getTags } from './SureContactCommonFunc'
import SureContactFieldMap from './SureContactFieldMap'
import {
  activityTypeOptions,
  contactStatusOptions,
  fieldsByAction,
  hasUtilities,
  modules,
  needsActivityType,
  needsContactStatus,
  needsList,
  needsTag
} from './staticData'
import 'react-multiple-select-dropdown-lite/dist/index.css'

export default function SureContactIntegLayout({
  formFields,
  sureContactConf,
  setSureContactConf,
  isLoading,
  setIsLoading
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const action = sureContactConf?.mainAction

  const handleMainAction = value => {
    const nextConf = create(sureContactConf, draftConf => {
      draftConf.mainAction = value
      draftConf.sureContactFields = fieldsByAction[value] || []
      draftConf.field_map = [{ formField: '', sureContactField: '' }]
    })

    nextConf.field_map = generateMappedField(nextConf)
    setSureContactConf(nextConf)

    if (needsList.includes(value)) getLists(nextConf, setSureContactConf, setIsLoading)
    if (needsTag.includes(value)) getTags(nextConf, setSureContactConf, setIsLoading)
  }

  const setField = (name, value) =>
    setSureContactConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf[name] = value
      })
    )

  const renderStaticSelect = (label, name, options) => (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{label}</b>
        <MultiSelect
          title={name}
          defaultValue={sureContactConf?.[name] ?? null}
          className="btcd-paper-drpdwn w-5"
          options={options}
          onChange={val => setField(name, val)}
          singleSelect
          closeOnSelect
        />
      </div>
    </>
  )

  const renderFetchedSelect = (label, name, defaultKey, refresh, tooltip, optionMapper, multi) => (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{label}</b>
        <MultiSelect
          title={name}
          defaultValue={sureContactConf?.[name] ?? null}
          className="btcd-paper-drpdwn w-5"
          options={(sureContactConf?.default?.[defaultKey] || []).map(optionMapper)}
          onChange={val => setField(name, multi ? val.split(',').filter(Boolean) : val)}
          singleSelect={!multi}
          closeOnSelect={!multi}
        />
        <button
          onClick={() => refresh(sureContactConf, setSureContactConf, setIsLoading)}
          className="icn-btn sh-sm ml-2 mr-2 tooltip"
          style={{ '--tooltip-txt': `'${tooltip}'` }}
          type="button"
          disabled={isLoading}>
          &#x21BB;
        </button>
      </div>
    </>
  )

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="mainAction"
          defaultValue={action ?? null}
          className="mt-2 w-5"
          onChange={value => handleMainAction(value)}
          options={modules?.map(module => ({
            disabled: !checkIsPro(isPro, module.is_pro),
            label: checkIsPro(isPro, module.is_pro) ? module.label : getProLabel(module.label),
            value: module.name
          }))}
          singleSelect
          closeOnSelect
        />
      </div>

      {needsContactStatus.includes(action) &&
        renderStaticSelect(__('Status:', 'bit-integrations'), 'contact_status', contactStatusOptions)}

      {needsActivityType.includes(action) &&
        renderStaticSelect(
          __('Activity Type:', 'bit-integrations'),
          'activity_type',
          activityTypeOptions
        )}

      {needsList.includes(action) &&
        renderFetchedSelect(
          __('Lists:', 'bit-integrations'),
          'list_uuids',
          'lists',
          getLists,
          __('Refresh Lists', 'bit-integrations'),
          ({ listId, listName }) => ({ label: listName, value: String(listId) }),
          true
        )}

      {needsTag.includes(action) &&
        renderFetchedSelect(
          __('Tags:', 'bit-integrations'),
          'tag_uuids',
          'tags',
          getTags,
          __('Refresh Tags', 'bit-integrations'),
          ({ tagId, tagName }) => ({ label: tagName, value: String(tagId) }),
          true
        )}

      {isLoading && (
        <Loader
          style={{
            alignItems: 'center',
            display: 'flex',
            height: 100,
            justifyContent: 'center',
            transform: 'scale(0.7)'
          }}
        />
      )}

      {action && sureContactConf?.sureContactFields && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('SureContact Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {sureContactConf?.field_map?.map((itm, i) => (
            <SureContactFieldMap
              key={`sc-m-${i + 9}`}
              i={i}
              field={itm}
              sureContactConf={sureContactConf}
              formFields={formFields}
              setSureContactConf={setSureContactConf}
            />
          ))}

          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(sureContactConf.field_map.length, sureContactConf, setSureContactConf)
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
        </div>
      )}

      {hasUtilities.includes(action) && (
        <div className="mt-4">
          <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <SureContactActions
            sureContactConf={sureContactConf}
            setSureContactConf={setSureContactConf}
          />
        </div>
      )}
    </>
  )
}
