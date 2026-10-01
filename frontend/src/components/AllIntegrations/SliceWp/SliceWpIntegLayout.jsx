import { useEffect } from 'react'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import SliceWpActions from './SliceWpActions'
import {} from './SliceWpCommonFunc'
import SliceWpFieldMap from './SliceWpFieldMap'
import Note from '../../Utilities/Note'
import UserEmailFieldMap from '../IntegrationHelpers/UserEmailFieldMap'
import UserSourceSelect from '../IntegrationHelpers/UserSourceSelect'

export default function SliceWpIntegLayout({
  formFields,
  handleInput,
  sliceWpConf,
  setSliceWpConf,
  isLoading,
  setIsLoading,
  setSnackbar,
  allIntegURL,
  isInfo,
  edit
}) {
  return (
    <>
      <br />
      <b className="wdt-200 d-in-b">{__('Actions:', 'bit-integrations')}</b>
      <select
        onChange={handleInput}
        name="mainAction"
        value={sliceWpConf?.mainAction}
        className="btcd-paper-inp w-5">
        <option value="">{__('Select Actions', 'bit-integrations')}</option>
        {sliceWpConf?.allActions &&
          sliceWpConf.allActions.map(({ key, label }) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
      </select>
      <br />
      <br />
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

      <>
        {['1'].includes(sliceWpConf?.mainAction) && (
          <>
            <div className="mt-4">
              <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
            </div>
            <div className="btcd-hr mt-1" />
            <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
              <div className="txt-dp">
                <b>{__('Form Fields', 'bit-integrations')}</b>
              </div>
              <div className="txt-dp">
                <b>{__('SliceWp Fields', 'bit-integrations')}</b>
              </div>
            </div>
            {sliceWpConf.field_map.map((itm, i) => (
              <SliceWpFieldMap
                key={`dash-m-${i + 9}`}
                i={i}
                field={itm}
                sliceWpConf={sliceWpConf}
                formFields={formFields}
                setSliceWpConf={setSliceWpConf}
              />
            ))}
            <div className="txt-center btcbi-field-map-button mt-2">
              <button
                onClick={() => addFieldMap(sliceWpConf.field_map.length, sliceWpConf, setSliceWpConf)}
                className="icn-btn sh-sm"
                type="button">
                +
              </button>
            </div>
          </>
        )}
        <br />
        <br />
        {sliceWpConf.mainAction === '1' && (
          <>
            <div className="mt-4">
              <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
            </div>
            <div className="btcd-hr mt-1" />
            <SliceWpActions
              sliceWpConf={sliceWpConf}
              setSliceWpConf={setSliceWpConf}
              formFields={formFields}
            />
          </>
        )}
        {sliceWpConf.mainAction === '1' && (
          <>
            <br />
            <UserSourceSelect conf={sliceWpConf} setConf={setSliceWpConf} />
            {sliceWpConf?.userSource === 'email' && (
              <UserEmailFieldMap
                conf={sliceWpConf}
                setConf={setSliceWpConf}
                formFields={formFields}
                actionLabel={__('SliceWp Fields', 'bit-integrations')}
              />
            )}
          </>
        )}
      </>
      <br />
      {sliceWpConf?.userSource === 'email' ? (
        <Note
          note={__(
            'This action runs for the user matching the mapped email. The user must already exist on your site, otherwise the action fails.',
            'bit-integrations'
          )}
        />
      ) : (
        <Note note={__('Some integrations will only work for logged-in users.', 'bit-integrations')} />
      )}
    </>
  )
}
