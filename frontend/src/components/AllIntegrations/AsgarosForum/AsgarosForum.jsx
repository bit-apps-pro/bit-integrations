import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import AsgarosForumAuthorization from './AsgarosForumAuthorization'
import { checkMappedFields } from './AsgarosForumCommonFunc'
import AsgarosForumIntegLayout from './AsgarosForumIntegLayout'

export default function AsgarosForum({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [asgarosForumConf, setAsgarosForumConf] = useState({
    name: 'Asgaros Forum',
    type: 'Asgaros Forum',
    field_map: [],
    asgarosForumFields: [],
    actions: {},
    mainAction: ''
  })

  const nextPage = val => {
    setTimeout(() => {
      const settingsWrapper = document.getElementById('btcd-settings-wrp')
      if (settingsWrapper) settingsWrapper.scrollTop = 0
    }, 300)

    if (val === 3) {
      if (!checkMappedFields(asgarosForumConf)) {
        setSnackbar({
          show: true,
          msg: __('Please complete all required fields to continue.', 'bit-integrations')
        })
        return
      }

      if (asgarosForumConf.name !== '') {
        setStep(val)
      }
      return
    }

    setStep(val)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2" />

      <AsgarosForumAuthorization
        formID={formID}
        asgarosForumConf={asgarosForumConf}
        setAsgarosForumConf={setAsgarosForumConf}
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
          minHeight: step === 2 && `${500}px`
        }}>
        <AsgarosForumIntegLayout
          formID={formID}
          formFields={formFields}
          asgarosForumConf={asgarosForumConf}
          setAsgarosForumConf={setAsgarosForumConf}
          setSnackbar={setSnackbar}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
        />
        <br />
        <br />
        <br />
        <button
          onClick={() => nextPage(3)}
          disabled={!asgarosForumConf.mainAction || !checkMappedFields(asgarosForumConf)}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          <BackIcn className="ml-1 rev-icn" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveIntegConfig(flow, setFlow, allIntegURL, asgarosForumConf, navigate, '', '', setIsLoading)
        }
        isLoading={isLoading}
        dataConf={asgarosForumConf}
        setDataConf={setAsgarosForumConf}
        formFields={formFields}
      />
    </div>
  )
}
