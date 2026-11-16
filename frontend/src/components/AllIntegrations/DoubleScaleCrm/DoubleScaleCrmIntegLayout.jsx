import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import Note from '../../Utilities/Note'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import DoubleScaleCrmActions from './DoubleScaleCrmActions'
import {
  generateMappedField,
  refreshDoubleScaleCrmLists,
  refreshDoubleScaleCrmTags,
  refreshDoubleScaleCrmUsers
} from './DoubleScaleCrmCommonFunc'
import DoubleScaleCrmFieldMap from './DoubleScaleCrmFieldMap'
import {
  actionNotes,
  channelOptions,
  fieldsByAction,
  invoiceStatusOptions,
  modules,
  needsChannel,
  needsInvoiceStatus,
  needsList,
  needsLists,
  needsOwner,
  needsTags,
  utilitiesByAction
} from './staticData'

const selectKeys = ['owner_id', 'channel', 'tag_ids', 'list_ids', 'list_id', 'status']

const toOptions = items =>
  (items || []).map(item => ({ label: item.label, value: item.value?.toString() }))

export default function DoubleScaleCrmIntegLayout({
  formFields,
  doubleScaleCrmConf,
  setDoubleScaleCrmConf,
  isLoading,
  setIsLoading
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const handleMainAction = value => {
    setDoubleScaleCrmConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.doubleScaleCrmFields = fieldsByAction[value] || []
        draftConf.field_map = generateMappedField(draftConf.doubleScaleCrmFields)
        draftConf.utilities = {}
        selectKeys.forEach(key => delete draftConf[key])
      })
    )

    if (needsOwner.includes(value)) {
      refreshDoubleScaleCrmUsers(setDoubleScaleCrmConf, setIsLoading)
    }

    if (needsTags.includes(value)) {
      refreshDoubleScaleCrmTags(setDoubleScaleCrmConf, setIsLoading)
    }

    if (needsLists.includes(value) || needsList.includes(value)) {
      refreshDoubleScaleCrmLists(setDoubleScaleCrmConf, setIsLoading)
    }
  }

  const setConfValue = (key, value) => {
    setDoubleScaleCrmConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf[key] = value
      })
    )
  }

  const { mainAction } = doubleScaleCrmConf || {}
  const fields = doubleScaleCrmConf?.doubleScaleCrmFields || []
  const hasOptionalFields = fields.some(field => !field.required)

  const configSelects = [
    {
      key: 'owner_id',
      show: needsOwner,
      label: __('Owner:', 'bit-integrations'),
      options: toOptions(doubleScaleCrmConf?.allUsers),
      refresh: refreshDoubleScaleCrmUsers,
      refreshLabel: __('Refresh Users', 'bit-integrations')
    },
    {
      key: 'channel',
      show: needsChannel,
      label: __('Channel:', 'bit-integrations'),
      options: channelOptions
    },
    {
      key: 'tag_ids',
      show: needsTags,
      label: __('Tags:', 'bit-integrations'),
      options: toOptions(doubleScaleCrmConf?.allTags),
      refresh: refreshDoubleScaleCrmTags,
      refreshLabel: __('Refresh Tags', 'bit-integrations'),
      multiple: true
    },
    {
      key: 'list_ids',
      show: needsLists,
      label: __('Lists:', 'bit-integrations'),
      options: toOptions(doubleScaleCrmConf?.allLists),
      refresh: refreshDoubleScaleCrmLists,
      refreshLabel: __('Refresh Lists', 'bit-integrations'),
      multiple: true
    },
    {
      key: 'list_id',
      show: needsList,
      label: __('List:', 'bit-integrations'),
      options: toOptions(doubleScaleCrmConf?.allLists),
      refresh: refreshDoubleScaleCrmLists,
      refreshLabel: __('Refresh Lists', 'bit-integrations')
    },
    {
      key: 'status',
      show: needsInvoiceStatus,
      label: __('Status:', 'bit-integrations'),
      options: invoiceStatusOptions
    }
  ].filter(select => select.show.includes(mainAction))

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="mainAction"
          defaultValue={mainAction ?? null}
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

      {configSelects.map(select => (
        <div key={select.key}>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{select.label}</b>
            <MultiSelect
              key={`${select.key}-${select.options.length}`}
              title={select.key}
              defaultValue={doubleScaleCrmConf?.[select.key] ?? null}
              className="btcd-paper-drpdwn w-5"
              options={select.options}
              onChange={value => setConfValue(select.key, value)}
              singleSelect={!select.multiple}
              closeOnSelect={!select.multiple}
            />
            {select.refresh && (
              <button
                onClick={() => select.refresh(setDoubleScaleCrmConf, setIsLoading)}
                className="icn-btn sh-sm ml-2 mr-2 tooltip"
                style={{ '--tooltip-txt': `'${select.refreshLabel}'` }}
                type="button"
                disabled={isLoading}>
                &#x21BB;
              </button>
            )}
          </div>
        </div>
      ))}

      {actionNotes[mainAction] && (
        <>
          <br />
          <Note note={actionNotes[mainAction]} />
        </>
      )}

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

      {mainAction && fields.length > 0 && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('DoubleScale CRM Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {doubleScaleCrmConf?.field_map?.map((itm, i) => (
            <DoubleScaleCrmFieldMap
              key={`double-scale-crm-m-${i + 9}`}
              i={i}
              field={itm}
              doubleScaleCrmConf={doubleScaleCrmConf}
              formFields={formFields}
              setDoubleScaleCrmConf={setDoubleScaleCrmConf}
            />
          ))}
          {hasOptionalFields && (
            <div className="txt-center btcbi-field-map-button mt-2">
              <button
                onClick={() =>
                  addFieldMap(
                    doubleScaleCrmConf.field_map.length,
                    doubleScaleCrmConf,
                    setDoubleScaleCrmConf
                  )
                }
                className="icn-btn sh-sm"
                type="button">
                +
              </button>
            </div>
          )}
          <br />
        </div>
      )}

      {mainAction && utilitiesByAction[mainAction] && (
        <div className="mt-4">
          <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <DoubleScaleCrmActions
            doubleScaleCrmConf={doubleScaleCrmConf}
            setDoubleScaleCrmConf={setDoubleScaleCrmConf}
          />
        </div>
      )}
    </>
  )
}
