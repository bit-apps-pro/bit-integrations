/* eslint-disable no-param-reassign */
/* eslint-disable no-console */

import { useEffect, useRef, useState } from 'react'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { $appConfigState, $formFields, $newFlow } from '../../GlobalStates'
import bitsFetch from '../../Utils/bitsFetch'
import CustomFetcherHelper, { useFetchCountdown } from '../../Utils/CustomFetcherHelper'
import { deepCopy } from '../../Utils/Helpers'
import { __ } from '../../Utils/i18nwrap'
import LoaderSm from '../Loaders/LoaderSm'
import CopyText from '../Utilities/CopyText'

function EditWebhookInteg({ setSnackbar }) {
  const [flow, setFlow] = useRecoilState($newFlow)
  const setFormFields = useSetRecoilState($formFields)
  const [isLoading, setIsLoading] = useState(false)
  const { api } = useRecoilValue($appConfigState)
  const hookID = flow.triggered_entity_id
  const isFetchingRef = useRef(false)

  let controller = new AbortController()
  const signal = controller.signal
  const { countdown, startCountdown, clearCountdown, formatTime } = useFetchCountdown()
  const { stopFetching: helperStop } = CustomFetcherHelper(
    isFetchingRef,
    hookID,
    controller,
    setIsLoading,
    'webhook/test/remove',
    'post',
    'hook_id'
  )
  const stopFetching = () => {
    clearCountdown()
    helperStop()
  }

  useEffect(() => {
    return () => {
      stopFetching()
    }
  }, [])

  const handleFetch = () => {
    if (isFetchingRef.current) {
      stopFetching()
      return
    }

    isFetchingRef.current = true
    setIsLoading(true)
    startCountdown(stopFetching)
    fetchSequentially()
  }

  const fetchSequentially = () => {
    try {
      if (!isFetchingRef.current || !hookID) {
        stopFetching()
        return
      }

      bitsFetch({ hook_id: hookID }, 'webhook/test', null, 'post', signal).then(resp => {
        if (!resp.success && isFetchingRef.current) {
          fetchSequentially()
          return
        }

        if (resp.success) {
          let data = resp.data.webhook
          if (typeof resp.data.webhook === 'object') {
            data = Object.keys(resp.data.webhook).map(fld => ({
              name: fld,
              label: `${resp.data.webhook[fld]}-${fld}`,
              type: 'text'
            }))
          }
          setFormFields(data)
          const newConf = deepCopy(flow)
          newConf.flow_details.fields = data
          setFlow(newConf)
        }

        stopFetching()
      })
    } catch (err) {
      console.log(
        err.name === 'AbortError' ? __('AbortError: Fetch request aborted', 'bit-integrations') : err
      )
    }
  }

  return (
    <div className="flx mt-3">
      <b className="wdt-200 d-in-b">{__('Webhook URL:', 'bit-integrations')}</b>
      <div className="w-5">
        <CopyText
          value={`${api}/callback/${hookID}`}
          className="field-key-cpy w-10 ml-0"
          setSnackbar={setSnackbar}
          readOnly
        />
        <button
          onClick={handleFetch}
          className="btn btcd-btn-lg purple sh-sm flx mt-1 ml-1"
          type="button">
          {isLoading
            ? `${__('Stop', 'bit-integrations')} (${formatTime(countdown)})`
            : flow.flow_details?.fields
              ? __('Fetched ✔', 'bit-integrations')
              : __('Fetch', 'bit-integrations')}
          {isLoading && <LoaderSm size="20" clr="#022217" className="ml-2" />}
        </button>
      </div>
    </div>
  )
}

export default EditWebhookInteg
