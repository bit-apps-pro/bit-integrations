/* eslint-disable no-unused-vars */
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { addFieldMap } from './IntegrationHelpers'
import LionDeskActions from './LionDeskActions'
import { getCustomFields } from './LionDeskCommonFunc'
import LionDeskFieldMap from './LionDeskFieldMap'

export default function LionDeskIntegLayout({
  formFields,
  handleInput,
  lionDeskConf,
  setLionDeskConf,
  loading,
  setLoading,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  const handleActionInput = e => {
    const newConf = { ...lionDeskConf }
    const { name } = e.target
    newConf.field_map = [{ formField: '', lionDeskFormField: '' }]

    if (e.target.value !== '') {
      newConf[name] = e.target.value
      if (e.target.value === 'contact') {
        getCustomFields(newConf, setLionDeskConf, setIsLoading)
      }
    } else {
      delete newConf[name]
    }
    setLionDeskConf({ ...newConf })
  }

  return (
    <>
      <br />

      <b className="wdt-200 d-in-b">{__('Select Action:', 'bit-integrations')}</b>
      <select
        onChange={handleActionInput}
        name="actionName"
        value={lionDeskConf.actionName}
        className="btcd-paper-inp w-5">
        <option value="">{__('Select an action', 'bit-integrations')}</option>
        <option value="contact" data-action_name="contact">
          {__('Create Contact', 'bit-integrations')}
        </option>
        <option value="campaign" data-action_name="campaign">
          {__('Create Campaign', 'bit-integrations')}
        </option>
      </select>
      {(loading.CRMPipelines || loading.CRMOwners || loading.CRMContacts) && (
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
      {lionDeskConf.actionName && !isLoading && (
        <div>
          <br />
          <div className="mt-5">
            <b className="wdt-100">{__('Field Map', 'bit-integrations')}</b>
            {lionDeskConf.actionName === 'contact' && (
              <button
                onClick={() => getCustomFields(lionDeskConf, setLionDeskConf, setIsLoading)}
                className="icn-btn sh-sm ml-2 mr-2 tooltip"
                style={{ '--tooltip-txt': `'${__('Refresh fields', 'bit-integrations')}'` }}
                type="button"
                disabled={loading.CRMPipelines}>
                &#x21BB;
              </button>
            )}
          </div>

          <br />
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('LionDesk Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {lionDeskConf?.field_map.map((itm, i) => (
            <LionDeskFieldMap
              key={`rp-m-${i + 9}`}
              i={i}
              field={itm}
              lionDeskConf={lionDeskConf}
              formFields={formFields}
              setLionDeskConf={setLionDeskConf}
              setSnackbar={setSnackbar}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(lionDeskConf.field_map.length, lionDeskConf, setLionDeskConf, false)
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
          <br />
          <br />
          <div className="mt-4">
            <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
          </div>
          <div className="btcd-hr mt-1" />
          <LionDeskActions
            lionDeskConf={lionDeskConf}
            setLionDeskConf={setLionDeskConf}
            formFields={formFields}
            loading={loading}
            setLoading={setLoading}
          />
        </div>
      )}
    </>
  )
}
