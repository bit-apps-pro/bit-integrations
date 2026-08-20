/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import toast from 'react-hot-toast'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate } from 'react-router'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import GetResponseAuthorization from './GetResponseAuthorization'
import { checkMappedFields, handleInput } from './GetResponseCommonFunc'
import GetResponseIntegLayout from './GetResponseIntegLayout'

function GetResponse({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({
    list: false,
    field: false,
    auth: false,
    tags: false,
    customFields: false
  })

  const [step, setstep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const contactsFields = [
    { key: 'email', label: __('Email', 'bit-integrations'), required: true },
    { key: 'name', label: __('Name', 'bit-integrations'), required: false }
  ]

  const [getResponseConf, setGetResponseConf] = useState({
    name: 'GetResponse',
    type: 'GetResponse',
    auth_token: '',
    field_map: [{ formField: '', getResponseFormField: '' }],
    contactsFields,
    campaignId: '',
    getResponseFields: [],
    campaigns: [],
    tags: [],
    selectedTags: [],
    actions: {}
  })

  const saveConfig = () => {
    setIsLoading(true)
    const resp = saveIntegConfig(
      flow,
      setFlow,
      allIntegURL,
      getResponseConf,
      navigate,
      '',
      '',
      setIsLoading
    )
    resp.then(res => {
      if (res.success) {
        toast.success(res.data?.msg)
        navigate(allIntegURL)
      } else {
        toast.error(res.data || res)
      }
    })
  }

  const nextPage = pageNo => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (!checkMappedFields(getResponseConf)) {
      toast.error(__('Please map mandatory fields', 'bit-integrations'))
      return
    }
    getResponseConf.field_map.length > 0 && setstep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <GetResponseAuthorization
        getResponseConf={getResponseConf}
        setGetResponseConf={setGetResponseConf}
        step={step}
        setstep={setstep}
        loading={loading}
        setLoading={setLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <GetResponseIntegLayout
          formFields={formFields}
          handleInput={e => handleInput(e, getResponseConf, setGetResponseConf, setLoading, setSnackbar)}
          getResponseConf={getResponseConf}
          setGetResponseConf={setGetResponseConf}
          loading={loading}
          setLoading={setLoading}
          setSnackbar={setSnackbar}
        />

        {getResponseConf?.campaignId && (
          <button
            onClick={() => nextPage(3)}
            disabled={!getResponseConf?.campaignId}
            className="btn f-right btcd-btn-lg purple sh-sm flx"
            type="button">
            {__('Next', 'bit-integrations')} &nbsp;
            <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
          </button>
        )}
      </div>

      {getResponseConf?.campaignId && (
        <IntegrationStepThree
          step={step}
          saveConfig={() => saveConfig()}
          isLoading={isLoading}
          dataConf={getResponseConf}
          setDataConf={setGetResponseConf}
          formFields={formFields}
        />
      )}
    </div>
  )
}

export default GetResponse
