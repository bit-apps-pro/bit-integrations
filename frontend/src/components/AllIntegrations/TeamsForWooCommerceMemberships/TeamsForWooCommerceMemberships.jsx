import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import TeamsForWooCommerceMembershipsAuthorization from './TeamsForWooCommerceMembershipsAuthorization'
import { checkMappedFields } from './TeamsForWooCommerceMembershipsCommonFunc'
import TeamsForWooCommerceMembershipsIntegLayout from './TeamsForWooCommerceMembershipsIntegLayout'

export default function TeamsForWooCommerceMemberships({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [teamsForWcConf, setTeamsForWcConf] = useState({
    name: 'Teams For WooCommerce Memberships',
    type: 'Teams For WooCommerce Memberships',
    field_map: [{ formField: '', teamsForWooCommerceMembershipsField: '' }],
    mainAction: ''
  })

  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (val === 3) {
      if (!checkMappedFields(teamsForWcConf)) {
        setSnackbar({
          show: true,
          msg: __('Please map all required fields to continue.', 'bit-integrations')
        })
        return
      }

      if (teamsForWcConf.name !== '' && teamsForWcConf.field_map.length > 0) {
        setStep(val)
      }
    } else {
      setStep(val)
    }
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2"></div>

      <TeamsForWooCommerceMembershipsAuthorization
        formID={formID}
        teamsForWcConf={teamsForWcConf}
        setTeamsForWcConf={setTeamsForWcConf}
        step={step}
        nextPage={nextPage}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{
          width: step === 2 && 900,
          height: step === 2 && 'auto',
          minHeight: step === 2 && '500px'
        }}>
        <TeamsForWooCommerceMembershipsIntegLayout
          formID={formID}
          formFields={formFields}
          teamsForWcConf={teamsForWcConf}
          setTeamsForWcConf={setTeamsForWcConf}
          setSnackbar={setSnackbar}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
        />
        <br />
        <br />
        <br />
        <button
          onClick={() => nextPage(3)}
          disabled={teamsForWcConf.field_map.length < 1}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          <BackIcn className="ml-1 rev-icn" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveIntegConfig(flow, setFlow, allIntegURL, teamsForWcConf, navigate, '', '', setIsLoading)
        }
        isLoading={isLoading}
        dataConf={teamsForWcConf}
        setDataConf={setTeamsForWcConf}
        formFields={formFields}
      />
    </div>
  )
}
