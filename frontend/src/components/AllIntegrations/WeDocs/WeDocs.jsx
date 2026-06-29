import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import WeDocsAuthorization from './WeDocsAuthorization'
import { checkMappedFields } from './WeDocsCommonFunc'
import WeDocsIntegLayout from './WeDocsIntegLayout'

export default function WeDocs({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [weDocsConf, setWeDocsConf] = useState({
    name: 'weDocs',
    type: 'weDocs',
    field_map: [],
    weDocsFields: [],
    actions: {},
    mainAction: '',
    selectedDocumentationId: '',
    selectedSectionId: '',
    documentations: [],
    sections: []
  })

  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (val === 3) {
      if (!checkMappedFields(weDocsConf)) {
        setSnackbar({
          show: true,
          msg: __('Please complete all required fields to continue.', 'bit-integrations')
        })
        return
      }

      if (weDocsConf.name !== '') {
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

      <WeDocsAuthorization
        formID={formID}
        weDocsConf={weDocsConf}
        setWeDocsConf={setWeDocsConf}
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
        <WeDocsIntegLayout
          formID={formID}
          formFields={formFields}
          weDocsConf={weDocsConf}
          setWeDocsConf={setWeDocsConf}
          setSnackbar={setSnackbar}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
        />
        <br />
        <br />
        <br />
        <button
          onClick={() => nextPage(3)}
          disabled={!weDocsConf.mainAction || !checkMappedFields(weDocsConf)}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          <BackIcn className="ml-1 rev-icn" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveIntegConfig(flow, setFlow, allIntegURL, weDocsConf, navigate, '', '', setIsLoading)
        }
        isLoading={isLoading}
        dataConf={weDocsConf}
        setDataConf={setWeDocsConf}
        formFields={formFields}
      />
    </div>
  )
}
