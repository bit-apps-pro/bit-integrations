import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import ProfilePressAuthorization from './ProfilePressAuthorization'
import { checkMappedFields, validateProfilePressConf } from './ProfilePressCommonFunc'
import ProfilePressIntegLayout from './ProfilePressIntegLayout'

export default function ProfilePress({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [profilePressConf, setProfilePressConf] = useState({
    name: 'ProfilePress',
    type: 'ProfilePress',
    field_map: [{ formField: '', profilePressField: '' }],
    actions: {},
    mainAction: ''
  })

  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (val === 3) {
      const selectionError = validateProfilePressConf(profilePressConf)

      if (selectionError) {
        setSnackbar({ show: true, msg: selectionError })
        return
      }

      if (!checkMappedFields(profilePressConf)) {
        setSnackbar({
          show: true,
          msg: __('Please map all required fields to continue.', 'bit-integrations')
        })
        return
      }

      if (profilePressConf.name !== '' && profilePressConf.field_map.length > 0) {
        setStep(val)
      }
    } else {
      setStep(val)
    }
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2" />

      <ProfilePressAuthorization
        formID={formID}
        profilePressConf={profilePressConf}
        setProfilePressConf={setProfilePressConf}
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
        <ProfilePressIntegLayout
          formID={formID}
          formFields={formFields}
          profilePressConf={profilePressConf}
          setProfilePressConf={setProfilePressConf}
          setSnackbar={setSnackbar}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
        />
        <br />
        <br />
        <br />
        <button
          onClick={() => nextPage(3)}
          disabled={profilePressConf.field_map.length < 1}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          <BackIcn className="ml-1 rev-icn" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveIntegConfig(flow, setFlow, allIntegURL, profilePressConf, navigate, '', '', setIsLoading)
        }
        isLoading={isLoading}
        dataConf={profilePressConf}
        setDataConf={setProfilePressConf}
        formFields={formFields}
      />
    </div>
  )
}
