import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import { isUserSourceIncomplete } from '../IntegrationHelpers/userSource'
import WPCoursewareAuthorization from './WPCoursewareAuthorization'
import WPCoursewareIntegLayout from './WPCoursewareIntegLayout'

export default function WPCourseware({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [wpCoursewareConf, setWPCoursewareConf] = useState({
    name: 'WP Courseware',
    type: 'WP Courseware',
    field_map: [{ formField: '', wpCoursewareField: '' }],
    default: {},
    action: '',
    course: [],
    actions: {}
  })

  const nextPage = val => {
    if (val === 2 && wpCoursewareConf.name !== '') {
      setStep(val)
    } else if (val === 3 && wpCoursewareConf.action !== '' && wpCoursewareConf.course.length > 0) {
      setStep(val)
    }

    document.getElementById('btcd-settings-wrp').scrollTop = 0
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <WPCoursewareAuthorization
        formID={formID}
        wpCoursewareConf={wpCoursewareConf}
        setWPCoursewareConf={setWPCoursewareConf}
        step={step}
        nextPage={nextPage}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{
          overflow: step === 2 && 'initial',
          width: step === 2 && 900,
          height: step === 2 && 'auto',
          minHeight: step === 2 && '500px'
        }}>
        <WPCoursewareIntegLayout
          formID={formID}
          formFields={formFields}
          wpCoursewareConf={wpCoursewareConf}
          setWPCoursewareConf={setWPCoursewareConf}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
        />
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveActionConf({
            flow,
            setFlow,
            allIntegURL,
            conf: wpCoursewareConf,
            navigate,
            setIsLoading,
            setSnackbar
          })
        }
        isLoading={isLoading}
        dataConf={wpCoursewareConf}
        setDataConf={setWPCoursewareConf}
        formFields={formFields}
      />

      <div
        className="btcd-stp-page"
        style={{
          width: step === 2 && 900,
          height: step === 2 && 'auto',
          minHeight: step === 2 && '500px'
        }}>
        <button
          onClick={() => nextPage(3)}
          disabled={
            wpCoursewareConf.action === '' ||
            wpCoursewareConf.course.length === 0 ||
            isUserSourceIncomplete(wpCoursewareConf)
          }
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          <BackIcn className="ml-1 rev-icn" />
        </button>
      </div>
    </div>
  )
}
