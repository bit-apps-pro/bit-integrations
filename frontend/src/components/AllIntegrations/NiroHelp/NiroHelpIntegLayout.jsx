import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import NiroHelpActions from './NiroHelpActions'
import { generateMappedField, refreshNiroHelpList, refreshNiroHelpLists } from './NiroHelpCommonFunc'
import NiroHelpFieldMap from './NiroHelpFieldMap'
import {
  customerReplyOption,
  fieldSets,
  listsByAction,
  modules,
  needsAssignAgent,
  needsDocAuthor,
  needsReplyAuthor,
  needsSentiment,
  needsTicketStatus,
  noAgentOption,
  sentimentOptions,
  ticketStatusOptions,
  utilitiesByAction
} from './staticData'

function RequiredSelect({ label, confKey, options, niroHelpConf, setField, onRefresh, isLoading }) {
  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{label}</b>
        <MultiSelect
          key={`${confKey}-${options.length}`}
          title={confKey}
          defaultValue={niroHelpConf?.[confKey] ?? null}
          className="btcd-paper-drpdwn w-5"
          options={options}
          onChange={val => setField(confKey, val)}
          singleSelect
          closeOnSelect
        />
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `'${__('Refresh the list', 'bit-integrations')}'` }}
            type="button"
            disabled={isLoading}>
            &#x21BB;
          </button>
        )}
      </div>
    </>
  )
}

export default function NiroHelpIntegLayout({
  formFields,
  niroHelpConf,
  setNiroHelpConf,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const setField = (key, value) =>
    setNiroHelpConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf[key] = value
      })
    )

  const handleMainAction = value => {
    setNiroHelpConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.niroHelpFields = fieldSets[value] || []
        draftConf.field_map = generateMappedField(draftConf.niroHelpFields)
        draftConf.utilities = {}
      })
    )

    refreshNiroHelpLists(listsByAction[value] || [], setNiroHelpConf, setIsLoading)
  }

  const refreshAgents = () => refreshNiroHelpList('agents', setNiroHelpConf, setIsLoading)
  const agents = niroHelpConf?.allAgents ?? []
  const mainAction = niroHelpConf?.mainAction

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
          options={modules.map(action => ({
            label: checkIsPro(isPro, action.is_pro) ? action.label : getProLabel(action.label),
            value: action.name,
            disabled: !checkIsPro(isPro, action.is_pro)
          }))}
          singleSelect
          closeOnSelect
        />
      </div>

      {needsTicketStatus.includes(mainAction) && (
        <RequiredSelect
          label={__('Status:', 'bit-integrations')}
          confKey="status"
          options={ticketStatusOptions}
          niroHelpConf={niroHelpConf}
          setField={setField}
        />
      )}

      {needsAssignAgent.includes(mainAction) && (
        <RequiredSelect
          label={__('Agent:', 'bit-integrations')}
          confKey="agentId"
          options={[noAgentOption, ...agents]}
          niroHelpConf={niroHelpConf}
          setField={setField}
          onRefresh={refreshAgents}
          isLoading={isLoading}
        />
      )}

      {needsSentiment.includes(mainAction) && (
        <RequiredSelect
          label={__('Sentiment:', 'bit-integrations')}
          confKey="sentiment"
          options={sentimentOptions}
          niroHelpConf={niroHelpConf}
          setField={setField}
        />
      )}

      {needsReplyAuthor.includes(mainAction) && (
        <RequiredSelect
          label={__('Reply As:', 'bit-integrations')}
          confKey="replyBy"
          options={[customerReplyOption, ...agents]}
          niroHelpConf={niroHelpConf}
          setField={setField}
          onRefresh={refreshAgents}
          isLoading={isLoading}
        />
      )}

      {needsDocAuthor.includes(mainAction) && (
        <RequiredSelect
          label={__('Author:', 'bit-integrations')}
          confKey="authorId"
          options={niroHelpConf?.allUsers ?? []}
          niroHelpConf={niroHelpConf}
          setField={setField}
          onRefresh={() => refreshNiroHelpList('users', setNiroHelpConf, setIsLoading)}
          isLoading={isLoading}
        />
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

      {mainAction && niroHelpConf.niroHelpFields && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('NiroHelp Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {niroHelpConf?.field_map?.map((itm, i) => (
            <NiroHelpFieldMap
              key={`niro-help-m-${i + 9}`}
              i={i}
              field={itm}
              niroHelpConf={niroHelpConf}
              formFields={formFields}
              setNiroHelpConf={setNiroHelpConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() => addFieldMap(niroHelpConf.field_map.length, niroHelpConf, setNiroHelpConf)}
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
          <br />
        </div>
      )}

      {mainAction && utilitiesByAction[mainAction] && (
        <div className="mt-4">
          <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <NiroHelpActions
            niroHelpConf={niroHelpConf}
            setNiroHelpConf={setNiroHelpConf}
            setSnackbar={setSnackbar}
          />
        </div>
      )}
    </>
  )
}
