/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate } from 'react-router'
import toast from 'react-hot-toast'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import RestrictContentAuthorization from './RestrictContentAuthorization'
import RestrictContentIntegLayout from './RestrictContentIntegLayout'
import { checkMappedFields, handleInput } from './RestrictContentCommonFunc'

function RestrictContent({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const memberFields = [
    { key: 'user_login', label: __('User Name', 'bit-integrations'), required: true },
    { key: 'user_email', label: __('Email', 'bit-integrations'), required: true },
    { key: 'user_pass', label: __('User Password', 'bit-integrations'), required: false },
    { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
    { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false },
    { key: 'company', label: __('Company', 'bit-integrations'), required: false },
    { key: 'address1', label: __('Address Line 1', 'bit-integrations'), required: false },
    { key: 'address2', label: __('Address Line 2', 'bit-integrations'), required: false },
    { key: 'city', label: __('City', 'bit-integrations'), required: false },
    { key: 'state', label: __('State', 'bit-integrations'), required: false },
    { key: 'zip', label: __('Zip', 'bit-integrations'), required: false },
    { key: 'country', label: __('Country', 'bit-integrations'), required: false }
  ]

  const actionLists = [
    { key: 'add-member-level', label: __('Add the user to a level', 'bit-integrations') },
    { key: 'remove-member-level', label: __('Remove the user to a level', 'bit-integrations') }
  ]

  const [restrictConf, setRestrictConf] = useState({
    name: 'Restrict Content',
    type: 'RestrictContent',
    field_map: [{ formField: '', restrictField: '' }],
    exp_date: '',
    memberFields,
    actionLists,
    actions: {}
  })

  const saveConfig = () => {
    setIsLoading(true)
    const resp = saveActionConf({
      flow,
      setFlow,
      allIntegURL,
      conf: restrictConf,
      navigate,
      setIsLoading,
      setSnackbar
    })
  }
  const nextPage = pageNo => {
    restrictConf.field_map.length > 0 && setStep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>


      <RestrictContentAuthorization
        restrictConf={restrictConf}
        setRestrictConf={setRestrictConf}
        step={step}
        setStep={setStep}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <RestrictContentIntegLayout
          formFields={formFields}
          handleInput={e => handleInput(e, restrictConf, setRestrictConf, setIsLoading, setSnackbar)}
          restrictConf={restrictConf}
          setRestrictConf={setRestrictConf}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
        />

        <button
          onClick={() => nextPage(3)}
          disabled={!restrictConf?.level_id && !restrictConf?.member_id}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')} &nbsp;
          <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() => saveConfig()}
        isLoading={isLoading}
        dataConf={restrictConf}
        setDataConf={setRestrictConf}
        formFields={formFields}
      />
    </div>
  )
}

export default RestrictContent
