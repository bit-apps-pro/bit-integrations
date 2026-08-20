/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import GoogleContactsAuthorization from './GoogleContactsAuthorization'
import { checkMappedFields } from './GoogleContactsCommonFunc'
import GoogleContactsIntegLayout from './GoogleContactsIntegLayout'

function GoogleContacts({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { flowID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const allActions = [
    { key: '1', label: __('Create a contact', 'bit-integrations') },
    { key: '2', label: __('Update a contact', 'bit-integrations') }
  ]

  const defaultContactsFields = [
    { key: 'phoneNumber', label: __('Phone Number', 'bit-integrations'), required: true },
    { key: 'name', label: __('First Name', 'bit-integrations'), required: true },
    { key: 'lastName', label: __('Last Name', 'bit-integrations'), required: true },
    { key: 'biographies', label: __('Biographies', 'bit-integrations'), required: false },
    { key: 'nickname', label: __('Nickname', 'bit-integrations'), required: false },
    { key: 'city', label: __('City', 'bit-integrations'), required: false },
    { key: 'country', label: __('Country', 'bit-integrations'), required: false },
    { key: 'locations', label: __('Locations', 'bit-integrations'), required: false },
    { key: 'email', label: __('Email', 'bit-integrations'), required: false },
    { key: 'occupation', label: __('Occupation', 'bit-integrations'), required: false },
    { key: 'organization', label: __('Organization', 'bit-integrations'), required: false }
  ]

  const [googleContactsConf, setGoogleContactsConf] = useState({
    name: 'Google Contacts',
    type: 'Google Contacts',
    mainAction: '',
    clientId: '',
    clientSecret: '',
    field_map: [{ formField: '', googleContactsFormField: '' }],
    default: defaultContactsFields,
    allActions,
    actions: {}
  })

  const saveConfig = () => {
    saveActionConf({
      flow,
      setFlow,
      allIntegURL,
      conf: googleContactsConf,
      navigate,
      setIsLoading,
      setSnackbar
    })
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      {/* STEP 1 */}
      <GoogleContactsAuthorization
        flowID={flowID}
        googleContactsConf={googleContactsConf}
        setGoogleContactsConf={setGoogleContactsConf}
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
        <GoogleContactsIntegLayout
          flowID={flowID}
          formFields={formFields}
          googleContactsConf={googleContactsConf}
          setGoogleContactsConf={setGoogleContactsConf}
        />
      </div>

      {/* STEP 3 */}
      <IntegrationStepThree
        step={step}
        saveConfig={() => saveConfig()}
        isLoading={isLoading}
        dataConf={googleContactsConf}
        setDataConf={setGoogleContactsConf}
        formFields={formFields}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <button
          onClick={() => setStep(3)}
          disabled={
            !checkMappedFields(googleContactsConf?.field_map) ||
            googleContactsConf.mainAction === '' ||
            isLoading
          }
          className="btn ml-auto btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
        </button>
      </div>
    </div>
  )
}

export default GoogleContacts
