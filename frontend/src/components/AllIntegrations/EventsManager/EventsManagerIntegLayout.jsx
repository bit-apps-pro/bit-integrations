import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Note from '../../Utilities/Note'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import { generateMappedField } from './EventsManagerCommonFunc'
import EventsManagerFieldMap from './EventsManagerFieldMap'
import { modules, UnregisterUserFields } from './staticData'

const fieldsByAction = {
  unregister_user_from_event: UnregisterUserFields
}

export default function EventsManagerIntegLayout({
  formFields,
  eventsManagerConf,
  setEventsManagerConf
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const mainAction = eventsManagerConf?.mainAction

  const handleMainAction = value => {
    setEventsManagerConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.eventsManagerFields = fieldsByAction[value] || []
        draftConf.field_map = generateMappedField(draftConf.eventsManagerFields)
      })
    )
  }

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

      {mainAction && eventsManagerConf.eventsManagerFields && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Events Manager Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {eventsManagerConf?.field_map?.map((itm, i) => (
            <EventsManagerFieldMap
              key={`eventsmanager-m-${i + 9}`}
              i={i}
              field={itm}
              eventsManagerConf={eventsManagerConf}
              formFields={formFields}
              setEventsManagerConf={setEventsManagerConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(eventsManagerConf.field_map.length, eventsManagerConf, setEventsManagerConf)
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
          <br />
        </div>
      )}

      {mainAction === 'unregister_user_from_event' && (
        <Note
          note={__(
            'Cancels the user’s active bookings for the mapped event. Event ID is the event’s post ID — map -1 to cancel every active booking that user holds. Bookings that are already cancelled or rejected, and events that have ended, are left alone.',
            'bit-integrations'
          )}
        />
      )}
    </>
  )
}
