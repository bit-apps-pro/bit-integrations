import { useEffect, useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import AcumbamailAuthorization from './AcumbamailAuthorization'
import { handleInput, checkMappedFields } from './AcumbamailCommonFunc'
import AcumbamailIntegLayout from './AcumbamailIntegLayout'
import Note from '../../Utilities/Note'

function Acumbamail({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setstep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const allActions = [
    { key: '1', label: __('Add/Update Subscriber', 'bit-integrations') },
    { key: '2', label: __('Delete Subscriber', 'bit-integrations') }
  ]

  const addSubsCriberFields = [{ key: 'email', label: 'Email', required: true }]
  const [acumbamailConf, setAcumbamailConf] = useState({
    name: 'Acumbamail',
    type: 'Acumbamail',
    mainAction: '',
    listId: '',
    auth_token: '',
    field_map: [{ formField: '', acumbamailFormField: 'EMAIL' }],
    addSubsCriberFields,
    allActions,
    address_field: [],
    actions: {}
  })
  const ActiveInstructions = `
  <h4>${__(
    'This integration can only be accessed by the payed users of Acumbamail',
    'bit-integrations'
  )}</h4>`

  const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)
    if (!checkMappedFields(acumbamailConf)) {
      setSnackbar({ show: true, msg: __('Please map fields to continue.', 'bit-integrations') })
      return
    }
    if (acumbamailConf.listId !== '') {
      setstep(3)
    }
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <AcumbamailAuthorization
        formID={formID}
        acumbamailConf={acumbamailConf}
        setAcumbamailConf={setAcumbamailConf}
        step={step}
        setstep={setstep}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <AcumbamailIntegLayout
          formFields={formFields}
          handleInput={e =>
            handleInput(e, acumbamailConf, setAcumbamailConf, setIsLoading, setSnackbar, formID)
          }
          acumbamailConf={acumbamailConf}
          setAcumbamailConf={setAcumbamailConf}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
        />

        <button
          onClick={() => nextPage(3)}
          disabled={!acumbamailConf.mainAction || !checkMappedFields(acumbamailConf)}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')} &nbsp;
          <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
        </button>
      </div>
      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveActionConf({
            flow,
            setFlow,
            allIntegURL,
            navigate,
            conf: acumbamailConf,
            setIsLoading,
            setSnackbar
          })
        }
        isLoading={isLoading}
        dataConf={acumbamailConf}
        setDataConf={setAcumbamailConf}
        formFields={formFields}
      />
      <Note note={ActiveInstructions} />
    </div>
  )
}

export default Acumbamail
