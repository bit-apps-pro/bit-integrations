import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import NextCrmActions from './NextCrmActions'
import {
  generateMappedField,
  refreshNextCrmCampaigns,
  refreshNextCrmContactFields,
  refreshNextCrmContactStatuses,
  refreshNextCrmLists,
  refreshNextCrmTags
} from './NextCrmCommonFunc'
import NextCrmFieldMap from './NextCrmFieldMap'
import {
  hasUtilities,
  modules,
  needsCampaign,
  needsContactField,
  needsList,
  needsStatus,
  needsTag,
  nextCrmStaticData
} from './staticData'

export default function NextCrmIntegLayout({
  formID,
  formFields,
  nextCrmConf,
  setNextCrmConf,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi
  const action = nextCrmConf?.mainAction

  const setField = (key, value) =>
    setNextCrmConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf[key] = value
      })
    )

  const handleMainAction = value => {
    setNextCrmConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.nextCrmFields = nextCrmStaticData[value] ?? []
        draftConf.field_map = generateMappedField(draftConf.nextCrmFields)
      })
    )

    if (needsStatus.includes(value)) refreshNextCrmContactStatuses(setNextCrmConf, setIsLoading)
    if (needsContactField.includes(value)) refreshNextCrmContactFields(setNextCrmConf, setIsLoading)
    if (needsTag.includes(value)) refreshNextCrmTags(setNextCrmConf, setIsLoading)
    if (needsList.includes(value)) refreshNextCrmLists(setNextCrmConf, setIsLoading)
    if (needsCampaign.includes(value)) refreshNextCrmCampaigns(setNextCrmConf, setIsLoading)
  }

  const toOptions = list => (list ?? []).map(item => ({ label: item.label, value: String(item.value) }))

  const renderSelect = (title, label, confKey, optionsKey, refresher) => (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{label}</b>
        <MultiSelect
          title={title}
          className="mt-2 w-5"
          defaultValue={nextCrmConf?.[confKey] ?? null}
          options={toOptions(nextCrmConf?.[optionsKey])}
          onChange={value => setField(confKey, value)}
          singleSelect
          closeOnSelect
        />
        <button
          onClick={() => refresher(setNextCrmConf, setIsLoading)}
          className="icn-btn sh-sm ml-2 mr-1"
          type="button"
          aria-label={__('Refresh', 'bit-integrations')}>
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
            label: checkIsPro(isPro, module.is_pro) ? module.label : getProLabel(module.label),
            value: module.name,
            disabled: !checkIsPro(isPro, module.is_pro)
          }))}
          singleSelect
          closeOnSelect
        />
      </div>

      {needsStatus.includes(action) &&
        renderSelect(
          'selectedStatus',
          __('Status:', 'bit-integrations'),
          'selectedStatus',
          'allContactStatuses',
          refreshNextCrmContactStatuses
        )}

      {needsContactField.includes(action) &&
        renderSelect(
          'selectedField',
          __('Contact Field:', 'bit-integrations'),
          'selectedField',
          'allContactFields',
          refreshNextCrmContactFields
        )}

      {needsTag.includes(action) &&
        renderSelect(
          'selectedTag',
          __('Tag:', 'bit-integrations'),
          'selectedTag',
          'allTags',
          refreshNextCrmTags
        )}

      {needsList.includes(action) &&
        renderSelect(
          'selectedList',
          __('List:', 'bit-integrations'),
          'selectedList',
          'allLists',
          refreshNextCrmLists
        )}

      {needsCampaign.includes(action) &&
        renderSelect(
          'selectedCampaign',
          __('Campaign:', 'bit-integrations'),
          'selectedCampaign',
          'allCampaigns',
          refreshNextCrmCampaigns
        )}

      {action && (
        <>
          <br />
          <div className="mt-4">
            <b className="wdt-100 d-in-b">{__('Field Map', 'bit-integrations')}</b>
          </div>
          <div className="btcd-hr mt-1" />
          <div className="flx mt-2 mb-2">
            <div className="txt-dp mt-2 wdt-200">{__('Form Field', 'bit-integrations')}</div>
            <div className="txt-dp mt-2 wdt-200 ml-2">{__('NextCRM Field', 'bit-integrations')}</div>
          </div>

          {nextCrmConf?.field_map?.map((itm, i) => (
            <NextCrmFieldMap
              key={`nextcrm-field-map-${i.toString()}`}
              i={i}
              formFields={formFields}
              field={itm}
              nextCrmConf={nextCrmConf}
              setNextCrmConf={setNextCrmConf}
            />
          ))}

          <div className="txt-center mt-2">
            <button
              onClick={() =>
                addFieldMap(nextCrmConf?.field_map?.length ?? 0, nextCrmConf, setNextCrmConf)
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
        </>
      )}

      {hasUtilities.includes(action) && (
        <NextCrmActions nextCrmConf={nextCrmConf} setNextCrmConf={setNextCrmConf} />
      )}

      {isLoading && (
        <Loader className="pos-abs" style={{ background: '#fff', width: '100%', height: '100%' }} />
      )}
    </>
  )
}
