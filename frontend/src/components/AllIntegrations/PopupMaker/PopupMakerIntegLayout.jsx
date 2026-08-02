import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import PopupMakerActions from './PopupMakerActions'
import {
  generateMappedField,
  refreshPopupMakerPopups,
  refreshPopupMakerThemes
} from './PopupMakerCommonFunc'
import PopupMakerFieldMap from './PopupMakerFieldMap'
import {
  changeStatusOptions,
  eventOptions,
  hasUtilities,
  modules,
  needsEvent,
  needsPopup,
  needsStatus,
  needsTheme,
  PopupFields,
  PopupIdField,
  PopupUpdateFields,
  SubscriberFields,
  SubscriberIdField,
  SubscriberUpdateFields
} from './staticData'

export default function PopupMakerIntegLayout({
  formID,
  formFields,
  popupMakerConf,
  setPopupMakerConf,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const setField = (key, val) =>
    setPopupMakerConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf[key] = val
      })
    )

  const handleMainAction = value => {
    setPopupMakerConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value

        switch (value) {
          case 'create_popup':
            draftConf.popupMakerFields = PopupFields
            break
          case 'update_popup':
            draftConf.popupMakerFields = PopupUpdateFields
            break
          case 'delete_popup':
          case 'change_popup_status':
          case 'reset_popup_counts':
          case 'track_popup_event':
            draftConf.popupMakerFields = PopupIdField
            break
          case 'create_subscriber':
            draftConf.popupMakerFields = SubscriberFields
            break
          case 'update_subscriber':
            draftConf.popupMakerFields = SubscriberUpdateFields
            break
          case 'delete_subscriber':
            draftConf.popupMakerFields = SubscriberIdField
            break
          default:
            draftConf.popupMakerFields = []
        }

        draftConf.field_map = generateMappedField(draftConf.popupMakerFields)
      })
    )

    // The refresh buttons cover re-fetching, so only load a list we do not have yet.
    if (needsTheme.includes(value) && !popupMakerConf?.allThemes?.length) {
      refreshPopupMakerThemes(setPopupMakerConf, setIsLoading)
    }

    if (needsPopup.includes(value) && !popupMakerConf?.allPopups?.length) {
      refreshPopupMakerPopups(setPopupMakerConf, setIsLoading)
    }
  }

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="mainAction"
          defaultValue={popupMakerConf?.mainAction ?? null}
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

      {needsStatus.includes(popupMakerConf?.mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Status:', 'bit-integrations')}</b>
            <MultiSelect
              title="selectedStatus"
              defaultValue={popupMakerConf?.selectedStatus ?? null}
              className="btcd-paper-drpdwn w-5"
              options={changeStatusOptions}
              onChange={val => setField('selectedStatus', val)}
              singleSelect
              closeOnSelect
            />
          </div>
        </>
      )}

      {needsEvent.includes(popupMakerConf?.mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Event:', 'bit-integrations')}</b>
            <MultiSelect
              title="selectedEvent"
              defaultValue={popupMakerConf?.selectedEvent ?? null}
              className="btcd-paper-drpdwn w-5"
              options={eventOptions}
              onChange={val => setField('selectedEvent', val)}
              singleSelect
              closeOnSelect
            />
          </div>
        </>
      )}

      {needsTheme.includes(popupMakerConf?.mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Popup Theme:', 'bit-integrations')}</b>
            <MultiSelect
              title="selectedTheme"
              defaultValue={popupMakerConf?.selectedTheme ?? null}
              className="btcd-paper-drpdwn w-5"
              options={
                popupMakerConf?.allThemes &&
                Array.isArray(popupMakerConf.allThemes) &&
                popupMakerConf.allThemes.map(theme => ({
                  label: theme.title,
                  value: theme.id.toString()
                }))
              }
              onChange={val => setField('selectedTheme', val)}
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() => refreshPopupMakerThemes(setPopupMakerConf, setIsLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Themes', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
        </>
      )}

      {needsPopup.includes(popupMakerConf?.mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Popup:', 'bit-integrations')}</b>
            <MultiSelect
              title="selectedPopup"
              defaultValue={popupMakerConf?.selectedPopup ?? null}
              className="btcd-paper-drpdwn w-5"
              options={
                popupMakerConf?.allPopups &&
                Array.isArray(popupMakerConf.allPopups) &&
                popupMakerConf.allPopups.map(popup => ({
                  label: popup.title,
                  value: popup.id.toString()
                }))
              }
              onChange={val => setField('selectedPopup', val)}
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() => refreshPopupMakerPopups(setPopupMakerConf, setIsLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Popups', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
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

      {popupMakerConf?.mainAction && popupMakerConf.popupMakerFields && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Popup Maker Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {popupMakerConf?.field_map?.map((itm, i) => (
            <PopupMakerFieldMap
              key={`popup-maker-m-${i + 9}`}
              i={i}
              field={itm}
              popupMakerConf={popupMakerConf}
              formFields={formFields}
              setPopupMakerConf={setPopupMakerConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(popupMakerConf.field_map.length, popupMakerConf, setPopupMakerConf)
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
          <br />
        </div>
      )}

      {popupMakerConf?.mainAction &&
        popupMakerConf.popupMakerFields &&
        hasUtilities.includes(popupMakerConf?.mainAction) && (
          <div className="mt-4">
            <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
            <div className="btcd-hr mt-1" />
            <PopupMakerActions popupMakerConf={popupMakerConf} setPopupMakerConf={setPopupMakerConf} />
          </div>
        )}
    </>
  )
}
