import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import {
  generateMappedField,
  refreshCalendars,
  refreshLegendItems
} from './WpSimpleBookingCalendarCommonFunc'
import WpSimpleBookingCalendarFieldMap from './WpSimpleBookingCalendarFieldMap'
import {
  modules,
  needsAnyLegendItem,
  needsCalendar,
  needsCopyCalendar,
  needsLegendDefaults,
  needsLegendItemByCalendar,
  needsVisibility,
  visibilityOptions,
  WpSimpleBookingCalendarStaticData,
  yesNoOptions
} from './staticData'

export default function WpSimpleBookingCalendarIntegLayout({
  formFields,
  wpSimpleBookingCalendarConf,
  setWpSimpleBookingCalendarConf,
  isLoading,
  setIsLoading
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const setConfValue = (key, value) => {
    setWpSimpleBookingCalendarConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf[key] = value
      })
    )
  }

  const handleMainAction = value => {
    setWpSimpleBookingCalendarConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.wpSimpleBookingCalendarFields = WpSimpleBookingCalendarStaticData[value] || []
        draftConf.field_map = generateMappedField(draftConf.wpSimpleBookingCalendarFields)
        delete draftConf.selectedCalendar
        delete draftConf.selectedLegendItem
        delete draftConf.selectedCopyCalendar
        delete draftConf.selectedVisibility
        delete draftConf.selectedIsDefault
        delete draftConf.allLegendItems
      })
    )

    if (needsCalendar.includes(value) || needsCopyCalendar.includes(value)) {
      refreshCalendars(setWpSimpleBookingCalendarConf, setIsLoading)
    }
    if (needsAnyLegendItem.includes(value)) {
      refreshLegendItems(setWpSimpleBookingCalendarConf, setIsLoading)
    }
  }

  const handleCalendarChange = value => {
    setWpSimpleBookingCalendarConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.selectedCalendar = value
        delete draftConf.selectedLegendItem
        draftConf.allLegendItems = []
      })
    )

    if (value && needsLegendItemByCalendar.includes(wpSimpleBookingCalendarConf?.mainAction)) {
      refreshLegendItems(setWpSimpleBookingCalendarConf, setIsLoading, value)
    }
  }

  const recordSelect = (label, confKey, optionSource, onChange, onRefresh) => (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{label}</b>
        <MultiSelect
          title={confKey}
          defaultValue={wpSimpleBookingCalendarConf?.[confKey] ?? null}
          className="btcd-paper-drpdwn w-5"
          options={(wpSimpleBookingCalendarConf?.[optionSource] ?? []).map(opt => ({
            label: opt.label,
            value: String(opt.value ?? '')
          }))}
          onChange={onChange}
          singleSelect
          closeOnSelect
        />
        <button
          onClick={onRefresh}
          className="icn-btn sh-sm ml-2 mr-2 tooltip"
          style={{ '--tooltip-txt': `'${__('Refresh', 'bit-integrations')}'` }}
          type="button"
          disabled={isLoading}>
          &#x21BB;
        </button>
      </div>
    </>
  )

  const staticSelect = (label, confKey, options) => (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{label}</b>
        <MultiSelect
          title={confKey}
          defaultValue={wpSimpleBookingCalendarConf?.[confKey] ?? null}
          className="btcd-paper-drpdwn w-5"
          options={options}
          onChange={val => setConfValue(confKey, val)}
          singleSelect
          closeOnSelect
        />
      </div>
    </>
  )

  const action = wpSimpleBookingCalendarConf?.mainAction

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="mainAction"
          defaultValue={wpSimpleBookingCalendarConf?.mainAction ?? null}
          className="mt-2 w-5"
          onChange={value => handleMainAction(value)}
          options={modules?.map(act => ({
            label: checkIsPro(isPro, act.is_pro) ? act.label : getProLabel(act.label),
            value: act.name,
            disabled: !checkIsPro(isPro, act.is_pro)
          }))}
          singleSelect
          closeOnSelect
        />
      </div>

      {needsCopyCalendar.includes(action) &&
        recordSelect(
          __('Copy Legend From (optional):', 'bit-integrations'),
          'selectedCopyCalendar',
          'allCalendars',
          val => setConfValue('selectedCopyCalendar', val),
          () => refreshCalendars(setWpSimpleBookingCalendarConf, setIsLoading)
        )}

      {needsCalendar.includes(action) &&
        recordSelect(
          __('Calendar:', 'bit-integrations'),
          'selectedCalendar',
          'allCalendars',
          handleCalendarChange,
          () => refreshCalendars(setWpSimpleBookingCalendarConf, setIsLoading)
        )}

      {needsLegendItemByCalendar.includes(action) &&
        wpSimpleBookingCalendarConf?.selectedCalendar &&
        recordSelect(
          __('Legend Item:', 'bit-integrations'),
          'selectedLegendItem',
          'allLegendItems',
          val => setConfValue('selectedLegendItem', val),
          () =>
            refreshLegendItems(
              setWpSimpleBookingCalendarConf,
              setIsLoading,
              wpSimpleBookingCalendarConf.selectedCalendar
            )
        )}

      {needsAnyLegendItem.includes(action) &&
        recordSelect(
          __('Legend Item (optional):', 'bit-integrations'),
          'selectedLegendItem',
          'allLegendItems',
          val => setConfValue('selectedLegendItem', val),
          () => refreshLegendItems(setWpSimpleBookingCalendarConf, setIsLoading)
        )}

      {needsVisibility.includes(action) &&
        staticSelect(__('Visibility:', 'bit-integrations'), 'selectedVisibility', visibilityOptions)}

      {needsLegendDefaults.includes(action) &&
        staticSelect(
          __('Visible (default: Yes):', 'bit-integrations'),
          'selectedVisibility',
          yesNoOptions
        )}
      {needsLegendDefaults.includes(action) &&
        staticSelect(
          __('Default Legend Item (default: No):', 'bit-integrations'),
          'selectedIsDefault',
          yesNoOptions
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

      {action && wpSimpleBookingCalendarConf?.wpSimpleBookingCalendarFields?.length > 0 && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('WP Simple Booking Calendar Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {wpSimpleBookingCalendarConf?.field_map?.map((itm, i) => (
            <WpSimpleBookingCalendarFieldMap
              key={`wpsbc-m-${i + 9}`}
              i={i}
              field={itm}
              wpSimpleBookingCalendarConf={wpSimpleBookingCalendarConf}
              formFields={formFields}
              setWpSimpleBookingCalendarConf={setWpSimpleBookingCalendarConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(
                  wpSimpleBookingCalendarConf.field_map.length,
                  wpSimpleBookingCalendarConf,
                  setWpSimpleBookingCalendarConf
                )
              }
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
