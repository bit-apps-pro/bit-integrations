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
import LemlistAuthorization from './LemlistAuthorization'
import { checkMappedFields } from './LemlistCommonFunc'
import LemlistIntegLayout from './LemlistIntegLayout'

function Lemlist({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setstep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [lemlistConf, setLemlistConf] = useState({
    name: 'Lemlist',
    type: 'Lemlist',
    api_key: '',
    field_map: [{ formField: '', lemlistField: '' }],
    actions: {}
  })

  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)
    if (val === 3) {
      if (!checkMappedFields(lemlistConf)) {
        setSnackbar({
          show: true,
          msg: __('Please map all required fields to continue.', 'bit-integrations')
        })
        return
      }
      if (!lemlistConf?.campaignId) {
        setSnackbar({ show: true, msg: __('Please select list to continue.', 'bit-integrations') })
        return
      }
      if (lemlistConf.name !== '' && lemlistConf.field_map.length > 0) {
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

      <LemlistAuthorization
        formID={formID}
        lemlistConf={lemlistConf}
        setLemlistConf={setLemlistConf}
        step={step}
        setstep={setstep}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />
      <div className="btcd-stp-page" style={{ width: step === 2 && 900, height: step === 2 && 'auto' }}>
        <LemlistIntegLayout
          formID={formID}
          formFields={formFields}
          lemlistConf={lemlistConf}
          setLemlistConf={setLemlistConf}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
        />
        <button
          onClick={() => nextPage(3)}
          disabled={!lemlistConf?.campaignId || lemlistConf.field_map.length < 1}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')} &nbsp;
          <BackIcn className="ml-1 rev-icn" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveIntegConfig(flow, setFlow, allIntegURL, lemlistConf, navigate, '', '', setIsLoading)
        }
        isLoading={isLoading}
        dataConf={lemlistConf}
        setDataConf={setLemlistConf}
        formFields={formFields}
      />
    </div>
  )
}

export default Lemlist
