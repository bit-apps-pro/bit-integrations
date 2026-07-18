import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import BadgeOSAuthorization from './BadgeOSAuthorization'
import { checkMappedFields } from './BadgeOSCommonFunc'
import BadgeOSIntegLayout from './BadgeOSIntegLayout'
import { needsAchievement } from './staticData'

export default function BadgeOS({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [badgeOSConf, setBadgeOSConf] = useState({
    name: 'BadgeOS',
    type: 'BadgeOS',
    field_map: [{ formField: '', badgeOSField: '' }],
    actions: {},
    mainAction: ''
  })

  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (val === 3) {
      if (needsAchievement.includes(badgeOSConf.mainAction) && !badgeOSConf?.selectedAchievement) {
        setSnackbar({
          show: true,
          msg: __('Please select an achievement to continue.', 'bit-integrations')
        })
        return
      }

      if (!checkMappedFields(badgeOSConf)) {
        setSnackbar({
          show: true,
          msg: __('Please map all required fields to continue.', 'bit-integrations')
        })
        return
      }

      if (badgeOSConf.name !== '' && badgeOSConf.field_map.length > 0) {
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

      {/* STEP 1 */}
      <BadgeOSAuthorization
        formID={formID}
        badgeOSConf={badgeOSConf}
        setBadgeOSConf={setBadgeOSConf}
        step={step}
        nextPage={nextPage}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      {/* STEP 2 */}
      <div
        className="btcd-stp-page"
        style={{
          width: step === 2 && 900,
          height: step === 2 && 'auto',
          minHeight: step === 2 && '500px'
        }}>
        <BadgeOSIntegLayout
          formID={formID}
          formFields={formFields}
          badgeOSConf={badgeOSConf}
          setBadgeOSConf={setBadgeOSConf}
          setSnackbar={setSnackbar}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
        />
        <br />
        <br />
        <br />
        <button
          onClick={() => nextPage(3)}
          disabled={badgeOSConf.field_map.length < 1}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          <BackIcn className="ml-1 rev-icn" />
        </button>
      </div>

      {/* STEP 3 */}
      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveIntegConfig(flow, setFlow, allIntegURL, badgeOSConf, navigate, '', '', setIsLoading)
        }
        isLoading={isLoading}
        dataConf={badgeOSConf}
        setDataConf={setBadgeOSConf}
        formFields={formFields}
      />
    </div>
  )
}
