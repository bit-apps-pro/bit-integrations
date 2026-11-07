import { useEffect } from 'react'
import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import BookitActions from './BookitActions'
import {
  generateMappedField,
  refreshBookitCategories,
  refreshBookitServices,
  refreshBookitStaff
} from './BookitCommonFunc'
import BookitFieldMap from './BookitFieldMap'
import {
  appointmentStatusOptions,
  fieldsByAction,
  modules,
  needsCategory,
  needsPaymentStatus,
  needsService,
  needsStaff,
  needsStatus,
  needsWeekdays,
  notesByAction,
  paymentStatusOptions,
  utilitiesByAction,
  weekdayOptions
} from './staticData'

const fetchedSelects = [
  { actions: needsService, optionsKey: 'allServices', refresh: refreshBookitServices },
  { actions: needsStaff, optionsKey: 'allStaff', refresh: refreshBookitStaff },
  { actions: needsCategory, optionsKey: 'allCategories', refresh: refreshBookitCategories }
]

export default function BookitIntegLayout({
  formFields,
  bookitConf,
  setBookitConf,
  isLoading,
  setIsLoading
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi
  const mainAction = bookitConf?.mainAction

  const fetchListsFor = (action, conf) => {
    fetchedSelects.forEach(({ actions, optionsKey, refresh }) => {
      if (actions.includes(action) && !conf?.[optionsKey]) {
        refresh(setBookitConf, setIsLoading)
      }
    })
  }

  useEffect(() => {
    fetchListsFor(mainAction, bookitConf)
  }, [])

  const handleMainAction = value => {
    setBookitConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.bookitFields = fieldsByAction[value] || []
        draftConf.field_map = generateMappedField(draftConf.bookitFields)
        draftConf.utilities = {}
      })
    )

    fetchListsFor(value, bookitConf)
  }

  const setConfValue = (key, value) => {
    setBookitConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf[key] = value
      })
    )
  }

  const renderSelect = ({ label, confKey, options, refresh, refreshTip, multiple = false }) => (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{label}</b>
        <MultiSelect
          key={`${confKey}-${options.length}`}
          title={confKey}
          defaultValue={bookitConf?.[confKey] ?? null}
          className="btcd-paper-drpdwn w-5"
          options={options}
          onChange={val => setConfValue(confKey, val)}
          singleSelect={!multiple}
          closeOnSelect={!multiple}
        />
        {refresh && (
          <button
            onClick={() => refresh(setBookitConf, setIsLoading)}
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `'${refreshTip}'` }}
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

      {needsService.includes(mainAction) &&
        renderSelect({
          label: __('Service:', 'bit-integrations'),
          confKey: 'selectedService',
          options: bookitConf?.allServices || [],
          refresh: refreshBookitServices,
          refreshTip: __('Refresh Services', 'bit-integrations')
        })}

      {needsStaff.includes(mainAction) &&
        renderSelect({
          label: __('Staff Member:', 'bit-integrations'),
          confKey: 'selectedStaff',
          options: bookitConf?.allStaff || [],
          refresh: refreshBookitStaff,
          refreshTip: __('Refresh Staff Members', 'bit-integrations')
        })}

      {needsStatus.includes(mainAction) &&
        renderSelect({
          label: __('Status:', 'bit-integrations'),
          confKey: 'selectedStatus',
          options: appointmentStatusOptions
        })}

      {needsPaymentStatus.includes(mainAction) &&
        renderSelect({
          label: __('Payment Status:', 'bit-integrations'),
          confKey: 'selectedPaymentStatus',
          options: paymentStatusOptions
        })}

      {needsWeekdays.includes(mainAction) &&
        renderSelect({
          label: __('Weekdays:', 'bit-integrations'),
          confKey: 'selectedWeekdays',
          options: weekdayOptions,
          multiple: true
        })}

      {needsCategory.includes(mainAction) &&
        renderSelect({
          label: __('Category:', 'bit-integrations'),
          confKey: 'selectedCategory',
          options: bookitConf?.allCategories || [],
          refresh: refreshBookitCategories,
          refreshTip: __('Refresh Categories', 'bit-integrations')
        })}

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

      {mainAction && bookitConf.bookitFields && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          {(notesByAction[mainAction] || []).map(note => (
            <p key={note} className="mt-2 mb-1">
              {note}
            </p>
          ))}
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Bookit Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {bookitConf?.field_map?.map((itm, i) => (
            <BookitFieldMap
              key={`bookit-m-${i + 9}`}
              i={i}
              field={itm}
              bookitConf={bookitConf}
              formFields={formFields}
              setBookitConf={setBookitConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() => addFieldMap(bookitConf.field_map.length, bookitConf, setBookitConf)}
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
          <br />
        </div>
      )}

      {mainAction && utilitiesByAction[mainAction] && (
        <div className="mt-4">
          <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <BookitActions bookitConf={bookitConf} setBookitConf={setBookitConf} />
        </div>
      )}
    </>
  )
}
