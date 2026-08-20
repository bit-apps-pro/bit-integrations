// eslint-disable-next-line import/no-extraneous-dependencies
import { __ } from '../../../Utils/i18nwrap'
import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import DirectIqAuthorization from './DirectIqAuthorization'
import { checkMappedFields } from './DirectIqCommonFunc'
import DirectIqIntegLayout from './DirectIqIntegLayout'

function DirectIq({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setstep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [directIqConf, setDirectIqConf] = useState({
    name: 'DirectIq',
    type: 'DirectIq',
    client_id: '',
    client_secret: '',
    field_map: [{ formField: '', directIqField: '' }],
    actions: {}
  })

  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)
    if (val === 3) {
      if (!checkMappedFields(directIqConf)) {
        setSnackbar({
          show: true,
          msg: __('Please map all required fields to continue.', 'bit-integrations')
        })
        return
      }
      if (!directIqConf?.listId) {
        setSnackbar({ show: true, msg: __('Please select list to continue.', 'bit-integrations') })
        return
      }
      if (directIqConf.name !== '' && directIqConf.field_map.length > 0) {
        setstep(3)
      }
    }
  }
  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <DirectIqAuthorization
        formID={formID}
        directIqConf={directIqConf}
        setDirectIqConf={setDirectIqConf}
        step={step}
        setstep={setstep}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />
      <div className="btcd-stp-page" style={{ width: step === 2 && 900, height: step === 2 && 'auto' }}>
        <DirectIqIntegLayout
          formID={formID}
          formFields={formFields}
          directIqConf={directIqConf}
          setDirectIqConf={setDirectIqConf}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
        />
        <button
          onClick={() => nextPage(3)}
          disabled={!directIqConf?.listId || directIqConf.field_map.length < 1}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')} &nbsp;
          <BackIcn className="ml-1 rev-icn" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveIntegConfig(flow, setFlow, allIntegURL, directIqConf, navigate, '', '', setIsLoading)
        }
        isLoading={isLoading}
        dataConf={directIqConf}
        setDataConf={setDirectIqConf}
        formFields={formFields}
      />
    </div>
  )
}

export default DirectIq
