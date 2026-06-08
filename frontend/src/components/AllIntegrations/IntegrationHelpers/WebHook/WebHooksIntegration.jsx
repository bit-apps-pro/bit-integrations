import { useEffect, useState } from 'react'
import { Panel, Tab, Tabs } from '@bumaga/tabs'
import BackIcn from '../../../../Icons/BackIcn'
import bitsFetch from '../../../../Utils/bitsFetch'
import { __ } from '../../../../Utils/i18nwrap'
import Button from '../../../Utilities/Button'
import LoaderSm from '../../../Loaders/LoaderSm'
import Params from './Params'
import RequestHeaders from './RequestHeaders'
import Body from './Body'
import TableCheckBox from '../../../Utilities/TableCheckBox'
import ConditionalLogic from '../../../ConditionalLogic'
import Note from '../../../Utilities/Note'
import TutorialLink from '../../../Utilities/TutorialLink'

export default function WebHooksIntegration({
  formFields,
  webHooks,
  setWebHooks,
  setStep,
  setSnackbar,
  create,
  isInfo
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [tab, setTab] = useState(1)
  const method = ['GET', 'POST', 'PUT', 'PATCH', 'OPTION', 'DELETE', 'TRACE', 'CONNECT']
  const handleInput = e => {
    const tmpConfConf = { ...webHooks }
    tmpConfConf[e.target.name] = e.target.value
    setWebHooks({ ...tmpConfConf })
  }
  const testWebHook = webHooksDetails => {
    setIsLoading(true)
    bitsFetch({ hookDetails: webHooksDetails }, 'test_webhook').then(response => {
      if (response && response.success) {
        setSnackbar({ show: true, msg: `${response.data}` })
        setIsLoading(false)
      } else if (response && response.data) {
        const msg = typeof response.data === 'string' ? response.data : 'Unknown error'
        setSnackbar({ show: true, msg: `${msg}. ${__('please try again', 'bit-integrations')}` })
        setIsLoading(false)
      } else {
        setSnackbar({
          show: true,
          msg: __('Webhook tests failed. please try again', 'bit-integrations')
        })
        setIsLoading(false)
      }
    })
  }

  useEffect(() => {
    if (webHooks && !webHooks?.condition) {
      const tmpConf = { ...webHooks }
      tmpConf.condition = {
        action_behavior: '',
        actions: [{ field: '', action: 'value' }],
        logics: [{ field: '', logic: '', val: '' }, 'or', { field: '', logic: '', val: '' }]
      }
      setWebHooks(tmpConf)
    }
  }, [])

  const checkedCondition = (val, checked) => {
    const tmpConf = { ...webHooks }
    if (checked) {
      tmpConf.condition.action_behavior = val
    } else {
      tmpConf.condition.action_behavior = ''
    }
    setWebHooks(tmpConf)
  }

  const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    setStep(2)
  }

  const info = `${__(
    'You can test any kind of webhook using',
    'bit-integrations'
  )} <a href="https://app.webhook.is/test" target="_blank" rel="noreferrer">${__(
    'app.webhook.is',
    'bit-integrations'
  )}</a>`

  return (
    <div style={{ ...{ width: isInfo && 900 } }}>
      <TutorialLink linkKey="webHooksLinks" />
      <div className="flx ">
        <div className="w-8 mr-2 mt-2 mb-4">
          <div className="f-m">{__('Integration Name', 'bit-integrations')}</div>
          <input
            name="name"
            onChange={e => handleInput(e, webHooks, setWebHooks)}
            className="btcd-paper-inp mt-1"
            type="text"
            value={webHooks.name}
            disabled={isInfo}
          />
        </div>
      </div>

      <div className="flx">
        <div className="w-5 mr-2 ">
          <div className="f-m">{__('Link:', 'bit-integrations')}</div>
          <input
            name="url"
            onChange={e => handleInput(e, webHooks, setWebHooks)}
            className="btcd-paper-inp mt-1"
            type="text"
            value={webHooks.url}
            disabled={isInfo}
          />
        </div>
        <div className="w-3">
          <div className="f-m">{__('Method:', 'bit-integrations')}</div>
          <select
            name="method"
            onChange={e => handleInput(e, webHooks, setWebHooks)}
            defaultValue={webHooks.method}
            className="btcd-paper-inp mt-1"
            disabled={isInfo}>
            {method.map((itm, indx) => (
              <option key={`method-${indx * 2}`} value={itm}>
                {itm}
              </option>
            ))}
          </select>
        </div>
      </div>
      {webHooks?.apiConsole && (
        <small className="d-blk mt-2">
          {__('To got Webhook , Please Visit', 'bit-integrations')}{' '}
          <a className="btcd-link" href={webHooks.apiConsole} target="_blank" rel="noreferrer">
            {__(`${webHooks.type} Dashboard`, 'bit-integrations')}
          </a>
        </small>
      )}
      {!isInfo && (
        <>
          <Button
            onClick={() => testWebHook(webHooks, setIsLoading, setSnackbar)}
            className="btn btcd-btn-o-purple">
            {__('Test Webhook', 'bit-integrations')}
            {isLoading && <LoaderSm size={14} clr="#022217" className="ml-2" />}
          </Button>

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
                  {__('Headers', 'bit-integrations')}
                </button>
              </Tab>
              <Tab>
                <button className={`btcd-s-tab-link ${tab === 3 && 's-t-l-active'}`} type="button">
                  {__('Body', 'bit-integrations')}
                </button>
              </Tab>
            </div>
            <div className="btcd-hr" />
            <Panel>
              <Params
                webHooks={webHooks}
                setWebHooks={setWebHooks}
                formFields={formFields}
                isInfo={isInfo}
                setTab={setTab}
              />
            </Panel>
            <Panel>
              <RequestHeaders
                webHooks={webHooks}
                setWebHooks={setWebHooks}
                formFields={formFields}
                isInfo={isInfo}
                setTab={setTab}
              />
            </Panel>
            <Panel>
              <Body
                webHooks={webHooks}
                setWebHooks={setWebHooks}
                formFields={formFields}
                isInfo={isInfo}
                setTab={setTab}
              />
            </Panel>
          </Tabs>

          {webHooks?.condition && (
            <>
              <div className="flx">
                <TableCheckBox
                  onChange={e => checkedCondition(e.target.value, e.target.checked)}
                  checked={webHooks?.condition?.action_behavior === 'cond'}
                  className="wdt-200 mt-4 mr-2"
                  value="cond"
                  title={__('Conditional Logics', 'bit_integration')}
                  isInfo={isInfo}
                />
              </div>
              <br />
              {webHooks?.condition?.action_behavior === 'cond' && (
                <ConditionalLogic
                  formFields={formFields}
                  dataConf={webHooks}
                  setDataConf={setWebHooks}
                />
              )}
            </>
          )}
          {create && (
            <button
              onClick={() => nextPage()}
              className="btn btcd-btn-lg purple sh-sm flx"
              type="button">
              {__('Next', 'bit-integrations')}
              <BackIcn className="ml-1 rev-icn" />
            </button>
          )}
          <Note note={info} />
        </>
      )}
    </div>
  )
}
