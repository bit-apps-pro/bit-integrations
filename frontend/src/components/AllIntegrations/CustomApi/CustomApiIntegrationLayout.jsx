import React from 'react'
import { __ } from '../../../Utils/i18nwrap'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { deepCopy } from '../../../Utils/Helpers'
import { useEffect, useState } from 'react'
import { Panel, Tab, Tabs } from '@bumaga/tabs'
import BackIcn from '../../../Icons/BackIcn'
import bitsFetch from '../../../Utils/bitsFetch'
import Button from '../../Utilities/Button'
import LoaderSm from '../../Loaders/LoaderSm'
import Params from '../IntegrationHelpers/WebHook/Params'
import PathParams, { usePathParamsSync } from '../IntegrationHelpers/WebHook/PathParams'
import RequestHeaders from '../IntegrationHelpers/WebHook/RequestHeaders'
import Body from '../IntegrationHelpers/WebHook/Body'

const CustomApiIntegrationLayout = ({
  formID,
  formFields,
  customApiConf,
  setCustomApiConf,
  isInfo,
  create,
  step,
  setStep
}) => {
  const [tab, setTab] = useState(1)
  usePathParamsSync(customApiConf, setCustomApiConf, !isInfo)
  const actionMethods = [
    { value: 'GET', label: __('GET', 'bit-integrations') },
    { value: 'POST', label: __('POST', 'bit-integrations') },
    { value: 'PUT', label: __('PUT', 'bit-integrations') },
    { value: 'DELETE', label: __('DELETE', 'bit-integrations') },
    { value: 'PATCH', label: __('PATCH', 'bit-integrations') }
  ]

  const setValue = (val, name) => {
    const newConf = deepCopy(customApiConf)
    if (val) {
      newConf[name] = val
    } else {
      delete newConf[name]
    }
    setCustomApiConf({ ...newConf })
  }
  const handleInput = e => {
    const newConf = deepCopy(customApiConf)
    newConf[e.target.name] = e.target.value
    setCustomApiConf(newConf)
  }

  const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    setStep(3)
  }
  return (
    <>
      <br />
      <div className="d-flx">
        <b className="wdt-200 d-in-b mt-3">{__('Select Method:', 'bit-integrations')}</b>
        <MultiSelect
          defaultValue={customApiConf.actionMethod}
          className="btcd-paper-drpdwn w-5"
          singleSelect
          options={actionMethods}
          onChange={val => setValue(val, 'actionMethod')}
        />
      </div>
      <br />
      <div className="d-flx">
        <div className="wdt-200 d-in-b mt-3">
          <b>{__('Api endpoint:', 'bit-integrations')}</b>
        </div>
        <input
          className="btcd-paper-inp w-6 mt-1"
          onChange={handleInput}
          name="url"
          value={customApiConf.url}
          type="text"
          placeholder={__('api endpoint', 'bit-integrations')}
        />
      </div>
      <br />
      <br />
      <Tabs>
        <div className="flx mt-2">
          <Tab>
            <button className={`btcd-s-tab-link ${tab === 1 && 's-t-l-active'}`} type="button">
              {__('Params', 'bit-integrations')}
            </button>
          </Tab>
          <Tab>
            <button className={`btcd-s-tab-link ${tab === 2 && 's-t-l-active'}`} type="button">
              {__('Path Variables', 'bit-integrations')}
            </button>
          </Tab>
          <Tab>
            <button className={`btcd-s-tab-link ${tab === 3 && 's-t-l-active'}`} type="button">
              {__('Headers', 'bit-integrations')}
            </button>
          </Tab>
          <Tab>
            <button className={`btcd-s-tab-link ${tab === 4 && 's-t-l-active'}`} type="button">
              {__('Body', 'bit-integrations')}
            </button>
          </Tab>
        </div>
        <div className="btcd-hr" />
        <Panel>
          <Params
            webHooks={customApiConf}
            setWebHooks={setCustomApiConf}
            formFields={formFields}
            isInfo={isInfo}
            setTab={setTab}
          />
        </Panel>
        <Panel>
          <PathParams
            webHooks={customApiConf}
            setWebHooks={setCustomApiConf}
            isInfo={isInfo}
            setTab={setTab}
          />
        </Panel>
        <Panel>
          <RequestHeaders
            webHooks={customApiConf}
            setWebHooks={setCustomApiConf}
            formFields={formFields}
            isInfo={isInfo}
            setTab={setTab}
          />
        </Panel>
        <Panel>
          <Body
            webHooks={customApiConf}
            setWebHooks={setCustomApiConf}
            formFields={formFields}
            isInfo={isInfo}
            setTab={setTab}
          />
        </Panel>
      </Tabs>
    </>
  )
}

export default CustomApiIntegrationLayout
