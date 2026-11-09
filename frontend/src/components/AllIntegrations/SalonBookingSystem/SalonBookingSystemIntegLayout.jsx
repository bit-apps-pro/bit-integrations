import { useEffect } from 'react'
import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import Note from '../../Utilities/Note'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import SalonBookingSystemActions from './SalonBookingSystemActions'
import {
  generateMappedField,
  getActionFields,
  refreshSalonBookingSystemAssistants,
  refreshSalonBookingSystemCategories,
  refreshSalonBookingSystemServices,
  refreshSalonBookingSystemStatuses
} from './SalonBookingSystemCommonFunc'
import SalonBookingSystemFieldMap from './SalonBookingSystemFieldMap'
import {
  actionNotes,
  ATTENDANCE_OPTIONS,
  bookingFormActions,
  categoryActions,
  fieldsByAction,
  hasUtilities,
  modules,
  RECIPIENT_OPTIONS,
  SERVICE_FLAGS,
  servicesActions,
  statusActions,
  YES_NO_OPTIONS
} from './staticData'

const SELECTED_KEYS = [
  'selectedServices',
  'selectedAssistant',
  'selectedStatus',
  'selectedRecipients',
  'selectedAttendance',
  'selectedCategories',
  'selectedParentCategory',
  ...SERVICE_FLAGS.map(flag => flag.confKey)
]

