import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import ConstantContactAuthorization from './ConstantContactAuthorization'
import {
  checkAddressFieldMapRequired,
  handleInput,
  checkMappedFields,
  generateMappedField
} from './ConstantContactCommonFunc'
import ConstantContactIntegLayout from './ConstantContactIntegLayout'

function ConstantContact({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const [isLoading, setIsLoading] = useState({
    auth: false,
    list: false,
    tag: false,
    update: false
  })
  const [step, setstep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const constantContactFields = [
    {
      key: 'email_address',
      label: __('Email', 'bit-integrations'),
      required: true
    },
    {
      key: 'first_name',
      label: __('First Name', 'bit-integrations'),
      required: false
    },
    {
      key: 'last_name',
      label: __('Last Name', 'bit-integrations'),
      required: false
    },
    {
      key: 'job_title',
      label: __('Job Title', 'bit-integrations'),
      required: false
    },
    {
      key: 'company_name',
      label: __('Company Name', 'bit-integrations'),
      required: false
    },
    {
      key: 'phone_number',
      label: __('Phone Number', 'bit-integrations'),
      required: false
    },
    {
      key: 'anniversary',
      label: __('Anniversary', 'bit-integrations'),
      required: false
    },
    {
      key: 'birthday_month',
      label: __('Birthday Month', 'bit-integrations'),
      required: false
    },
    {
      key: 'birthday_day',
      label: __('Birthday Day', 'bit-integrations'),
      required: false
    }
  ]
  const [constantContactConf, setConstantContactConf] = useState({
    name: 'ConstantContact',
    type: 'ConstantContact',
    clientId: '',
    clientSecret: '',
    list_ids: '',
    lists: [],
    default: { constantContactFields },
    source_type: '',
    tag_ids: '',
    tags: [],
    field_map: generateMappedField(constantContactFields),
    address_type: '',
    address_field: [],
    phone_type: '',
    phone_field: [],
    actions: {}
  })

  const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)
    if (constantContactConf.actions?.address && !checkAddressFieldMapRequired(constantContactConf)) {
      setSnackbar({
        show: true,
        msg: __('Please map address required fields to continue.', 'bit-integrations')
      })
      return
    }
    if (!checkMappedFields(constantContactConf)) {
      setSnackbar({ show: true, msg: __('Please map fields to continue.', 'bit-integrations') })
      return
    }
    setstep(3)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      {/* STEP 1 */}
      <ConstantContactAuthorization
        constantContactConf={constantContactConf}
        setConstantContactConf={setConstantContactConf}
        step={step}
        setstep={setstep}
      />

      {/* STEP 2 */}
      <div className="btcd-stp-page" style={{ width: step === 2 && 900, height: step === 2 && 'auto' }}>
        <ConstantContactIntegLayout
          id={id}
          formFields={formFields}
          handleInput={e =>
            handleInput(e, constantContactConf, setConstantContactConf, id, setIsLoading, setSnackbar)
          }
          constantContactConf={constantContactConf}
          setConstantContactConf={setConstantContactConf}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
        />
        <button
          onClick={() => nextPage(3)}
          disabled={constantContactConf?.source_type === '' || constantContactConf.field_map.length < 1}
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
            conf: constantContactConf,
            setIsLoading,
            setSnackbar
          })
        }
        // eslint-disable-next-line no-unneeded-ternary
        isLoading={isLoading === true ? true : false}
        dataConf={constantContactConf}
        setDataConf={setConstantContactConf}
        formFields={formFields}
      />
    </div>
  )
}

export default ConstantContact
