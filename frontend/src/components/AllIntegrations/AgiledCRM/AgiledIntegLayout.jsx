/* eslint-disable no-unused-vars */
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import AgiledActions from './AgiledActions'
import { getAllCRMPipelines, getAllCRMPipelineStages } from './AgiledCommonFunc'
import AgiledFieldMap from './AgiledFieldMap'
import { addFieldMap } from './IntegrationHelpers'
import 'react-multiple-select-dropdown-lite/dist/index.css'

export default function AgiledIntegLayout({
  formFields,
  handleInput,
  agiledConf,
  setAgiledConf,
  loading,
  setLoading,
  setSnackbar
}) {
  const handleActionInput = e => {
    const newConf = { ...agiledConf }
    newConf.field_map = [{ formField: '', agiledFormField: '' }]
    const { name } = e.target
    if (e.target.value !== '') {
      newConf[name] = e.target.value
      if (e.target.value === 'deal') {
        getAllCRMPipelines(newConf, setAgiledConf, loading, setLoading)
      }
    } else {
      delete newConf[name]
    }
    setAgiledConf({ ...newConf })
  }

  const setChanges = (val, name) => {
    const newConf = { ...agiledConf }
    newConf[name] = val
    if (name === 'selectedCRMPipeline' && val !== '') {
      newConf.selectedCRMPipelineStages = ''
      getAllCRMPipelineStages(newConf, setAgiledConf, loading, setLoading)
    }
    setAgiledConf({ ...newConf })
  }

  return (
    <>
      <br />

      <b className="wdt-200 d-in-b">{__('Select Action:', 'bit-integrations')}</b>
      <select
        onChange={handleActionInput}
        name="actionName"
        value={agiledConf.actionName}
        className="btcd-paper-inp w-5">
        <option value="">{__('Select an action', 'bit-integrations')}</option>
        <option value="account">{__('Create Account', 'bit-integrations')}</option>
        <option value="contact">{__('Create Contact', 'bit-integrations')}</option>
        <option value="deal">{__('Create Deal', 'bit-integrations')}</option>
      </select>
      {(loading.CRMPipelines || loading.CRMPipelineStages) && (
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
      {agiledConf.actionName === 'contact' && (
        <>
          <br />
          <br />
          <b className="wdt-200 d-in-b">{__('Select Role:', 'bit-integrations')}</b>
          <select
            onChange={handleInput}
            name="contactRole"
            value={agiledConf.contactRole}
            className="btcd-paper-inp w-5">
            <option value="">{__('Select a role', 'bit-integrations')}</option>
            <option value="Lead">{__('Lead', 'bit-integrations')}</option>
            <option value="Client">{__('Client', 'bit-integrations')}</option>
            <option value="Prospect">{__('Prospect', 'bit-integrations')}</option>
          </select>
        </>
      )}
      {agiledConf.actionName === 'deal' && (
        <>
          <br />
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Select Pipeline:', 'bit-integrations')}</b>
            <MultiSelect
              options={agiledConf?.CRMPipelines?.map(CRMPipeline => ({
                label: CRMPipeline.name,
                value: CRMPipeline.id
              }))}
              className="msl-wrp-options dropdown-custom-width"
              defaultValue={agiledConf?.selectedCRMPipeline}
              onChange={val => setChanges(val, 'selectedCRMPipeline')}
              disabled={loading.CRMPipelines}
              singleSelect
            />
            <button
              onClick={() => getAllCRMPipelines(agiledConf, setAgiledConf, loading, setLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh pipelines', 'bit-integrations')}'` }}
              type="button"
              disabled={loading.CRMPipelines}>
              &#x21BB;
            </button>
          </div>
        </>
      )}
      {agiledConf.actionName === 'deal' && agiledConf.selectedCRMPipeline && (
        <>
          <br />
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Select Stage:', 'bit-integrations')}</b>
            <MultiSelect
              options={agiledConf?.CRMPipelineStages?.map(CRMPipelineStage => ({
                label: CRMPipelineStage.name,
                value: CRMPipelineStage.id
              }))}
              className="msl-wrp-options dropdown-custom-width"
              defaultValue={agiledConf?.selectedCRMPipelineStages}
              onChange={val => setChanges(val, 'selectedCRMPipelineStages')}
              disabled={loading.CRMPipelineStages}
              singleSelect
            />
            <button
              onClick={() =>
                getAllCRMPipelineStages(agiledConf, setAgiledConf, loading, setLoading)
              }
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh pipeline stages', 'bit-integrations')}'` }}
              type="button"
              disabled={loading.CRMPipelineStages}>
              &#x21BB;
            </button>
          </div>
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
      {agiledConf.actionName && (
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
              <b>{__('Agiled Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {agiledConf?.field_map.map((itm, i) => (
            <AgiledFieldMap
              key={`rp-m-${i + 9}`}
              i={i}
              field={itm}
              agiledConf={agiledConf}
              formFields={formFields}
              setAgiledConf={setAgiledConf}
              setSnackbar={setSnackbar}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() => addFieldMap(agiledConf.field_map.length, agiledConf, setAgiledConf, false)}
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
          <AgiledActions
            agiledConf={agiledConf}
            setAgiledConf={setAgiledConf}
            formFields={formFields}
            loading={loading}
            setLoading={setLoading}
          />
        </div>
      )}
    </>
  )
}
