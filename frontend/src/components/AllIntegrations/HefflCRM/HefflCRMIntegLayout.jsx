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
  refreshClients,
  refreshLeads,
  refreshLeadSources,
  refreshLeadStages,
  refreshPipelines,
  refreshPipelineStages
} from './HefflCRMCommonFunc'
import HefflCRMFieldMap from './HefflCRMFieldMap'
import {
  ClientFields,
  ClientTypes,
  DealFields,
  DealPriorities,
  LeadFields,
  modules
} from './staticData'

const setField = (setHefflCRMConf, key, val) =>
  setHefflCRMConf(prev =>
    create(prev, draft => {
      draft[key] = val
    })
  )

export default function HefflCRMIntegLayout({
  formFields,
  hefflCRMConf,
  setHefflCRMConf,
  isLoading,
  setIsLoading
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const handleMainAction = value => {
    setHefflCRMConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value

        delete draftConf.leadSources
        delete draftConf.leadStages
        delete draftConf.pipelines
        delete draftConf.pipelineStages
        delete draftConf.clients
        delete draftConf.leads
        delete draftConf.dealSourceId
        delete draftConf.priority
        delete draftConf.clientType

        switch (value) {
          case 'create_lead':
            draftConf.hefflCRMFields = LeadFields
            break
          case 'create_client':
            draftConf.hefflCRMFields = ClientFields
            break
          case 'create_deal':
            draftConf.hefflCRMFields = DealFields
            break
          default:
            draftConf.hefflCRMFields = []
        }

        draftConf.field_map = generateMappedField(draftConf.hefflCRMFields)
      })
    )

    if (value === 'create_lead') {
      refreshLeadSources(hefflCRMConf, setHefflCRMConf, setIsLoading)
      refreshLeadStages(hefflCRMConf, setHefflCRMConf, setIsLoading)
    } else if (value === 'create_deal') {
      refreshLeadSources(hefflCRMConf, setHefflCRMConf, setIsLoading)
      refreshPipelines(hefflCRMConf, setHefflCRMConf, setIsLoading)
      refreshClients(hefflCRMConf, setHefflCRMConf, setIsLoading)
      refreshLeads(hefflCRMConf, setHefflCRMConf, setIsLoading)
    }
  }

  const renderRefresh = (onClick, tooltip) => (
    <button
      onClick={onClick}
      className="icn-btn sh-sm ml-2 mr-2 tooltip"
      style={{ '--tooltip-txt': `'${tooltip}'` }}
      type="button"
      disabled={isLoading}>
      &#x21BB;
    </button>
  )

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="mainAction"
          defaultValue={hefflCRMConf?.mainAction ?? null}
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

      {hefflCRMConf?.mainAction === 'create_lead' && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Lead Source:', 'bit-integrations')}</b>
            <MultiSelect
              title="leadSourceId"
              defaultValue={hefflCRMConf?.leadSourceId ?? null}
              className="btcd-paper-drpdwn w-5"
              options={hefflCRMConf?.leadSources || []}
              onChange={val => setField(setHefflCRMConf, 'leadSourceId', val)}
              singleSelect
              closeOnSelect
            />
            {renderRefresh(
              () => refreshLeadSources(hefflCRMConf, setHefflCRMConf, setIsLoading),
              __('Refresh Lead Sources', 'bit-integrations')
            )}
          </div>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Lead Stage:', 'bit-integrations')}</b>
            <MultiSelect
              title="leadStageId"
              defaultValue={hefflCRMConf?.leadStageId ?? null}
              className="btcd-paper-drpdwn w-5"
              options={hefflCRMConf?.leadStages || []}
              onChange={val => setField(setHefflCRMConf, 'leadStageId', val)}
              singleSelect
              closeOnSelect
            />
            {renderRefresh(
              () => refreshLeadStages(hefflCRMConf, setHefflCRMConf, setIsLoading),
              __('Refresh Lead Stages', 'bit-integrations')
            )}
          </div>
        </>
      )}

      {hefflCRMConf?.mainAction === 'create_client' && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Client Type:', 'bit-integrations')}</b>
            <MultiSelect
              title="clientType"
              defaultValue={hefflCRMConf?.clientType ?? 'company'}
              className="btcd-paper-drpdwn w-5"
              options={ClientTypes}
              onChange={val => setField(setHefflCRMConf, 'clientType', val)}
              singleSelect
              closeOnSelect
            />
          </div>
        </>
      )}

      {hefflCRMConf?.mainAction === 'create_deal' && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Pipeline:', 'bit-integrations')}</b>
            <MultiSelect
              title="pipelineId"
              defaultValue={hefflCRMConf?.pipelineId ?? null}
              className="btcd-paper-drpdwn w-5"
              options={hefflCRMConf?.pipelines || []}
              onChange={val => {
                setField(setHefflCRMConf, 'pipelineId', val)
                setField(setHefflCRMConf, 'dealStageId', null)
                if (val) {
                  refreshPipelineStages(
                    { ...hefflCRMConf, pipelineId: val },
                    setHefflCRMConf,
                    setIsLoading,
                    val
                  )
                }
              }}
              singleSelect
              closeOnSelect
            />
            {renderRefresh(
              () => refreshPipelines(hefflCRMConf, setHefflCRMConf, setIsLoading),
              __('Refresh Pipelines', 'bit-integrations')
            )}
          </div>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Deal Stage:', 'bit-integrations')}</b>
            <MultiSelect
              title="dealStageId"
              defaultValue={hefflCRMConf?.dealStageId ?? null}
              className="btcd-paper-drpdwn w-5"
              options={hefflCRMConf?.pipelineStages || []}
              onChange={val => setField(setHefflCRMConf, 'dealStageId', val)}
              singleSelect
              closeOnSelect
            />
            {renderRefresh(
              () =>
                refreshPipelineStages(
                  hefflCRMConf,
                  setHefflCRMConf,
                  setIsLoading,
                  hefflCRMConf?.pipelineId
                ),
              __('Refresh Stages', 'bit-integrations')
            )}
          </div>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Deal Source:', 'bit-integrations')}</b>
            <MultiSelect
              title="dealSourceId"
              defaultValue={hefflCRMConf?.dealSourceId ?? null}
              className="btcd-paper-drpdwn w-5"
              options={hefflCRMConf?.leadSources || []}
              onChange={val => setField(setHefflCRMConf, 'dealSourceId', val)}
              singleSelect
              closeOnSelect
            />
            {renderRefresh(
              () => refreshLeadSources(hefflCRMConf, setHefflCRMConf, setIsLoading),
              __('Refresh Sources', 'bit-integrations')
            )}
          </div>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Priority:', 'bit-integrations')}</b>
            <MultiSelect
              title="priority"
              defaultValue={hefflCRMConf?.priority ?? null}
              className="btcd-paper-drpdwn w-5"
              options={DealPriorities}
              onChange={val => setField(setHefflCRMConf, 'priority', val)}
              singleSelect
              closeOnSelect
            />
          </div>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Client:', 'bit-integrations')}</b>
            <MultiSelect
              title="clientId"
              defaultValue={hefflCRMConf?.clientId ?? null}
              className="btcd-paper-drpdwn w-5"
              options={hefflCRMConf?.clients || []}
              onChange={val => setField(setHefflCRMConf, 'clientId', val)}
              singleSelect
              closeOnSelect
            />
            {renderRefresh(
              () => refreshClients(hefflCRMConf, setHefflCRMConf, setIsLoading),
              __('Refresh Clients', 'bit-integrations')
            )}
          </div>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Lead (optional):', 'bit-integrations')}</b>
            <MultiSelect
              title="leadId"
              defaultValue={hefflCRMConf?.leadId ?? null}
              className="btcd-paper-drpdwn w-5"
              options={hefflCRMConf?.leads || []}
              onChange={val => setField(setHefflCRMConf, 'leadId', val)}
              singleSelect
              closeOnSelect
            />
            {renderRefresh(
              () => refreshLeads(hefflCRMConf, setHefflCRMConf, setIsLoading),
              __('Refresh Leads', 'bit-integrations')
            )}
          </div>
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

      {hefflCRMConf?.mainAction && hefflCRMConf.hefflCRMFields && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Heffl CRM Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {hefflCRMConf?.field_map?.map((itm, i) => (
            <HefflCRMFieldMap
              key={`heffl-crm-m-${i + 9}`}
              i={i}
              field={itm}
              hefflCRMConf={hefflCRMConf}
              formFields={formFields}
              setHefflCRMConf={setHefflCRMConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(hefflCRMConf.field_map.length, hefflCRMConf, setHefflCRMConf)
              }
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
