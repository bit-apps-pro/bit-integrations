import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import { generateMappedField, refreshGroups } from './WsmsCommonFunc'
import WsmsFieldMap from './WsmsFieldMap'
import { modules, wsmsStatuses, WsmsStaticData } from './staticData'

const GROUP_ACTIONS = ['add_subscriber', 'update_subscriber', 'delete_subscriber']
const STATUS_ACTIONS = ['add_subscriber', 'update_subscriber']

export default function WsmsIntegLayout({
  formID,
  formFields,
  wsmsConf,
  setWsmsConf,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const handleMainAction = value => {
    setWsmsConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.wsmsFields = WsmsStaticData[value] || []
        draftConf.field_map = generateMappedField(draftConf.wsmsFields)
        // Clear identifiers from the previous action so they do not leak into the new one.
        delete draftConf.groupId
        delete draftConf.status
      })
    )

    if (GROUP_ACTIONS.includes(value)) {
      refreshGroups(setWsmsConf, setIsLoading)
    }
  }

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="mainAction"
          defaultValue={wsmsConf?.mainAction ?? null}
          className="mt-2 w-5"
          onChange={value => handleMainAction(value)}
          options={modules?.map(action => ({
            label: checkIsPro(isPro, action.is_pro) ? action.label : getProLabel(action.label),
            value: action.name,
            disabled: checkIsPro(isPro, action.is_pro) ? false : true
          }))}
          singleSelect
          closeOnSelect
        />
      </div>

      {GROUP_ACTIONS.includes(wsmsConf?.mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Group:', 'bit-integrations')}</b>
            <MultiSelect
              title="groupId"
              defaultValue={wsmsConf?.groupId ?? null}
              className="btcd-paper-drpdwn w-5"
              options={
                wsmsConf?.allGroups &&
                Array.isArray(wsmsConf.allGroups) &&
                wsmsConf.allGroups.map(group => ({
                  label: group.label,
                  value: group.value?.toString()
                }))
              }
              onChange={val =>
                setWsmsConf(prevConf =>
                  create(prevConf, draftConf => {
                    draftConf.groupId = val
                  })
                )
              }
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() => refreshGroups(setWsmsConf, setIsLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Groups', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
        </>
      )}

      {STATUS_ACTIONS.includes(wsmsConf?.mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Status:', 'bit-integrations')}</b>
            <MultiSelect
              title="status"
              defaultValue={wsmsConf?.status ?? null}
              className="btcd-paper-drpdwn w-5"
              options={wsmsStatuses}
              onChange={val =>
                setWsmsConf(prevConf =>
                  create(prevConf, draftConf => {
                    draftConf.status = val
                  })
                )
              }
              singleSelect
              closeOnSelect
            />
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

      {wsmsConf?.mainAction && wsmsConf.wsmsFields && wsmsConf.wsmsFields.length > 0 && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('WSMS Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {wsmsConf?.field_map?.map((itm, i) => (
            <WsmsFieldMap
              key={`wsms-m-${i + 9}`}
              i={i}
              field={itm}
              wsmsConf={wsmsConf}
              formFields={formFields}
              setWsmsConf={setWsmsConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() => addFieldMap(wsmsConf.field_map.length, wsmsConf, setWsmsConf)}
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
