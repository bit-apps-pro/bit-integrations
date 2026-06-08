/* eslint-disable react/button-has-type */
/* eslint-disable no-console */
import { useEffect, useRef, useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { $appConfigState, $flowStep, $formFields, $newFlow } from '../../GlobalStates'
import bitsFetch from '../../Utils/bitsFetch'
import { __ } from '../../Utils/i18nwrap'
import LoaderSm from '../Loaders/LoaderSm'
import CopyText from '../Utilities/CopyText'
import SnackMsg from '../Utilities/SnackMsg'
import WebhookDataTable from '../Utilities/WebhookDataTable'
import EyeIcn from '../Utilities/EyeIcn'
import EyeOffIcn from '../Utilities/EyeOffIcn'
import Note from '../Utilities/Note'
import { APP_CONFIG } from '../../config/app'
import TutorialLink from '../Utilities/TutorialLink'

const Webhook = () => {
  const [newFlow, setNewFlow] = useRecoilState($newFlow)
  const setFlowStep = useSetRecoilState($flowStep)
  const setFields = useSetRecoilState($formFields)
  const [hookID, setHookID] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [snack, setSnackbar] = useState({ show: false })
  const { api } = useRecoilValue($appConfigState)
  const [showResponse, setShowResponse] = useState(false)
  const intervalRef = useRef(null)
  const triggerLinkKey = newFlow?.triggered_entity
  const triggerTutorialLinks = triggerLinkKey
    ? {
        [triggerLinkKey]: {
          docLink: newFlow?.triggerDetail?.documentation_url || '',
          youTubeLink: newFlow?.triggerDetail?.tutorial_url || ''
        }
      }
    : undefined
  let controller = new AbortController()
  const signal = controller.signal
  const setTriggerData = () => {
    const tmpNewFlow = { ...newFlow }
    tmpNewFlow.triggerData = {
      formID: hookID,
      fields: tmpNewFlow.triggerDetail.data
    }
    tmpNewFlow.triggered_entity_id = hookID
    setFields(tmpNewFlow.triggerDetail.data)
    setNewFlow(tmpNewFlow)
    setFlowStep(2)
  }
  useEffect(() => {
    if (newFlow.triggerDetail?.data?.length > 0 && newFlow.triggerDetail?.hook_id) {
      setHookID(newFlow.triggerDetail?.hook_id)
      window.hook_id = newFlow.triggerDetail?.hook_id
    } else {
      bitsFetch({ hook_id: hookID }, 'webhook/new', null, 'get').then(resp => {
        if (resp.success) {
          setHookID(resp.data.hook_id)
          window.hook_id = resp.data.hook_id
        }
      })
    }
    return () => {
      intervalRef?.current && clearInterval(intervalRef.current)
      controller.abort()
      bitsFetch({ hook_id: window.hook_id }, 'webhook/test/remove').then(resp => {
        delete window.hook_id
      })
    }
  }, [])

  const handleFetch = () => {
    setIsLoading(true)
    intervalRef.current = setInterval(() => {
      bitsFetch({ hook_id: hookID }, 'webhook/test', null, 'post', signal)
        .then(resp => {
          if (resp.success) {
            controller.abort()
            clearInterval(intervalRef.current)
            const tmpNewFlow = { ...newFlow }
            const data = resp.data.webhook

            let convertedData = Object.entries(data).reduce((outObj, item) => {
              const [name, obj] = item
              if (typeof obj === 'object' && obj !== null && obj !== undefined) {
                const objArr = Object.entries(obj)
                const inObj = objArr.reduce((out, [n, v]) => {
                  const propName = `${name}_${n}`

                  return { ...out, [propName]: v }
                }, {})
                return { ...outObj, ...inObj }
              }
              return data
            }, {})

            if (typeof resp.data.webhook === 'object') {
              convertedData = Object.keys(convertedData).map(fld => ({
                name: fld,
                label: `${convertedData[fld]}-${fld}`,
                type: 'text'
              }))
            }

            tmpNewFlow.triggerDetail.tmp = resp.data.webhook
            tmpNewFlow.triggerDetail.data = convertedData
            tmpNewFlow.triggerDetail.hook_id = hookID
            setNewFlow(tmpNewFlow)
            setIsLoading(false)
            setShowResponse(true)
            bitsFetch({ hook_id: window.hook_id, reset: true }, 'webhook/test/remove', null, 'post')
          }
        })
        .catch(err => {
          if (err.name === 'AbortError') {
            console.log(__('AbortError: Fetch request aborted', 'bit-integrations'))
          }
        })
    }, 1500)
  }

  const showResponseTable = () => {
    setShowResponse(prevState => !prevState)
  }

  return (
    <div className="trigger-webhook-width">
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="mt-3">
        <b>{__('Webhook URL:', 'bit-integrations')}</b>
      </div>
      <CopyText
        value={`${api}/callback/${hookID}`}
        className="field-key-cpy w-10 ml-0"
        setSnackbar={setSnackbar}
        readOnly
      />
      <div className="flx flx-between">
        <button
          onClick={handleFetch}
          className="btn btcd-btn-lg purple sh-sm flx"
          type="button"
          disabled={!hookID}>
          {newFlow.triggerDetail?.data
            ? __('Fetched ✔', 'bit-integrations')
            : __('Fetch', 'bit-integrations')}
          {isLoading && <LoaderSm size="20" clr="#022217" className="ml-2" />}
        </button>
        {newFlow.triggerDetail?.data && (
          <button onClick={showResponseTable} className="btn btcd-btn-lg sh-sm flx">
            <span className="txt-webhook-resbtn font-inter-500">
              {showResponse
                ? __('Hide Response', 'bit-integrations')
                : __('View Response', 'bit-integrations')}
            </span>
            {!showResponse ? (
              <EyeIcn width="20" height="20" strokeColor="#000000" />
            ) : (
              <EyeOffIcn width="20" height="20" strokeColor="#000000" />
            )}
          </button>
        )}
      </div>
      {showResponse && (
        <WebhookDataTable data={newFlow?.triggerDetail?.data} flow={newFlow} setFlow={setNewFlow} />
      )}
      <button
        onClick={setTriggerData}
        className="btn btcd-btn-lg purple sh-sm flx"
        type="button"
        disabled={!newFlow.triggerDetail?.data}>
        {__('Set Action', 'bit-integrations')}
      </button>
      <div className="flx flx-center">
        <div style={{ width: '100%', maxWidth: 500 }}>
          <Note note={info} isInstruction={true} maxWidth="100%">
            <TutorialLink
              linkKey={triggerLinkKey}
              linksMap={triggerTutorialLinks}
              style={{ marginTop: 0 }}
            />
          </Note>
        </div>
      </div>
    </div>
  )
}
export default Webhook

const info = `${__(
  'You can test this webhook with',
  'bit-integrations'
)} <a href="https://webhook.is/" target="_blank" rel="noreferrer">${__(
  'webhook.is',
  'bit-integrations'
)}</a>
            <h4>${__('Quick Setup', 'bit-integrations')}</h4>
            <ul>
                <li>${__(
                  'Copy the Webhook URL and add it to your form or app.',
                  'bit-integrations'
                )}</li>
                <li>${__(
                  'Click <b>Fetch</b>, then submit your form (or send a test request).',
                  'bit-integrations'
                )}</li>
                <li>${__(
                  'When response data appears, click <b>Set Action</b> to continue.',
                  'bit-integrations'
                )}</li>
            </ul>
            <p><b>${__('Important', 'bit-integrations')}:</b> ${__(
              'The Fetch button will keep spinning until you submit the form/task.',
              'bit-integrations'
            )}</p>
  `
