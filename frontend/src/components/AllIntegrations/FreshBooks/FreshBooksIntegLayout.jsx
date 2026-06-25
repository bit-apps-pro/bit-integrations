import { __ } from '../../../Utils/i18nwrap'
import { handleInput } from './FreshBooksCommonFunc'
import FreshBooksFieldMap from './FreshBooksFieldMap'
import { actions, freshBooksStaticData } from './staticData'
import {
  addFieldMap,
  delFieldMap,
  handleCustomValue,
  handleFieldMapping
} from '../IntegrationHelpers/IntegrationHelpers'

export default function FreshBooksIntegLayout({
  formFields,
  freshBooksConf,
  setFreshBooksConf,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  const actionFields = freshBooksStaticData[freshBooksConf.mainAction] || []

  const setMainAction = val => {
    const newConf = { ...freshBooksConf }
    newConf.mainAction = val

    const requiredFields = actionFields.filter(f => f.required)
    newConf.field_map =
      requiredFields.length > 0
        ? requiredFields.map(f => ({ formField: '', freshBooksField: f.key }))
        : [{ formField: '', freshBooksField: '' }]

    setFreshBooksConf(newConf)
  }

  return (
    <>
      <br />
      <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
      <select
        onChange={e => setMainAction(e.target.value)}
        value={freshBooksConf.mainAction || ''}
        className="btcd-paper-inp w-5"
        disabled={isLoading}>
        <option value="">{__('Select Action', 'bit-integrations')}</option>
        {actions.map(action => (
          <option key={action.value} value={action.value}>
            {action.label}
          </option>
        ))}
      </select>

      {freshBooksConf.mainAction && freshBooksConf.mainAction.startsWith('update') && (
        <div className="mt-3">
          <b className="wdt-200 d-in-b">{__('Resource ID:', 'bit-integrations')}</b>
          <input
            className="btcd-paper-inp w-5"
            onChange={e => handleInput(e, freshBooksConf, setFreshBooksConf)}
            name={`${freshBooksConf.mainAction.replace('update', '').charAt(0).toLowerCase() + freshBooksConf.mainAction.replace('update', '').slice(1)}Id`}
            value={
              freshBooksConf[
                `${freshBooksConf.mainAction.replace('update', '').charAt(0).toLowerCase() + freshBooksConf.mainAction.replace('update', '').slice(1)}Id`
              ] || ''
            }
            type="text"
            placeholder={__('Resource ID...', 'bit-integrations')}
          />
        </div>
      )}

      {freshBooksConf.mainAction && freshBooksConf.mainAction.startsWith('delete') && (
        <div className="mt-3">
          <b className="wdt-200 d-in-b">{__('Resource ID:', 'bit-integrations')}</b>
          <input
            className="btcd-paper-inp w-5"
            onChange={e => handleInput(e, freshBooksConf, setFreshBooksConf)}
            name={`${freshBooksConf.mainAction.replace('delete', '').charAt(0).toLowerCase() + freshBooksConf.mainAction.replace('delete', '').slice(1)}Id`}
            value={
              freshBooksConf[
                `${freshBooksConf.mainAction.replace('delete', '').charAt(0).toLowerCase() + freshBooksConf.mainAction.replace('delete', '').slice(1)}Id`
              ] || ''
            }
            type="text"
            placeholder={__('Resource ID...', 'bit-integrations')}
          />
        </div>
      )}

      {freshBooksConf.mainAction && actionFields.length > 0 && (
        <>
          <div className="mt-4">
            <b className="wdt-100">{__('Field Map', 'bit-integrations')}</b>
          </div>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('FreshBooks Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {freshBooksConf.field_map.map((itm, i) => (
            <FreshBooksFieldMap
              key={`fb-m-${i + 9}`}
              i={i}
              field={itm}
              freshBooksConf={freshBooksConf}
              formFields={formFields}
              setFreshBooksConf={setFreshBooksConf}
              setSnackbar={setSnackbar}
              handleFieldMapping={handleFieldMapping}
              addFieldMap={addFieldMap}
              delFieldMap={delFieldMap}
              handleCustomValue={handleCustomValue}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(freshBooksConf.field_map.length, freshBooksConf, setFreshBooksConf, false)
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
        </>
      )}
      <br />
    </>
  )
}
