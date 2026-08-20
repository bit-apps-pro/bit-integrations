/* eslint-disable no-console */
/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate } from 'react-router'
import toast from 'react-hot-toast'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import HubspotAuthorization from './HubspotAuthorization'
import HubspotIntegLayout from './HubspotIntegLayout'
import { checkMappedFields, handleInput } from './HubspotCommonFunc'

function Hubspot({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setstep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [loading, setLoading] = useState({
    auth: false,
    customFields: false,
    hubSpotFields: false
  })

  const [hubspotConf, setHubspotConf] = useState({
    name: 'Hubspot',
    type: 'Hubspot',
    api_key: '',
    field_map: [{ formField: '', hubspotField: '' }],
    hubSpotFields: [],
    actions: {}
  })

  const saveConfig = () => {
    setIsLoading(true)
    saveActionConf({
      flow,
      setFlow,
      allIntegURL,
      conf: hubspotConf,
      navigate,
      setIsLoading,
      setSnackbar
    })
  }

  const nextPage = pageNo => {
    if (!checkMappedFields(hubspotConf)) {
      toast.error(__('Please map mandatory fields', 'bit-integrations'))
      return
    }

    if (hubspotConf.actionName === 'ticket') {
      if (hubspotConf.pipeline === undefined) {
        toast.error(__('Please select a pipeline', 'bit-integrations'))
        return
      }
      if (hubspotConf.stage === undefined) {
        toast.error(__('Please select a stage', 'bit-integrations'))
        return
      }
    }

    hubspotConf.field_map.length > 0 && setstep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <HubspotAuthorization
        hubspotConf={hubspotConf}
        setHubspotConf={setHubspotConf}
        step={step}
        setstep={setstep}
        loading={loading}
        setLoading={setLoading}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <HubspotIntegLayout
          formFields={formFields}
          handleInput={e => handleInput(e, hubspotConf, setHubspotConf, setIsLoading, setSnackbar)}
          hubspotConf={hubspotConf}
          setHubspotConf={setHubspotConf}
          setSnackbar={setSnackbar}
          loading={loading}
          setLoading={setLoading}
        />

        {loading.hubSpotFields && (
          <button
            onClick={() => nextPage(3)}
            disabled={!checkMappedFields(hubspotConf)}
            className="btn f-right btcd-btn-lg purple sh-sm flx"
            type="button">
            {__('Next', 'bit-integrations')} &nbsp;
            <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
          </button>
        )}
      </div>

      {loading.hubSpotFields && (
        <IntegrationStepThree
          step={step}
          saveConfig={() => saveConfig()}
          isLoading={isLoading}
          dataConf={hubspotConf}
          setDataConf={setHubspotConf}
          formFields={formFields}
        />
      )}
    </div>
  )
}

export default Hubspot
