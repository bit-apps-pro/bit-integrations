import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import MailChimpAuthorization from './MailChimpAuthorization'
import {
  checkAddressFieldMapRequired,
  handleInput,
  checkMappedFields
} from './MailChimpCommonFunc'
import MailChimpIntegLayout from './MailChimpIntegLayout'

function MailChimp({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({})
  const [step, setstep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [mailChimpConf, setMailChimpConf] = useState({
    name: 'Mail Chimp',
    type: 'Mail Chimp',
    clientId: '',
    clientSecret: '',
    listId: '',
    listName: '',
    tags: '',
    field_map: [{ formField: '', mailChimpField: '' }],
    address_field: [],
    module: '',
    actions: {},
    moduleLists: []
  })

  const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)
    if (mailChimpConf.actions?.address && !checkAddressFieldMapRequired(mailChimpConf)) {
      setSnackbar({
        show: true,
        msg: __('Please map address required fields to continue.', 'bit-integrations')
      })
      return
    }
    if (!checkMappedFields(mailChimpConf)) {
      setSnackbar({ show: true, msg: __('Please map fields to continue.', 'bit-integrations') })
      return
    }
    if (mailChimpConf.listId !== '') {
      setstep(3)
    }
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      {/* STEP 1 */}
      <MailChimpAuthorization
        formID={formID}
        mailChimpConf={mailChimpConf}
        setMailChimpConf={setMailChimpConf}
        step={step}
        setstep={setstep}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      {/* STEP 2 */}
      <div className="btcd-stp-page" style={{ width: step === 2 && 900, height: step === 2 && 'auto' }}>
        <MailChimpIntegLayout
          formID={formID}
          formFields={formFields}
          handleInput={e =>
            handleInput(
              e,
              mailChimpConf,
              setMailChimpConf,
              formID,
              loading,
              setLoading,
              setSnackbar,
              setIsLoading
            )
          }
          mailChimpConf={mailChimpConf}
          setMailChimpConf={setMailChimpConf}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
          loading={loading}
          setLoading={setLoading}
        />
        <button
          onClick={() => nextPage(3)}
          disabled={!mailChimpConf.listId || mailChimpConf.field_map.length < 1}
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
          saveActionConf({
            flow,
            setFlow,
            allIntegURL,
            navigate,
            conf: mailChimpConf,
            setIsLoading,
            setSnackbar
          })
        }
        isLoading={isLoading}
        dataConf={mailChimpConf}
        setDataConf={setMailChimpConf}
        formFields={formFields}
      />
    </div>
  )
}

export default MailChimp
