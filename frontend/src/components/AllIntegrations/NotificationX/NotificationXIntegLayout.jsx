import { create } from 'mutative'
import { useState } from 'react'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import Note from '../../Utilities/Note'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import { generateMappedField, refreshNotificationsBySource } from './NotificationXCommonFunc'
import NotificationXEntryFieldMap from './NotificationXEntryFieldMap'
import NotificationXFieldMap from './NotificationXFieldMap'
import {
  EmailSubscriptionFields,
  modules,
  NOTIFICATION_SELECTION_ACTIONS,
  NotificationIdField,
  ReviewFields,
  SalesNotificationFields
} from './staticData'

export default function NotificationXIntegLayout({
  formID,
  formFields,
  notificationXConf,
  setNotificationXConf,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi
  const [notifLoading, setNotifLoading] = useState(false)

  const handleMainAction = value => {
    setNotificationXConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.entry_map = []

        switch (value) {
          case 'add_sales_notification':
            draftConf.notificationXFields = SalesNotificationFields
            draftConf.field_map = generateMappedField(SalesNotificationFields)
            draftConf.selected_notification_id = ''
            draftConf.notifications = []
            break
          case 'add_reviews':
            draftConf.notificationXFields = ReviewFields
            draftConf.field_map = generateMappedField(ReviewFields)
            draftConf.selected_notification_id = ''
            draftConf.notifications = []
            break
          case 'add_email_subscription':
            draftConf.notificationXFields = EmailSubscriptionFields
            draftConf.field_map = generateMappedField(EmailSubscriptionFields)
            draftConf.selected_notification_id = ''
            draftConf.notifications = []
            break
          case 'delete_notification':
          case 'enable_notification':
          case 'disable_notification':
            draftConf.notificationXFields = NotificationIdField
            draftConf.field_map = generateMappedField(NotificationIdField)
            break
          case 'add_notification_entry':
            draftConf.notificationXFields = NotificationIdField
            draftConf.field_map = generateMappedField(NotificationIdField)
            draftConf.entry_map = draftConf.entry_map?.length
              ? draftConf.entry_map
              : [{ formField: '', entryKey: '' }]
            break
          default:
            draftConf.notificationXFields = []
            draftConf.field_map = []
        }
      })
    )

    if (NOTIFICATION_SELECTION_ACTIONS.includes(value)) {
      refreshNotificationsBySource(value, setNotificationXConf, setNotifLoading, setSnackbar)
    }
  }

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="mainAction"
          defaultValue={notificationXConf?.mainAction ?? null}
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

      {NOTIFICATION_SELECTION_ACTIONS.includes(notificationXConf?.mainAction) && (
        <div className="flx mt-3">
          <b className="wdt-200 d-in-b">{__('Select Notification:', 'bit-integrations')}</b>
          <MultiSelect
            title="selected_notification_id"
            defaultValue={notificationXConf?.selected_notification_id ?? null}
            className="w-5"
            onChange={value =>
              setNotificationXConf(prev =>
                create(prev, draft => {
                  draft.selected_notification_id = value
                })
              )
            }
            options={(notificationXConf?.notifications || []).map(n => ({
              label: n.label,
              value: n.value
            }))}
            singleSelect
            closeOnSelect
          />
          <button
            onClick={() =>
              refreshNotificationsBySource(
                notificationXConf.mainAction,
                setNotificationXConf,
                setNotifLoading,
                setSnackbar
              )
            }
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `'${__('Refresh Notifications', 'bit-integrations')}'` }}
            type="button"
            disabled={notifLoading}>
            &#x21BB;
          </button>
        </div>
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

      {notificationXConf?.notificationXFields?.length > 0 && notificationXConf.field_map?.length > 0 && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('NotificationX Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {notificationXConf?.field_map?.map((itm, i) => (
            <NotificationXFieldMap
              key={`nx-m-${i + 9}`}
              i={i}
              field={itm}
              notificationXConf={notificationXConf}
              formFields={formFields}
              setNotificationXConf={setNotificationXConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(notificationXConf.field_map.length, notificationXConf, setNotificationXConf)
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
        </div>
      )}

      {notificationXConf?.mainAction === 'add_notification_entry' && (
        <div className="mt-4">
          <b className="wdt-100">{__('Entry Data Mapping', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Entry Key', 'bit-integrations')}</b>
            </div>
          </div>

          {notificationXConf?.entry_map?.map((itm, i) => (
            <NotificationXEntryFieldMap
              key={`nx-entry-${i + 9}`}
              i={i}
              field={itm}
              notificationXConf={notificationXConf}
              formFields={formFields}
              setNotificationXConf={setNotificationXConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() => {
                const newConf = { ...notificationXConf }
                newConf.entry_map = [...(newConf.entry_map || []), { formField: '', entryKey: '' }]
                setNotificationXConf(newConf)
              }}
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
          <br />
        </div>
      )}

      <br />
      {['add_sales_notification', 'add_reviews', 'add_email_subscription'].includes(
        notificationXConf?.mainAction
      ) && (
        <Note
          note={__(
            'Make sure to select Bit Integrations as the notification source in your NotificationX settings for this action.',
            'bit-integrations'
          )}
        />
      )}
    </>
  )
}
