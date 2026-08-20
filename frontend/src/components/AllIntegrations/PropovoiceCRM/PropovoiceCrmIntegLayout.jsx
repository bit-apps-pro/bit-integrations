import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useEffect, useState } from 'react'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { addFieldMap } from '../GlobalIntegrationHelper'
import TableCheckBox from '../../Utilities/TableCheckBox'
import { getAllLeadLabel, getAllLeadTags } from './PropovoiceCrmCommonFunc'
import PropovoiceCrmFieldMap from './PropovoiceCrmFieldMap'
import PropovoiceCrmActions from './PropovoiceCrmAction'

export default function PropovoiceCrmIntegLayout({
  formID,
  formFields,
  handleInput,
  propovoiceCrmConf,
  setPropovoiceCrmConf,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  const inputHandler = e => {
    const newConf = { ...propovoiceCrmConf }
    const { name } = e.target
    if (e.target.value !== '') {
      newConf[name] = e.target.value
    } else {
      delete newConf[name]
    }
    newConf[e.target.name] = e.target.value
    setPropovoiceCrmConf({ ...newConf })
  }

  // useEffect(() => {
  //   if (propovoiceCrmConf?.mainAction === '1') {
  //     getAllLeadLabel(propovoiceCrmConf, setPropovoiceCrmConf, isLoading, setIsLoading)
  //     getAllLeadTags(propovoiceCrmConf, setPropovoiceCrmConf, isLoading, setIsLoading)
  //   }
  // }, [propovoiceCrmConf?.mainAction === '1'])

  return (
    <>
      <br />
      <b className="wdt-200 d-in-b">{__('Actions:', 'bit-integrations')}</b>
      <select
        onChange={inputHandler}
        name="mainAction"
        value={propovoiceCrmConf?.mainAction}
        className="btcd-paper-inp w-5">
        <option value="">{__('Select Actions', 'bit-integrations')}</option>
        {propovoiceCrmConf?.allActions &&
          propovoiceCrmConf.allActions.map(({ key, label }) => (
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
      {propovoiceCrmConf.mainAction && !isLoading && (
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
              <b>{__('Propovice CRM Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {propovoiceCrmConf.field_map.map((itm, i) => (
            <PropovoiceCrmFieldMap
              key={`keap-m-${i + 9}`}
              i={i}
              field={itm}
              formFields={formFields}
              propovoiceCrmConf={propovoiceCrmConf}
              setPropovoiceCrmConf={setPropovoiceCrmConf}
            />
          ))}
          <br />
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(propovoiceCrmConf.field_map.length, propovoiceCrmConf, setPropovoiceCrmConf)
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
        </>
      )}
      <div className="mt-4">
        <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
      </div>
      <div className="btcd-hr mt-1" />
      <PropovoiceCrmActions
        propovoiceCrmConf={propovoiceCrmConf}
        setPropovoiceCrmConf={setPropovoiceCrmConf}
        formFields={formFields}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
    </>
  )
}