export default function SalonBookingSystemIntegLayout({
  formFields,
  salonBookingSystemConf,
  setSalonBookingSystemConf,
  isLoading,
  setIsLoading
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const loadOptionLists = action => {
    const loaders = []

    if (servicesActions.includes(action)) {
      loaders.push(refreshSalonBookingSystemServices)
    }

    if (bookingFormActions.includes(action)) {
      loaders.push(refreshSalonBookingSystemAssistants)
    }

    if (statusActions.includes(action)) {
      loaders.push(refreshSalonBookingSystemStatuses)
    }

    if (categoryActions.includes(action) || action === 'create_service_category') {
      loaders.push(refreshSalonBookingSystemCategories)
    }

    if (loaders.length > 0) {
      setIsLoading(true)
      Promise.all(loaders.map(load => load(setSalonBookingSystemConf, null, false))).finally(() =>
        setIsLoading(false)
      )
    }
  }

  useEffect(() => {
    if (salonBookingSystemConf?.mainAction) {
      loadOptionLists(salonBookingSystemConf.mainAction)
    }
  }, [])

  const handleMainAction = value => {
    setSalonBookingSystemConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.field_map = generateMappedField(fieldsByAction[value] || [])
        draftConf.utilities = {}
        SELECTED_KEYS.forEach(key => delete draftConf[key])
      })
    )

    loadOptionLists(value)
  }

  const setConfValue = (key, value) => {
    setSalonBookingSystemConf(prevConf =>
      create(prevConf, draftConf => {
        if (value === '' || value === null || value === undefined) {
          delete draftConf[key]
        } else {
          draftConf[key] = value
        }
      })
    )
  }

  const toOptions = items =>
    (items || []).map(item => ({ label: item.label, value: item.value?.toString() }))

  const { mainAction } = salonBookingSystemConf || {}
  const actionFields = getActionFields(salonBookingSystemConf)
  const hasOptionalFields = actionFields.some(field => !field.required)
  const optionalLabel = label => `${label} ${__('(optional)', 'bit-integrations')}:`
  const requiredLabel = label => `${label}:`

  const selectRow = ({ confKey, label, options, required, refresh, refreshLabel, multi, note }) => (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{required ? requiredLabel(label) : optionalLabel(label)}</b>
        <MultiSelect
          key={`${confKey}-${options.length}`}
          title={confKey}
          defaultValue={salonBookingSystemConf?.[confKey] ?? null}
          className="btcd-paper-drpdwn w-5"
          options={options}
          onChange={val => setConfValue(confKey, val)}
          singleSelect={!multi}
          closeOnSelect={!multi}
        />
        {refresh && (
          <button
            onClick={() => refresh(setSalonBookingSystemConf, setIsLoading)}
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `'${refreshLabel}'` }}
            type="button"
            disabled={isLoading}>
            &#x21BB;
          </button>
        )}
      </div>
      {note && (
        <>
          <br />
          <Note note={note} />
        </>
      )}
    </>
  )

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

      {servicesActions.includes(mainAction) &&
        selectRow({
          confKey: 'selectedServices',
          label: __('Services', 'bit-integrations'),
          options: toOptions(salonBookingSystemConf?.allServices),
          required: mainAction === 'create_booking',
          refresh: refreshSalonBookingSystemServices,
          refreshLabel: __('Refresh Services', 'bit-integrations'),
          multi: true
        })}

      {bookingFormActions.includes(mainAction) &&
        selectRow({
          confKey: 'selectedAssistant',
          label: __('Assistant', 'bit-integrations'),
          options: toOptions(salonBookingSystemConf?.allAssistants),
          required: false,
          refresh: refreshSalonBookingSystemAssistants,
          refreshLabel: __('Refresh Assistants', 'bit-integrations')
        })}

      {statusActions.includes(mainAction) &&
        selectRow({
          confKey: 'selectedStatus',
          label: __('Status', 'bit-integrations'),
          options: toOptions(salonBookingSystemConf?.allStatuses),
          required: mainAction === 'change_booking_status',
          refresh: refreshSalonBookingSystemStatuses,
          refreshLabel: __('Refresh Statuses', 'bit-integrations'),
          note:
            mainAction === 'create_booking'
              ? __(
                  'Leave Status empty to use the default status from the salon settings.',
                  'bit-integrations'
                )
              : mainAction === 'update_booking' &&
                __('Leave Status empty to keep the current status.', 'bit-integrations')
        })}

      {mainAction === 'send_booking_summary' &&
        selectRow({
          confKey: 'selectedRecipients',
          label: __('Recipients', 'bit-integrations'),
          options: RECIPIENT_OPTIONS,
          required: true
        })}

      {mainAction === 'set_attendance_result' &&
        selectRow({
          confKey: 'selectedAttendance',
          label: __('Attendance Result', 'bit-integrations'),
          options: ATTENDANCE_OPTIONS,
          required: true
        })}

      {categoryActions.includes(mainAction) &&
        selectRow({
          confKey: 'selectedCategories',
          label: __('Categories', 'bit-integrations'),
          options: toOptions(salonBookingSystemConf?.allCategories),
          required: false,
          refresh: refreshSalonBookingSystemCategories,
          refreshLabel: __('Refresh Categories', 'bit-integrations'),
          multi: true
        })}

      {mainAction === 'create_service_category' &&
        selectRow({
          confKey: 'selectedParentCategory',
          label: __('Parent Category', 'bit-integrations'),
          options: toOptions(salonBookingSystemConf?.allCategories),
          required: false,
          refresh: refreshSalonBookingSystemCategories,
          refreshLabel: __('Refresh Categories', 'bit-integrations')
        })}

      {mainAction === 'update_service' &&
        SERVICE_FLAGS.map(flag => (
          <div key={flag.confKey}>
            {selectRow({
              confKey: flag.confKey,
              label: flag.label,
              options: YES_NO_OPTIONS,
              required: false
            })}
          </div>
        ))}

      {actionNotes[mainAction] && (
        <>
          <br />
          <Note note={actionNotes[mainAction]} />
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

      {mainAction && actionFields.length > 0 && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Salon Booking System Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {salonBookingSystemConf?.field_map?.map((itm, i) => (
            <SalonBookingSystemFieldMap
              key={`salon-booking-system-m-${i + 9}`}
              i={i}
              field={itm}
              salonBookingSystemConf={salonBookingSystemConf}
              formFields={formFields}
              setSalonBookingSystemConf={setSalonBookingSystemConf}
            />
          ))}
          {hasOptionalFields && (
            <div className="txt-center btcbi-field-map-button mt-2">
              <button
                onClick={() =>
                  addFieldMap(
                    salonBookingSystemConf.field_map.length,
                    salonBookingSystemConf,
                    setSalonBookingSystemConf
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
          <SalonBookingSystemActions
            salonBookingSystemConf={salonBookingSystemConf}
            setSalonBookingSystemConf={setSalonBookingSystemConf}
          />
        </div>
      )}
    </>
  )
}
