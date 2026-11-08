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
import EasyAppointmentsActions from './EasyAppointmentsActions'
import {
  generateMappedField,
  getActionFields,
  refreshEasyAppointmentsCustomFields,
  refreshEasyAppointmentsEmployees,
  refreshEasyAppointmentsLocations,
  refreshEasyAppointmentsServices,
  refreshEasyAppointmentsStatuses,
  refreshEasyAppointmentsUsers
} from './EasyAppointmentsCommonFunc'
import EasyAppointmentsFieldMap from './EasyAppointmentsFieldMap'
import {
  actionNotes,
  appointmentFormActions,
  connectionActions,
  DAY_OPTIONS,
  fieldsByAction,
  hasUtilities,
  modules,
  REPEAT_OPTIONS,
  requiredScheduleActions,
  scheduleActions,
  statusActions,
  userActions,
  WORKING_OPTIONS
} from './staticData'

const SELECTED_KEYS = [
  'selectedLocation',
  'selectedService',
  'selectedEmployee',
  'selectedStatus',
  'selectedUser',
  'selectedDays',
  'selectedRepeat',
  'selectedWorking'
]

export default function EasyAppointmentsIntegLayout({
  formFields,
  easyAppointmentsConf,
  setEasyAppointmentsConf,
  isLoading,
  setIsLoading
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const loadOptionLists = action => {
    const loaders = []

    if (scheduleActions.includes(action)) {
      loaders.push(
        refreshEasyAppointmentsLocations,
        refreshEasyAppointmentsServices,
        refreshEasyAppointmentsEmployees
      )
    }

    if (statusActions.includes(action)) {
      loaders.push(refreshEasyAppointmentsStatuses)
    }

    if (userActions.includes(action)) {
      loaders.push(refreshEasyAppointmentsUsers)
    }

    if (appointmentFormActions.includes(action)) {
      loaders.push(refreshEasyAppointmentsCustomFields)
    }

    if (loaders.length > 0) {
      setIsLoading(true)
      Promise.all(loaders.map(load => load(setEasyAppointmentsConf, null, false))).finally(() =>
        setIsLoading(false)
      )
    }
  }

  useEffect(() => {
    if (easyAppointmentsConf?.mainAction) {
      loadOptionLists(easyAppointmentsConf.mainAction)
    }
  }, [])

  const handleMainAction = value => {
    setEasyAppointmentsConf(prevConf =>
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
    setEasyAppointmentsConf(prevConf =>
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

  const { mainAction } = easyAppointmentsConf || {}
  const actionFields = getActionFields(easyAppointmentsConf)
  const hasOptionalFields = actionFields.some(field => !field.required)
  const optionalLabel = label => `${label} ${__('(optional)', 'bit-integrations')}:`
  const requiredLabel = label => `${label}:`
  const isScheduleRequired = requiredScheduleActions.includes(mainAction)

  const selectRow = ({ confKey, label, options, required, refresh, refreshLabel, multi }) => (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{required ? requiredLabel(label) : optionalLabel(label)}</b>
        <MultiSelect
          key={`${confKey}-${options.length}`}
          title={confKey}
          defaultValue={easyAppointmentsConf?.[confKey] ?? null}
          className="btcd-paper-drpdwn w-5"
          options={options}
          onChange={val => setConfValue(confKey, val)}
          singleSelect={!multi}
          closeOnSelect={!multi}
        />
        {refresh && (
          <button
            onClick={() => refresh(setEasyAppointmentsConf, setIsLoading)}
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `'${refreshLabel}'` }}
            type="button"
            disabled={isLoading}>
            &#x21BB;
          </button>
        )}
      </div>
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

      {scheduleActions.includes(mainAction) && (
        <>
          {selectRow({
            confKey: 'selectedLocation',
            label: __('Location', 'bit-integrations'),
            options: toOptions(easyAppointmentsConf?.allLocations),
            required: isScheduleRequired,
            refresh: refreshEasyAppointmentsLocations,
            refreshLabel: __('Refresh Locations', 'bit-integrations')
          })}
          {selectRow({
            confKey: 'selectedService',
            label: __('Service', 'bit-integrations'),
            options: toOptions(easyAppointmentsConf?.allServices),
            required: isScheduleRequired,
            refresh: refreshEasyAppointmentsServices,
            refreshLabel: __('Refresh Services', 'bit-integrations')
          })}
          {selectRow({
            confKey: 'selectedEmployee',
            label: __('Employee', 'bit-integrations'),
            options: toOptions(easyAppointmentsConf?.allEmployees),
            required: isScheduleRequired,
            refresh: refreshEasyAppointmentsEmployees,
            refreshLabel: __('Refresh Employees', 'bit-integrations')
          })}
        </>
      )}

      {statusActions.includes(mainAction) && (
        <>
          {selectRow({
            confKey: 'selectedStatus',
            label: __('Status', 'bit-integrations'),
            options: toOptions(easyAppointmentsConf?.allStatuses),
            required: mainAction === 'change_appointment_status',
            refresh: refreshEasyAppointmentsStatuses,
            refreshLabel: __('Refresh Statuses', 'bit-integrations')
          })}
          {appointmentFormActions.includes(mainAction) && (
            <>
              <br />
              <Note
                note={
                  mainAction === 'create_appointment'
                    ? __(
                        'Leave Status empty to use the default status from the Easy Appointments settings.',
                        'bit-integrations'
                      )
                    : __('Leave Status empty to keep the current status.', 'bit-integrations')
                }
              />
            </>
          )}
        </>
      )}

      {userActions.includes(mainAction) &&
        selectRow({
          confKey: 'selectedUser',
          label: __('WordPress User', 'bit-integrations'),
          options: toOptions(easyAppointmentsConf?.allUsers),
          required: false,
          refresh: refreshEasyAppointmentsUsers,
          refreshLabel: __('Refresh Users', 'bit-integrations')
        })}

      {connectionActions.includes(mainAction) && (
        <>
          {selectRow({
            confKey: 'selectedDays',
            label: __('Days of Week', 'bit-integrations'),
            options: DAY_OPTIONS,
            required: mainAction === 'create_connection',
            multi: true
          })}
          {selectRow({
            confKey: 'selectedRepeat',
            label: __('Repeat', 'bit-integrations'),
            options: REPEAT_OPTIONS,
            required: false
          })}
          {selectRow({
            confKey: 'selectedWorking',
            label: __('Is Working', 'bit-integrations'),
            options: WORKING_OPTIONS,
            required: false
          })}
        </>
      )}

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
              <b>{__('Easy Appointments Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {easyAppointmentsConf?.field_map?.map((itm, i) => (
            <EasyAppointmentsFieldMap
              key={`easy-appointments-m-${i + 9}`}
              i={i}
              field={itm}
              easyAppointmentsConf={easyAppointmentsConf}
              formFields={formFields}
              setEasyAppointmentsConf={setEasyAppointmentsConf}
            />
          ))}
          {hasOptionalFields && (
            <div className="txt-center btcbi-field-map-button mt-2">
              <button
                onClick={() =>
                  addFieldMap(
                    easyAppointmentsConf.field_map.length,
                    easyAppointmentsConf,
                    setEasyAppointmentsConf
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
          <EasyAppointmentsActions
            easyAppointmentsConf={easyAppointmentsConf}
            setEasyAppointmentsConf={setEasyAppointmentsConf}
          />
        </div>
      )}
    </>
  )
}
