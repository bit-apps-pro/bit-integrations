/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate } from 'react-router'
import toast from 'react-hot-toast'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import OmniSendAuthorization from './OmniSendAuthorization'
import { checkMappedFields, generateMappedField, handleInput } from './OmniSendCommonFunc'
import OmniSendIntegLayout from './OmniSendIntegLayout'

function OmniSend({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({
    channel: false,
    field: false,
    auth: false
  })

  const [step, setstep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const omniSendFields = [
    {
      key: 'email',
      label: __('Email', 'bit-integrations'),
      required: false
    },
    {
      key: 'phone_number',
      label: __('Phone Number', 'bit-integrations'),
      required: false
    },
    {
      key: 'firstName',
      label: __('First Name', 'bit-integrations'),
      required: false
    },
    {
      key: 'lastName',
      label: __('Last Name', 'bit-integrations'),
      required: false
    },
    {
      key: 'country',
      label: __('Country', 'bit-integrations'),
      required: false
    },

    {
      key: 'countryCode',
      label: __('Country Code', 'bit-integrations'),
      required: false
    },
    {
      key: 'state',
      label: __('State', 'bit-integrations'),
      required: false
    },
    {
      key: 'city',
      label: __('City', 'bit-integrations'),
      required: false
    },
    {
      key: 'address',
      label: __('Address', 'bit-integrations'),
      required: false
    },
    {
      key: 'postalCode',
      label: __('Postal Code', 'bit-integrations'),
      required: false
    },
    {
      key: 'gender',
      label: __('Gender', 'bit-integrations'),
      required: false
    },
    {
      key: 'birthdate',
      label: __('Birth Date', 'bit-integrations'),
      required: false
    }
  ]
  const [omniSendConf, setOmniSendConf] = useState({
    name: 'OmniSend',
    type: 'OmniSend',
    api_key: '',
    field_map: generateMappedField(omniSendFields),
    custom_field_map: [{ formField: '', omniSendFormField: '' }],
    channels: '',
    channel_types: [],
    email_status: '',
    sms_status: '',
    omniSend_fields: omniSendFields,
    actions: {}
  })

  const saveConfig = () => {
    setIsLoading(true)
    const resp = saveIntegConfig(
      flow,
      setFlow,
      allIntegURL,
      omniSendConf,
      navigate,
      '',
      '',
      setIsLoading
    )
    resp.then(res => {
      if (res.success) {
        toast.success(res.data?.msg)
        navigate(allIntegURL)
      } else {
        toast.error(res.data || res)
      }
    })
  }
  const nextPage = pageNo => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (!checkMappedFields(omniSendConf)) {
      toast.error(__('Please map mandatory fields', 'bit-integrations'))
      return
    }
    omniSendConf.field_map.length > 0 && setstep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <OmniSendAuthorization
        omniSendConf={omniSendConf}
        setOmniSendConf={setOmniSendConf}
        step={step}
        setstep={setstep}
        loading={loading}
        setLoading={setLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{
          ...(step === 2 && {
            width: 900,
            height: 'auto',
            overflow: 'visible'
          })
        }}>
        <OmniSendIntegLayout
          formFields={formFields}
          handleInput={e => handleInput(e, omniSendConf, setOmniSendConf, setLoading, setSnackbar)}
          omniSendConf={omniSendConf}
          setOmniSendConf={setOmniSendConf}
          loading={loading}
          setLoading={setLoading}
          setSnackbar={setSnackbar}
        />

        <button
          onClick={() => nextPage(3)}
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
        dataConf={omniSendConf}
        setDataConf={setOmniSendConf}
        formFields={formFields}
      />
    </div>
  )
}

export default OmniSend
