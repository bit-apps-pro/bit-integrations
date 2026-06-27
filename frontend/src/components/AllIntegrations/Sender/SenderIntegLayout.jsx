import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import { generateMappedField, refreshSenderFields, refreshSenderGroups } from './SenderCommonFunc'
import SenderActions from './SenderActions'
import SenderFieldMap from './SenderFieldMap'
import {
  modules,
  senderFieldsByAction,
  singleGroupActions,
  subscriberActions,
  triggerAutomationActions
} from './staticData'

export default function SenderIntegLayout({
  formFields,
  senderConf,
  setSenderConf,
  isLoading,
  setIsLoading
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const setField = (key, val) =>
    setSenderConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf[key] = val
      })
    )

  const handleMainAction = value => {
    const fields = senderFieldsByAction[value] || []

    setSenderConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.senderFields = fields
        draftConf.field_map = fields.length ? generateMappedField(fields) : []
        // Clear per-action utilities/group selections so they never leak across an action switch.
        draftConf.actions = {}
        draftConf.groupId = ''
        draftConf.groups = []
      })
    )

    if (singleGroupActions.includes(value) || subscriberActions.includes(value)) {
      refreshSenderGroups(senderConf, setSenderConf, setIsLoading)
    }
    if (subscriberActions.includes(value)) {
      refreshSenderFields(senderConf, setSenderConf, setIsLoading)
    }
  }

  const groupOptions = (senderConf?.allGroups ?? []).map(group => ({
    label: group.title,
    value: String(group.id)
  }))

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="mainAction"
          defaultValue={senderConf?.mainAction ?? null}
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

      {singleGroupActions.includes(senderConf?.mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Group:', 'bit-integrations')}</b>
            <MultiSelect
              title="groupId"
              defaultValue={senderConf?.groupId ?? null}
              className="btcd-paper-drpdwn w-5"
              options={groupOptions}
              onChange={val => setField('groupId', val)}
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() => refreshSenderGroups(senderConf, setSenderConf, setIsLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Groups', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
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

      {senderConf?.mainAction && senderConf?.senderFields?.length > 0 && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          {subscriberActions.includes(senderConf?.mainAction) && (
            <button
              onClick={() => refreshSenderFields(senderConf, setSenderConf, setIsLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
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
            <div className="txt-dp">
              <b>{__('Sender Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {senderConf?.field_map?.map((itm, i) => (
            <SenderFieldMap
              key={`sender-m-${i + 9}`}
              i={i}
              field={itm}
              senderConf={senderConf}
              formFields={formFields}
              setSenderConf={setSenderConf}
            />
          ))}
          {subscriberActions.includes(senderConf?.mainAction) && (
            <div className="txt-center btcbi-field-map-button mt-2">
              <button
                onClick={() => addFieldMap(senderConf.field_map.length, senderConf, setSenderConf)}
                className="icn-btn sh-sm"
                type="button">
                +
              </button>
            </div>
          )}
          <br />
        </div>
      )}

      {triggerAutomationActions.includes(senderConf?.mainAction) && (
        <div className="mt-4">
          <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <SenderActions
            senderConf={senderConf}
            setSenderConf={setSenderConf}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        </div>
      )}
    </>
  )
}
