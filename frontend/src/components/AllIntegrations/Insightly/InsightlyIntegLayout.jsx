/* eslint-disable no-unused-vars */
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import InsightlyActions from './InsightlyActions'
import {
  getLeadStatuses,
  getLeadSources,
  getAllCRMPipelines,
  getAllCRMPipelineStages
} from './InsightlyCommonFunc'
import InsightlyFieldMap from './InsightlyFieldMap'
import { addFieldMap } from './IntegrationHelpers'
import 'react-multiple-select-dropdown-lite/dist/index.css'

export default function InsightlyIntegLayout({
  formFields,
  handleInput,
  insightlyConf,
  setInsightlyConf,
  loading,
  setLoading,
  setSnackbar
}) {
  const handleActionInput = e => {
    const newConf = { ...insightlyConf }
    newConf.field_map = [{ formField: '', insightlyFormField: '' }]
    const { name } = e.target
    if (e.target.value !== '') {
      newConf[name] = e.target.value
      if (e.target.value === 'opportunity' || e.target.value === 'project') {
        getAllCRMPipelines(newConf, setInsightlyConf, setLoading)
      } else if (e.target.value === 'lead') {
        getLeadStatuses(newConf, setInsightlyConf, setLoading)
        getLeadSources(newConf, setInsightlyConf, setLoading)
      }
    } else {
      delete newConf[name]
    }
    setInsightlyConf({ ...newConf })
  }

  const setChanges = (val, name) => {
    const newConf = { ...insightlyConf }
    newConf[name] = val
    if (name === 'selectedCRMPipeline' && val !== '') {
      newConf.selectedCRMPipelineStages = ''
      getAllCRMPipelineStages(newConf, setInsightlyConf, setLoading)
    }
    setInsightlyConf({ ...newConf })
  }

  return (
    <>
      <br />

      <b className="wdt-200 d-in-b">{__('Select Action:', 'bit-integrations')}</b>
      <select
        onChange={handleActionInput}
        name="actionName"
        value={insightlyConf.actionName}
        className="btcd-paper-inp w-5">
        <option value="">{__('Select an action', 'bit-integrations')}</option>
        <option value="organisation">{__('Create Organization', 'bit-integrations')}</option>
        <option value="contact">{__('Create Contact', 'bit-integrations')}</option>
        <option value="opportunity">{__('Create Opportunity', 'bit-integrations')}</option>
        <option value="task">{__('Create Task', 'bit-integrations')}</option>
        <option value="lead">{__('Create Lead', 'bit-integrations')}</option>
      </select>
      {(loading.CRMPipelines ||
        loading.CRMPipelineStages ||
        loading.LeadStatuses ||
        loading.LeadSources) && (
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
      {insightlyConf.actionName === 'lead' && (
        <>
          <br />
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Select Lead Status:', 'bit-integrations')}</b>
            <MultiSelect
              options={insightlyConf?.LeadStatuses?.map(LeadStatus => ({
                label: LeadStatus.name,
                value: LeadStatus.id
              }))}
              className="msl-wrp-options dropdown-custom-width"
              defaultValue={insightlyConf?.selectedLeadStatus}
              onChange={val => setChanges(val, 'selectedLeadStatus')}
              disabled={loading.LeadStatuses}
              singleSelect
            />
            <button
              onClick={() => getLeadStatuses(insightlyConf, setInsightlyConf, setLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh lead status', 'bit-integrations')}'` }}
              type="button"
              disabled={loading.LeadStatuses}>
              &#x21BB;
            </button>
          </div>

          <br />
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Select Lead Source:', 'bit-integrations')}</b>
            <MultiSelect
              options={insightlyConf?.LeadSources?.map(LeadSource => ({
                label: LeadSource.name,
                value: LeadSource.id
              }))}
              className="msl-wrp-options dropdown-custom-width"
              defaultValue={insightlyConf?.selectedLeadSource}
              onChange={val => setChanges(val, 'selectedLeadSource')}
              disabled={loading.LeadSources}
              singleSelect
            />
            <button
              onClick={() => getLeadSources(insightlyConf, setInsightlyConf, setLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh lead source', 'bit-integrations')}'` }}
              type="button"
              disabled={loading.LeadSources}>
              &#x21BB;
            </button>
          </div>
        </>
      )}
      {(insightlyConf.actionName === 'opportunity' || insightlyConf.actionName === 'project') && (
        <>
          <br />
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Select Pipeline:', 'bit-integrations')}</b>
            <MultiSelect
              options={insightlyConf?.CRMPipelines?.map(CRMPipeline => ({
                label: CRMPipeline.name,
                value: CRMPipeline.id
              }))}
              className="msl-wrp-options dropdown-custom-width"
              defaultValue={insightlyConf?.selectedCRMPipeline}
              onChange={val => setChanges(val, 'selectedCRMPipeline')}
              disabled={loading.CRMPipelines}
              singleSelect
            />
            <button
              onClick={() => getAllCRMPipelines(insightlyConf, setInsightlyConf, setLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh pipelines', 'bit-integrations')}'` }}
              type="button"
              disabled={loading.CRMPipelines}>
              &#x21BB;
            </button>
          </div>
        </>
      )}
      {(insightlyConf.actionName === 'opportunity' || insightlyConf.actionName === 'project') &&
        insightlyConf.selectedCRMPipeline && (
          <>
            <br />
            <br />
            <div className="flx">
              <b className="wdt-200 d-in-b">{__('Select Stage:', 'bit-integrations')}</b>
              <MultiSelect
                options={insightlyConf?.CRMPipelineStages?.filter(
                  CRMPipelineStage => CRMPipelineStage.pipeline_id == insightlyConf.selectedCRMPipeline
                ).map(CRMPipelineStage => ({
                  label: CRMPipelineStage.name,
                  value: CRMPipelineStage.id
                }))}
                className="msl-wrp-options dropdown-custom-width"
                defaultValue={insightlyConf?.selectedCRMPipelineStages}
                onChange={val => setChanges(val, 'selectedCRMPipelineStages')}
                disabled={loading.CRMPipelineStages}
                singleSelect
              />
              <button
                onClick={() => getAllCRMPipelineStages(insightlyConf, setInsightlyConf, setLoading)}
                className="icn-btn sh-sm ml-2 mr-2 tooltip"
                style={{
                  '--tooltip-txt': `'${__('Refresh pipeline stages', 'bit-integrations')}'`
                }}
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
      {insightlyConf.actionName && (
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
              <b>{__('Insightly Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {insightlyConf?.field_map.map((itm, i) => (
            <InsightlyFieldMap
              key={`rp-m-${i + 9}`}
              i={i}
              field={itm}
              insightlyConf={insightlyConf}
              formFields={formFields}
              setInsightlyConf={setInsightlyConf}
              setSnackbar={setSnackbar}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(insightlyConf.field_map.length, insightlyConf, setInsightlyConf, false)
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
          <InsightlyActions
            insightlyConf={insightlyConf}
            setInsightlyConf={setInsightlyConf}
            formFields={formFields}
            loading={loading}
            setLoading={setLoading}
          />
        </div>
      )}
    </>
  )
}
