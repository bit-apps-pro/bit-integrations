/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react'
import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import TheEventsCalendarActions from './TheEventsCalendarActions'
import 'react-multiple-select-dropdown-lite/dist/index.css'

import TheEventsCalendarFieldMap from './TheEventsCalendarFieldMap'
import { addFieldMap } from './IntegrationHelpers'
import {
  getAllEvents,
  listConfKey,
  refreshTheEventsCalendarList,
  refreshTheEventsCalendarLists,
  theEventsCalendarStaticFields
} from './theEventsCalendarCommonFunctions'
import {
  actionNotes,
  listsByAction,
  requiredSelects,
  TASK_LIST,
  TASK_LIST_VALUES,
  utilitiesByAction
} from './theEventsCalendarConstants'
import Loader from '../../Loaders/Loader'

const requiredSelectKeys = Object.values(requiredSelects).flatMap(selects =>
  selects.map(({ confKey }) => confKey)
)

function RequiredSelect({ select, theEventsCalendarConf, setField, onRefresh, isLoading }) {
  const { confKey, label, list, options } = select
  const selectOptions = list ? theEventsCalendarConf?.[listConfKey(list)] || [] : options

  return (
    <div className="flx mt-3 mb-4">
      <b className="wdt-200 d-in-b">{label}</b>
      <MultiSelect
        key={`${confKey}-${selectOptions.length}`}
        style={{ width: '450px' }}
        options={selectOptions}
        className="msl-wrp-options"
        defaultValue={theEventsCalendarConf?.[confKey] || undefined}
        onChange={val => setField(confKey, val)}
        singleSelect
        closeOnSelect
      />
      {list && (
        <button
          onClick={() => onRefresh(list)}
          className="icn-btn sh-sm ml-2 mr-2 tooltip"
          style={{ '--tooltip-txt': `'${__('Refresh the list', 'bit-integrations')}'` }}
          disabled={isLoading}
          type="button">
          &#x21BB;
        </button>
      )}
    </div>
  )
}

export default function TheEventsCalendarIntegLayout({
  formFields,
  theEventsCalendarConf,
  setTheEventsCalendarConf,
  loading,
  setLoading,
  setSnackbar
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi
  const { selectedTask } = theEventsCalendarConf

  useEffect(() => {
    if (selectedTask && selectedTask !== TASK_LIST_VALUES.NEW_ATTENDEE) {
      refreshTheEventsCalendarLists(
        listsByAction[selectedTask] || [],
        setTheEventsCalendarConf,
        setLoading
      )
    }
  }, [])

  const setChanges = val => {
    const newConf = { ...theEventsCalendarConf }
    newConf.selectedTask = val
    newConf.selectedEvent = ''
    newConf.utilities = {}
    requiredSelectKeys.forEach(confKey => delete newConf[confKey])

    if (val) {
      const fieldsAndFieldMap = theEventsCalendarStaticFields(val)
      newConf.staticFields = fieldsAndFieldMap.staticFields
      newConf.field_map = fieldsAndFieldMap.fieldMap
      if (val === TASK_LIST_VALUES.NEW_ATTENDEE) {
        getAllEvents(newConf, setTheEventsCalendarConf, loading, setLoading)
      }
    } else {
      newConf.staticFields = []
      newConf.field_map = []
    }

    setTheEventsCalendarConf({ ...newConf })

    if (val && val !== TASK_LIST_VALUES.NEW_ATTENDEE) {
      refreshTheEventsCalendarLists(listsByAction[val] || [], setTheEventsCalendarConf, setLoading)
    }
  }

  const handleMultiSelectChange = (val, type) => {
    const newConf = { ...theEventsCalendarConf }
    newConf[type] = val
    setTheEventsCalendarConf({ ...newConf })
  }

  const setField = (key, value) =>
    setTheEventsCalendarConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf[key] = value
      })
    )

  const refreshList = listName =>
    refreshTheEventsCalendarList(listName, setTheEventsCalendarConf, setLoading)

  const isLoading = loading.events || loading.lists

  return (
    <>
      <div>
        <div className="flx mt-3 mb-4">
          <b className="wdt-200 d-in-b">{__('Select Task:', 'bit-integrations')}</b>
          <MultiSelect
            style={{ width: '450px' }}
            options={TASK_LIST.map(task => ({
              label: checkIsPro(isPro, task.is_pro) ? task.label : getProLabel(task.label),
              value: task.value,
              disabled: !checkIsPro(isPro, task.is_pro)
            }))}
            className="msl-wrp-options"
            defaultValue={selectedTask}
            onChange={val => setChanges(val)}
            singleSelect
          />
        </div>

        {actionNotes[selectedTask] && <p className="mt-2 mb-0 txt-dp">{actionNotes[selectedTask]}</p>}

        {selectedTask === TASK_LIST_VALUES.NEW_ATTENDEE && (
          <>
            <p className="mt-2 mb-0 txt-dp">
              {__('This task needs the Event Tickets plugin.', 'bit-integrations')}
            </p>
            <div className="flx mt-3 mb-4">
              <b className="wdt-200 d-in-b">{__('Select Event:', 'bit-integrations')}</b>
              <MultiSelect
                style={{ width: '450px' }}
                options={theEventsCalendarConf?.events}
                className="msl-wrp-options"
                defaultValue={theEventsCalendarConf?.selectedEvent}
                onChange={val => handleMultiSelectChange(val, 'selectedEvent')}
                disabled={loading.events}
                singleSelect
              />
              <button
                onClick={() =>
                  getAllEvents(theEventsCalendarConf, setTheEventsCalendarConf, loading, setLoading)
                }
                className="icn-btn sh-sm ml-2 mr-2 tooltip"
                style={{ '--tooltip-txt': `'${__('Refresh events', 'bit-integrations')}'` }}
                disabled={loading.events}
                type="button">
                &#x21BB;
              </button>
            </div>
          </>
        )}

        {(requiredSelects[selectedTask] || []).map(select => (
          <RequiredSelect
            key={select.confKey}
            select={select}
            theEventsCalendarConf={theEventsCalendarConf}
            setField={setField}
            onRefresh={refreshList}
            isLoading={isLoading}
          />
        ))}

        {isLoading && (
          <Loader
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 45,
              transform: 'scale(0.5)'
            }}
          />
        )}

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
            <b>{__('The Events Calendar Fields', 'bit-integrations')}</b>
          </div>
        </div>

        {selectedTask &&
          theEventsCalendarConf?.field_map.map((itm, i) => (
            <TheEventsCalendarFieldMap
              key={`rp-m-${i + 9}`}
              i={i}
              field={itm}
              theEventsCalendarConf={theEventsCalendarConf}
              formFields={formFields}
              setTheEventsCalendarConf={setTheEventsCalendarConf}
              setSnackbar={setSnackbar}
            />
          ))}

        {selectedTask && (
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(
                  theEventsCalendarConf.field_map.length,
                  theEventsCalendarConf,
                  setTheEventsCalendarConf,
                  false
                )
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
        )}

        {utilitiesByAction[selectedTask] && (
          <div className="mt-4">
            <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
            <div className="btcd-hr mt-1" />
            <TheEventsCalendarActions
              theEventsCalendarConf={theEventsCalendarConf}
              setTheEventsCalendarConf={setTheEventsCalendarConf}
            />
          </div>
        )}
      </div>
    </>
  )
}
