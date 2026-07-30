/* eslint-disable no-console */
import { useState } from 'react'
import toast from 'react-hot-toast'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import MailupAuthorization from './MailupAuthorization'
import { handleInput, checkMappedFields } from './MailupCommonFunc'
import MailupIntegLayout from './MailupIntegLayout'

function Mailup({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const [mailupConf, setMailupConf] = useState({
    name: 'Mailup',
    type: 'Mailup',
    clientId: '',
    clientSecret: '',
    allList: [],
    allGroup: [],
    listId: '',
    groupId: '',
    field_map: [{ formField: '', mailupFormField: '' }],
    staticFields: [],
    actions: {}
  })

  const nextPage = pageNo => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (!checkMappedFields(mailupConf)) {
      toast.error(__('Please map mandatory fields', 'bit-integrations'))
      return
    }
    // eslint-disable-next-line no-unused-expressions
    mailupConf.field_map.length > 0 && setStep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      {/* STEP 1 */}
      <MailupAuthorization
        formID={formID}
        mailupConf={mailupConf}
        setMailupConf={setMailupConf}
        step={step}
        setStep={setStep}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      {/* STEP 2 */}
      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <MailupIntegLayout
          formFields={formFields}
          handleInput={e => handleInput(e, mailupConf, setMailupConf, setIsLoading, setSnackbar)}
          mailupConf={mailupConf}
          setMailupConf={setMailupConf}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
        />

        {mailupConf.listId && (
          <button
            onClick={() => nextPage(3)}
            disabled={!mailupConf?.listId || !checkMappedFields(mailupConf)}
            className="btn f-right btcd-btn-lg purple sh-sm flx"
            type="button">
            {__('Next', 'bit-integrations')} &nbsp;
            <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
          </button>
        )}
      </div>
      {/* STEP 3 */}
      {mailupConf.listId && (
        <IntegrationStepThree
          step={step}
          saveConfig={() =>
            saveActionConf({
              flow,
              setFlow,
              allIntegURL,
              navigate,
              conf: mailupConf,
              setIsLoading,
              setSnackbar
            })
          }
          isLoading={isLoading}
          dataConf={mailupConf}
          setDataConf={setMailupConf}
          formFields={formFields}
        />
      )}
    </div>
  )
}

export default Mailup
