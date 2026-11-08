import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import Note from '../../Utilities/Note'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import WpActivityLogActions from './WpActivityLogActions'
import {
  generateMappedField,
  refreshWpActivityLogEventFields,
  refreshWpActivityLogEvents
} from './WpActivityLogCommonFunc'
import WpActivityLogFieldMap from './WpActivityLogFieldMap'
import {
  fieldsByAction,
  hasUtilities,
  modules,
  needsEvent,
  needsTimeUnit,
  timeUnitOptions
} from './staticData'

const deleteWarnings = {
  delete_events: __(
    'You cannot restore deleted log entries. Set at least one filter. The action deletes all log entries that match every filter. If a mapped filter has no value, the action stops.',
    'bit-integrations'
  ),
  delete_events_older_than: __(
    'You cannot restore deleted log entries. Make sure that the age is correct before you turn on the flow.',
    'bit-integrations'
  )
}

export default function WpActivityLogIntegLayout({
  formFields,
  wpActivityLogConf,
  setWpActivityLogConf,
  isLoading,
  setIsLoading
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const handleMainAction = value => {
    setWpActivityLogConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.wpActivityLogFields = fieldsByAction[value] || []
        draftConf.field_map = generateMappedField(draftConf.wpActivityLogFields)
        draftConf.utilities = {}
        delete draftConf.selectedEvent
        delete draftConf.selectedTimeUnit
      })
    )

    if (needsEvent.includes(value)) {
      refreshWpActivityLogEvents(setWpActivityLogConf, setIsLoading)
    }
  }

  const handleEvent = value => {
    setWpActivityLogConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.selectedEvent = value
      })
    )

    refreshWpActivityLogEventFields(value, setWpActivityLogConf, setIsLoading)
  }

  const setConfValue = (key, value) => {
    setWpActivityLogConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf[key] = value
      })
    )
  }

  const { mainAction } = wpActivityLogConf || {}
  const hasFields = (wpActivityLogConf?.wpActivityLogFields || []).length > 0
  const hasOptionalFields = (wpActivityLogConf?.wpActivityLogFields || []).some(field => !field.required)

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

      {needsEvent.includes(mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Event:', 'bit-integrations')}</b>
            <MultiSelect
              title="selectedEvent"
              defaultValue={wpActivityLogConf?.selectedEvent ?? null}
              className="btcd-paper-drpdwn w-5"
              options={(wpActivityLogConf?.allEvents || []).map(event => ({
                label: event.label,
                value: event.value?.toString()
              }))}
              onChange={val => handleEvent(val)}
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() => refreshWpActivityLogEvents(setWpActivityLogConf, setIsLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Events', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
          <br />
          <Note
            note={__(
              'Enable the event in WP Activity Log before you log it. Map values for the placeholders of the event message.',
              'bit-integrations'
            )}
          />
        </>
      )}

      {needsTimeUnit.includes(mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Time Unit:', 'bit-integrations')}</b>
            <MultiSelect
              title="selectedTimeUnit"
              defaultValue={wpActivityLogConf?.selectedTimeUnit ?? null}
              className="btcd-paper-drpdwn w-5"
              options={timeUnitOptions}
              onChange={val => setConfValue('selectedTimeUnit', val)}
              singleSelect
              closeOnSelect
            />
          </div>
        </>
      )}

      {deleteWarnings[mainAction] && (
        <>
          <br />
          <Note note={deleteWarnings[mainAction]} />
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

      {mainAction === 'log_event' && wpActivityLogConf?.selectedEvent && !hasFields && !isLoading && (
        <>
          <br />
          <Note
            note={__(
              'This event has no data fields. You do not need to map fields.',
              'bit-integrations'
            )}
          />
        </>
      )}

      {mainAction && hasFields && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('WP Activity Log Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {wpActivityLogConf?.field_map?.map((itm, i) => (
            <WpActivityLogFieldMap
              key={`wp-activity-log-m-${i + 9}`}
              i={i}
              field={itm}
              wpActivityLogConf={wpActivityLogConf}
              formFields={formFields}
              setWpActivityLogConf={setWpActivityLogConf}
            />
          ))}
          {hasOptionalFields && (
            <div className="txt-center btcbi-field-map-button mt-2">
              <button
                onClick={() =>
                  addFieldMap(
                    wpActivityLogConf.field_map.length,
                    wpActivityLogConf,
                    setWpActivityLogConf
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

      {mainAction && hasUtilities.includes(mainAction) && (
        <div className="mt-4">
          <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <WpActivityLogActions
            wpActivityLogConf={wpActivityLogConf}
            setWpActivityLogConf={setWpActivityLogConf}
          />
        </div>
      )}
    </>
  )
}
