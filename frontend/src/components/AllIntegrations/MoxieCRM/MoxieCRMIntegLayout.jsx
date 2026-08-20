/* eslint-disable no-unused-vars */
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import MoxieCRMActions from './MoxieCRMActions'
// import { getCustomFields } from './MoxieCRMCommonFunc'
import MoxieCRMFieldMap from './MoxieCRMFieldMap'
import { addFieldMap } from './IntegrationHelpers'
import 'react-multiple-select-dropdown-lite/dist/index.css'

export default function MoxieCRMIntegLayout({
  formFields,
  handleInput,
  moxiecrmConf,
  setMoxieCRMConf,
  loading,
  setLoading,
  setSnackbar
}) {
  const handleActionInput = e => {
    const newConf = { ...moxiecrmConf }
    newConf.field_map = [{ formField: '', moxiecrmFormField: '' }]
    const { name } = e.target
    if (e.target.value !== '') {
      newConf[name] = e.target.value
    } else {
      delete newConf[name]
    }
    setMoxieCRMConf({ ...newConf })
  }

  const setChanges = (val, name) => {
    const newConf = { ...moxiecrmConf }
    newConf[name] = val
    if (name === 'selectedCRMPeople' && val !== '' && moxiecrmConf.actionName === 'opportunity') {
      newConf.selectedCRMPipelines = ''
      getAllCRMPipelines(newConf, setMoxieCRMConf, setLoading)
    }
    setMoxieCRMConf({ ...newConf })
  }

  return (
    <>
      <br />

      <b className="wdt-200 d-in-b">{__('Select Action:', 'bit-integrations')}</b>
      <select
        onChange={handleActionInput}
        name="actionName"
        value={moxiecrmConf.actionName}
        className="btcd-paper-inp w-5">
        <option value="">{__('Select an action', 'bit-integrations')}</option>
        <option value="client">{__('Create Client', 'bit-integrations')}</option>
        <option value="contact">{__('Create Contact', 'bit-integrations')}</option>
        <option value="opportunity">{__('Create Opportunity', 'bit-integrations')}</option>
      </select>
      {moxiecrmConf.actionName === 'client' && (
        <>
          <br />
          <br />
          <b className="wdt-200 d-in-b">{__('Select Record Type:', 'bit-integrations')}</b>
          <select
            onChange={handleActionInput}
            name="recordType"
            value={moxiecrmConf.recordType}
            className="btcd-paper-inp w-5">
            <option value="Client">{__('Client', 'bit-integrations')}</option>
            <option value="Prospect">{__('Prospect', 'bit-integrations')}</option>
          </select>
        </>
      )}

      {loading.customFields && (
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
      {moxiecrmConf.actionName && (
        <div>
          <br />
          <div className="mt-5">
            <b className="wdt-100">{__('Field Map', 'bit-integrations')}</b>
          </div>

          <br />
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('MoxieCRM Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {moxiecrmConf?.field_map.map((itm, i) => (
            <MoxieCRMFieldMap
              key={`rp-m-${i + 9}`}
              i={i}
              field={itm}
              moxiecrmConf={moxiecrmConf}
              formFields={formFields}
              setMoxieCRMConf={setMoxieCRMConf}
              setSnackbar={setSnackbar}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(moxiecrmConf.field_map.length, moxiecrmConf, setMoxieCRMConf, false)
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
          <MoxieCRMActions
            moxiecrmConf={moxiecrmConf}
            setMoxieCRMConf={setMoxieCRMConf}
            formFields={formFields}
            loading={loading}
            setLoading={setLoading}
          />
        </div>
      )}
    </>
  )
}
