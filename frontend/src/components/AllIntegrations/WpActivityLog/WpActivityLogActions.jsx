/* eslint-disable no-param-reassign */

import { useState } from 'react'
import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import ConfirmModal from '../../Utilities/ConfirmModal'
import TableCheckBox from '../../Utilities/TableCheckBox'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import {
  refreshWpActivityLogEvents,
  refreshWpActivityLogEventTypes,
  refreshWpActivityLogObjects,
  refreshWpActivityLogUsers
} from './WpActivityLogCommonFunc'
import { severityOptions } from './staticData'

export default function WpActivityLogActions({ wpActivityLogConf, setWpActivityLogConf }) {
  const [isLoading, setIsLoading] = useState(false)
  const [actionMdl, setActionMdl] = useState({ show: false })

  const actionHandler = (e, type) => {
    setActionMdl({ show: type })

    if (type === 'user') {
      refreshWpActivityLogUsers(setWpActivityLogConf, setIsLoading)
    }
    if (type === 'event') {
      refreshWpActivityLogEvents(setWpActivityLogConf, setIsLoading)
    }
    if (type === 'object') {
      refreshWpActivityLogObjects(setWpActivityLogConf, setIsLoading)
    }
    if (type === 'event_type') {
      refreshWpActivityLogEventTypes(setWpActivityLogConf, setIsLoading)
    }
  }

  const clsActionMdl = () => setActionMdl({ show: false })

  const setAction = (val, name) => {
    setWpActivityLogConf(prevConf =>
      create(prevConf, draftConf => {
        if (!draftConf.utilities) {
          draftConf.utilities = {}
        }
        draftConf.utilities[name] = val
      })
    )
  }

  const renderActionModal = (type, title, options, valueName, refresh = null) => (
    <ConfirmModal
      className="custom-conf-mdl"
      mainMdlCls="o-v"
      btnClass="purple"
      btnTxt={__('Ok', 'bit-integrations')}
      show={actionMdl.show === type}
      close={clsActionMdl}
      action={clsActionMdl}
      title={title}>
      <div className="btcd-hr mt-2 mb-2" />
      <div className="mt-2">{title}</div>
      {isLoading ? (
        <Loader
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 45,
            transform: 'scale(0.5)'
          }}
        />
      ) : (
        <div className="flx flx-between mt-2">
          <MultiSelect
            options={options}
            className="msl-wrp-options"
            singleSelect
            closeOnSelect
            defaultValue={wpActivityLogConf?.utilities?.[valueName] || undefined}
            onChange={val => setAction(val, valueName)}
          />
          {refresh && (
            <button
              onClick={() => refresh(setWpActivityLogConf, setIsLoading)}
              className="icn-btn sh-sm ml-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          )}
        </div>
      )}
    </ConfirmModal>
  )

  const toOptions = items =>
    (items || []).map(item => ({ label: item.label, value: item.value?.toString() }))

  const userOptions = toOptions(wpActivityLogConf?.allUsers)
  const eventOptions = toOptions(wpActivityLogConf?.allEvents)
  const objectOptions = toOptions(wpActivityLogConf?.allObjects)
  const eventTypeOptions = toOptions(wpActivityLogConf?.allEventTypes)

  const { mainAction } = wpActivityLogConf

  return (
    <div className="pos-rel d-flx flx-wrp">
      {['log_event', 'delete_events'].includes(mainAction) && (
        <>
          <TableCheckBox
            checked={wpActivityLogConf?.utilities?.selected_user || false}
            onChange={e => actionHandler(e, 'user')}
            className="wdt-200 mt-4 mr-2"
            value="user"
            title={__('User', 'bit-integrations')}
            subTitle={
              mainAction === 'log_event'
                ? __('Log the event for this user', 'bit-integrations')
                : __('Delete only the log entries of this user', 'bit-integrations')
            }
          />
          {renderActionModal(
            'user',
            __('User', 'bit-integrations'),
            userOptions,
            'selected_user',
            refreshWpActivityLogUsers
          )}
        </>
      )}

      {mainAction === 'delete_events' && (
        <>
          <TableCheckBox
            checked={wpActivityLogConf?.utilities?.selected_event || false}
            onChange={e => actionHandler(e, 'event')}
            className="wdt-200 mt-4 mr-2"
            value="event"
            title={__('Event', 'bit-integrations')}
            subTitle={__('Delete only the log entries of this event', 'bit-integrations')}
          />
          <TableCheckBox
            checked={wpActivityLogConf?.utilities?.selected_severity || false}
            onChange={e => actionHandler(e, 'severity')}
            className="wdt-200 mt-4 mr-2"
            value="severity"
            title={__('Severity', 'bit-integrations')}
            subTitle={__('Delete only the log entries with this severity', 'bit-integrations')}
          />
          <TableCheckBox
            checked={wpActivityLogConf?.utilities?.selected_object || false}
            onChange={e => actionHandler(e, 'object')}
            className="wdt-200 mt-4 mr-2"
            value="object"
            title={__('Object', 'bit-integrations')}
            subTitle={__('Delete only the log entries about this object', 'bit-integrations')}
          />
          <TableCheckBox
            checked={wpActivityLogConf?.utilities?.selected_event_type || false}
            onChange={e => actionHandler(e, 'event_type')}
            className="wdt-200 mt-4 mr-2"
            value="event_type"
            title={__('Event Type', 'bit-integrations')}
            subTitle={__('Delete only the log entries of this event type', 'bit-integrations')}
          />
          {renderActionModal(
            'event',
            __('Event', 'bit-integrations'),
            eventOptions,
            'selected_event',
            refreshWpActivityLogEvents
          )}
          {renderActionModal(
            'severity',
            __('Severity', 'bit-integrations'),
            severityOptions,
            'selected_severity'
          )}
          {renderActionModal(
            'object',
            __('Object', 'bit-integrations'),
            objectOptions,
            'selected_object',
            refreshWpActivityLogObjects
          )}
          {renderActionModal(
            'event_type',
            __('Event Type', 'bit-integrations'),
            eventTypeOptions,
            'selected_event_type',
            refreshWpActivityLogEventTypes
          )}
        </>
      )}
    </div>
  )
}
