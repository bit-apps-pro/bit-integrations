import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import FreshBooksAuthorization from './FreshBooksAuthorization'
import { checkMappedFields } from './FreshBooksCommonFunc'
import FreshBooksIntegLayout from './FreshBooksIntegLayout'

function FreshBooks({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setstep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const [freshBooksConf, setFreshBooksConf] = useState({
    name: 'FreshBooks',
    type: 'FreshBooks',
    access_token: '',
    account_id: '',
    business_id: '',
    mainAction: '',
    field_map: [{ formField: '', freshBooksField: '' }]
  })

  const saveConfig = () => {
    saveActionConf({
      flow,
      setFlow,
      allIntegURL,
      conf: freshBooksConf,
      navigate,
      setIsLoading,
      setSnackbar
    })
  }

  const nextPage = pageNo => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (!checkMappedFields(freshBooksConf)) {
      setSnackbar({ show: true, msg: __('Please select an action', 'bit-integrations') })
      return
    }

    freshBooksConf.mainAction && freshBooksConf.field_map.length > 0 && setstep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <FreshBooksAuthorization
        formID={formID}
        freshBooksConf={freshBooksConf}
        setFreshBooksConf={setFreshBooksConf}
        step={step}
        setstep={setstep}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <FreshBooksIntegLayout
          formID={formID}
          formFields={formFields}
          freshBooksConf={freshBooksConf}
          setFreshBooksConf={setFreshBooksConf}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
        />

        <button
          onClick={() => nextPage(3)}
          disabled={!freshBooksConf.mainAction || freshBooksConf.field_map.length < 1}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() => saveConfig()}
        isLoading={isLoading}
        dataConf={freshBooksConf}
        setDataConf={setFreshBooksConf}
        formFields={formFields}
      />
    </div>
  )
}

export default FreshBooks
