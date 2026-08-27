import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../GlobalIntegrationHelper'
import FlodeskActions from './FlodeskActions'
import {
  generateMappedField,
  getCustomFields,
  getSegmentColors,
  getSegments,
  getWorkflows,
} from './FlodeskCommonFunc'
import FlodeskFieldMap from './FlodeskFieldMap'
import {
  hasUtilities,
  modules,
  needsSegmentColor,
  needsSegments,
  needsWorkflow,
  optionalSegments,
  supportsCustomFields
} from './staticData'
import 'react-multiple-select-dropdown-lite/dist/index.css'

export default function FlodeskIntegLayout({
  formFields,
  flodeskConf,
  setFlodeskConf,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const action = flodeskConf?.mainAction

  const handleMainAction = value => {
    const nextConf = create(flodeskConf, draftConf => {
      draftConf.mainAction = value
      draftConf.field_map = [{ flodeskField: '', formField: '' }]
    })

    nextConf.field_map = generateMappedField(nextConf)
    setFlodeskConf(nextConf)

    if (needsSegments.includes(value) || optionalSegments.includes(value)) {
      getSegments(nextConf, setFlodeskConf, setIsLoading)
    }
    if (needsSegmentColor.includes(value)) {
      getSegmentColors(nextConf, setFlodeskConf, setIsLoading)
    }
    if (needsWorkflow.includes(value)) {
      getWorkflows(nextConf, setFlodeskConf, setIsLoading)
    }
    if (supportsCustomFields.includes(value)) {
      getCustomFields(nextConf, setFlodeskConf, setIsLoading)
    }
  }

  const setField = (name, value) =>
    setFlodeskConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf[name] = value
      })
    )

  const renderFetchedSelect = (label, name, defaultKey, refresh, tooltip, optionMapper, multiple = false) => (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{label}</b>
        <MultiSelect
          title={name}
          defaultValue={
            (multiple ? flodeskConf?.[name]?.join(',') : flodeskConf?.[name]) ?? null
          }
          className="btcd-paper-drpdwn w-5"
          options={(flodeskConf?.default?.[defaultKey] || []).map(optionMapper)}
          onChange={val => setField(name, multiple ? val.split(',').filter(Boolean) : val)}
          {...(multiple ? {} : { closeOnSelect: true, singleSelect: true })}
        />
        <button
          onClick={() => refresh(flodeskConf, setFlodeskConf, setIsLoading)}
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

      {needsSegments.includes(action) &&
        renderFetchedSelect(
          __('Segments:', 'bit-integrations'),
          'segment_ids',
          'segments',
          getSegments,
          __('Refresh Segments', 'bit-integrations'),
          ({ segmentId, segmentName }) => ({ label: segmentName, value: String(segmentId) }),
          true
        )}

      {needsSegmentColor.includes(action) &&
        renderFetchedSelect(
          __('Colour:', 'bit-integrations'),
          'color_code',
          'colors',
          getSegmentColors,
          __('Refresh Colours', 'bit-integrations'),
          ({ colorCode, colorName }) => ({ label: colorName, value: String(colorCode) })
        )}

      {needsWorkflow.includes(action) &&
        renderFetchedSelect(
          __('Workflow:', 'bit-integrations'),
          'workflow_id',
          'workflows',
          getWorkflows,
          __('Refresh Workflows', 'bit-integrations'),
          ({ workflowId, workflowName }) => ({ label: workflowName, value: String(workflowId) })
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

      {action && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          {supportsCustomFields.includes(action) && (
            <button
              onClick={() => getCustomFields(flodeskConf, setFlodeskConf, setIsLoading)}
              className="icn-btn sh-sm ml-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Custom Fields', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          )}
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp flx">
              <b>{__('Flodesk Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {flodeskConf?.field_map?.map((itm, i) => (
            <FlodeskFieldMap
              key={`fd-m-${i + 9}`}
              i={i}
              field={itm}
              flodeskConf={flodeskConf}
              formFields={formFields}
              setFlodeskConf={setFlodeskConf}
            />
          ))}

          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(
                  flodeskConf.field_map.length,
                  flodeskConf,
                  setFlodeskConf
                )
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
          <br />
        </div>
      )}

      {hasUtilities.includes(action) && (
        <div className="mt-4">
          <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <FlodeskActions
            flodeskConf={flodeskConf}
            setFlodeskConf={setFlodeskConf}
            setIsLoading={setIsLoading}
          />
        </div>
      )}
    </>
  )
}
