/* eslint-disable no-unused-vars */
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { addFieldMap } from './IntegrationHelpers'
import { generateMappedField, getAllEvents, getAllSessions } from './LivestormCommonFunc'
import LivestormFieldMap from './LivestormFieldMap'

export default function LivestormIntegLayout({
  formFields,
  livestormConf,
  setLivestormConf,
  loading,
  setLoading,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  const setChanges = (val, name) => {
    if (name === 'selectedEvent' && val !== '') {
      getAllSessions(livestormConf, setLivestormConf, val, loading, setLoading, setSnackbar)
    }

    setLivestormConf(prevConf => {
      const newConf = { ...prevConf }
      newConf[name] = val

      if (name === 'selectedEvent') {
        newConf.field_map = generateMappedField(newConf.allFields.filter(fld => fld.eventId === val))
        delete newConf.selectedSession
        delete newConf.sessions
      }
      return newConf
    })
  }

  return (
    <>
      {livestormConf.actionName && !loading.event && (
        <>
          <br />
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Select Event:', 'bit-integrations')}</b>
            <MultiSelect
              options={
                livestormConf?.events &&
                livestormConf.events.map(event => ({ label: event.name, value: `${event.id}` }))
              }
              className="msl-wrp-options dropdown-custom-width"
              defaultValue={livestormConf?.selectedEvent}
              onChange={val => setChanges(val, 'selectedEvent')}
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() =>
                getAllEvents(livestormConf, setLivestormConf, loading, setLoading, setSnackbar)
              }
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Events', 'bit-integrations')}'` }}
              type="button"
              disabled={loading.event}>
              &#x21BB;
            </button>
          </div>
        </>
      )}

      {livestormConf.actionName && livestormConf.selectedEvent && !loading.session && (
        <>
          <br />
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Select Session:', 'bit-integrations')}</b>
            <MultiSelect
              options={
                livestormConf?.sessions &&
                livestormConf.sessions.map(session => ({
                  label: session.datetime,
                  value: `${session.id}`
                }))
              }
              className="msl-wrp-options dropdown-custom-width"
              defaultValue={livestormConf?.selectedSession}
              onChange={val => setChanges(val, 'selectedSession')}
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() =>
                getAllSessions(
                  livestormConf,
                  setLivestormConf,
                  livestormConf.selectedEvent,
                  loading,
                  setLoading,
                  setSnackbar
                )
              }
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Sessions', 'bit-integrations')}'` }}
              type="button"
              disabled={loading.event}>
              &#x21BB;
            </button>
          </div>
        </>
      )}

      {(isLoading || loading.event || loading.session) && (
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

      {livestormConf.actionName &&
        livestormConf.selectedEvent &&
        livestormConf.selectedSession &&
        !isLoading && (
          <div>
            <br />
            <div className="mt-5">
              <b className="wdt-100">{__('Field Map', 'bit-integrations')}</b>
            </div>

            <br />
            <div className="btcd-hr mt-1" />
            <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
              <div className="txt-dp">
                <b>{__('Form Fields', 'bit-integrations')}</b>
              </div>
              <div className="txt-dp">
                <b>{__('Livestorm Fields', 'bit-integrations')}</b>
              </div>
            </div>

            {livestormConf?.field_map.map((itm, i) => (
              <LivestormFieldMap
                key={`rp-m-${i + 9}`}
                i={i}
                field={itm}
                livestormConf={livestormConf}
                formFields={formFields}
                setLivestormConf={setLivestormConf}
                setSnackbar={setSnackbar}
              />
            ))}
            <div className="txt-center btcbi-field-map-button mt-2">
              <button
                onClick={() =>
                  addFieldMap(livestormConf.field_map.length, livestormConf, setLivestormConf, false)
                }
                className="icn-btn sh-sm"
                type="button">
                +
              </button>
            </div>
            <br />
            <br />
          </div>
        )}
    </>
  )
}
